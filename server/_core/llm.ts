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

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured in Environment Variables");
  }

  const systemMessage = params.messages.find(m => m.role === "system")?.content || "";
  const otherMessages = params.messages.filter(m => m.role !== "system");

  const contents = otherMessages.map((msg, index) => {
    let text = msg.content;
    if (index === 0 && systemMessage) {
      text = `[SYSTEM INSTRUCTION]\n${systemMessage}\n\n[USER REQUEST]\n${text}`;
    }
    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text }]
    };
  });

  // Real stable Gemini models (April 2026)
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];

  let lastError = "";

  for (const modelId of modelsToTry) {
    try {
      console.log(`[AI ATTEMPT] invoking ${modelId}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${ENV.geminiApiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiText) {
          const finishReason = data.candidates?.[0]?.finishReason;
          console.warn(`[AI WARNING] Model ${modelId} returned no text. Reason: ${finishReason}`);
          throw new Error(`Empty response from ${modelId}`);
        }

        console.log(`[AI SUCCESS] ${modelId} responded successfully.`);
        return {
          choices: [{ message: { role: "model", content: aiText } }]
        };
      } else {
        const errorData = await response.json().catch(() => ({ error: { message: "Internal API Error" } }));
        lastError = `Status ${response.status}: ${errorData.error?.message || "Unknown error"}`;
        console.error(`[AI ERROR] ${modelId} failed:`, lastError);
      }
    } catch (err: any) {
      lastError = err.message;
      console.error(`[AI FETCH FAILURE] ${modelId}:`, err.message);
    }
  }

  throw new Error(`Neural Pulse Erratic: All models failed. Last error: ${lastError}`);
}
