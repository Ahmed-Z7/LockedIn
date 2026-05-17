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

// --- Groq: Free tier, OpenAI-compatible, no billing required ---
async function invokeViaGroq(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.groqApiKey) throw new Error("GROQ_API_KEY is not configured");

  const messages = params.messages.map(m => ({
    role: m.role === "model" ? "assistant" : m.role,
    content: m.content,
  }));

  const groqModels = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
  ];

  let lastError = "";
  for (const model of groqModels) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      console.log(`[AI GROQ] Trying ${model}...`);
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ENV.groqApiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 2048 }),
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error(`Empty response from ${model}`);
        console.log(`[AI GROQ SUCCESS] ${model} responded.`);
        return { choices: [{ message: { role: "assistant", content } }] };
      }

      let errBody: any = {};
      try { errBody = await response.json(); } catch {}
      lastError = `${model} error ${response.status}: ${errBody?.error?.message || "Unknown"}`;
      if (response.status === 429) { console.warn(`[AI GROQ SKIP] ${model} rate limited`); continue; }
      console.warn(`[AI GROQ ERROR] ${lastError}`);
    } catch (err: any) {
      clearTimeout(timeout);
      lastError = err.name === "AbortError" ? `${model} timeout` : err.message;
      console.warn(`[AI GROQ FAILURE] ${lastError}`);
    }
  }
  throw new Error(`All Groq models failed. Last: ${lastError}`);
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

  // All AI Studio keys must use v1beta endpoint
  const modelsToTry = [
    { id: "gemini-2.0-flash-lite", apiVersion: "v1beta" },
    { id: "gemini-2.0-flash",      apiVersion: "v1beta" },
    { id: "gemini-1.5-flash",      apiVersion: "v1beta" },
    { id: "gemini-1.5-flash-8b",   apiVersion: "v1beta" },
  ];

  let lastError = "";
  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
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

// --- Main entry point: Gemini → Groq → Forge ---
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  // 1. Try Gemini first (primary - fastest free tier)
  if (ENV.geminiApiKey) {
    try { return await invokeViaGemini(params); }
    catch (err: any) { console.warn(`[AI] Gemini failed: ${err.message}`); }
  }

  // 2. Try Groq (backup - free, OpenAI-compatible)
  if (ENV.groqApiKey) {
    try { return await invokeViaGroq(params); }
    catch (err: any) { console.warn(`[AI] Groq failed: ${err.message}`); }
  }

  // 3. Try Forge (enterprise, if configured)
  if (ENV.forgeApiUrl && ENV.forgeApiKey) {
    try { return await invokeViaForge(params); }
    catch (err: any) { console.warn(`[AI] Forge failed: ${err.message}`); }
  }

  throw new Error("No AI provider configured. Set GEMINI_API_KEY, GROQ_API_KEY, or VITE_FORGE_API_KEY.");
}
