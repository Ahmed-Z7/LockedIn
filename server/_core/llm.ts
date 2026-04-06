import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "model";

export type Message = {
  role: Role;
  content: string;
};

export type InvokeParams = {
  messages: Message[];
};

export type InvokeResult = {
  choices: Array<{
    message: {
      role: Role;
      content: string;
    };
  }>;
};

// --- Primary: Forge API (OpenAI-compatible, always available) ---
async function invokeViaForge(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    throw new Error("Forge API is not configured");
  }

  const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
  const url = new URL("v1/chat/completions", baseUrl).toString();

  // Normalize roles: Gemini uses "model", OpenAI uses "assistant"
  const messages = params.messages.map(m => ({
    role: m.role === "model" ? "assistant" : m.role,
    content: m.content,
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    console.log("[AI ATTEMPT] Invoking via Forge API...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ENV.forgeApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Forge API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Forge API returned empty content");

    console.log("[AI SUCCESS] Forge API responded successfully.");
    return {
      choices: [{ message: { role: "assistant", content } }],
    };
  } catch (err: any) {
    clearTimeout(timeout);
    throw new Error(err.name === "AbortError" ? "Forge API timeout after 30s" : err.message);
  }
}

// --- Fallback: Gemini API ---
async function invokeViaGemini(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.geminiApiKey) throw new Error("GEMINI_API_KEY is not configured");

  const systemMessage = params.messages.find(m => m.role === "system")?.content || "";
  const otherMessages = params.messages.filter(m => m.role !== "system");

  const contents = otherMessages.map((msg, index) => {
    let text = msg.content;
    if (index === 0 && systemMessage) {
      text = `[SYSTEM INSTRUCTION]\n${systemMessage}\n\n[USER REQUEST]\n${text}`;
    }
    return {
      role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
      parts: [{ text }],
    };
  });

  // Models with their correct API version
  const modelsToTry = [
    { id: "gemini-2.0-flash-lite", apiVersion: "v1beta" },
    { id: "gemini-2.0-flash",      apiVersion: "v1beta" },
    { id: "gemini-2.0-flash-exp",  apiVersion: "v1beta" },
    { id: "gemini-1.5-flash",      apiVersion: "v1" },
    { id: "gemini-1.5-pro",        apiVersion: "v1" },
  ];

  let lastError = "";
  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      console.log(`[AI FALLBACK] Trying Gemini model ${model.id} (${model.apiVersion})...`);
      const url = `https://generativelanguage.googleapis.com/${model.apiVersion}/models/${model.id}:generateContent?key=${ENV.geminiApiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, topP: 0.95, topK: 40, maxOutputTokens: 2048 },
        }),
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiText) throw new Error(`Empty response from ${model.id}`);
        console.log(`[AI FALLBACK SUCCESS] ${model.id} responded.`);
        return { choices: [{ message: { role: "model", content: aiText } }] };
      }

      // Parse error body
      let errBody: any = {};
      try { errBody = await response.json(); } catch {}
      const errMsg = errBody?.error?.message || "Unknown error";

      // 429 = quota/rate limit — skip to next model
      if (response.status === 429) {
        lastError = `${model.id} quota exceeded (429)`;
        console.warn(`[AI FALLBACK SKIP] ${lastError}`);
        continue;
      }

      // 404 = model not available — skip to next
      if (response.status === 404) {
        lastError = `${model.id} not found (404)`;
        console.warn(`[AI FALLBACK SKIP] ${lastError}`);
        continue;
      }

      lastError = `${model.id} error ${response.status}: ${errMsg}`;
      console.warn(`[AI FALLBACK ERROR] ${lastError}`);
    } catch (err: any) {
      clearTimeout(timeout);
      lastError = err.name === "AbortError" ? `${model.id} timeout` : err.message;
      console.warn(`[AI FALLBACK FAILURE] ${lastError}`);
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

// --- Main entry point ---
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  // Try Forge first (no quota issues), fall back to Gemini
  if (ENV.forgeApiUrl && ENV.forgeApiKey) {
    try {
      return await invokeViaForge(params);
    } catch (err: any) {
      console.warn(`[AI] Forge failed, falling back to Gemini. Reason: ${err.message}`);
    }
  }

  if (ENV.geminiApiKey) {
    try {
      return await invokeViaGemini(params);
    } catch (err: any) {
      throw new Error(`Neural Pulse Erratic: ${err.message}`);
    }
  }

  throw new Error("No AI provider is configured. Please set VITE_FORGE_API_KEY or GEMINI_API_KEY.");
}
