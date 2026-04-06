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

  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
  ];

  let lastError = "";
  for (const modelId of modelsToTry) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      console.log(`[AI FALLBACK] Trying Gemini model ${modelId}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${ENV.geminiApiKey}`;
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
        if (!aiText) throw new Error(`Empty response from ${modelId}`);
        console.log(`[AI FALLBACK SUCCESS] ${modelId} responded.`);
        return { choices: [{ message: { role: "model", content: aiText } }] };
      }

      const err = await response.json().catch(() => ({}));
      lastError = `${modelId} status ${response.status}: ${err?.error?.message || "Unknown"}`;
      console.warn(`[AI FALLBACK ERROR] ${lastError}`);
    } catch (err: any) {
      clearTimeout(timeout);
      lastError = err.name === "AbortError" ? `${modelId} timeout` : err.message;
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
