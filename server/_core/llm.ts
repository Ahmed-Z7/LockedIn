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

  // Updated Stable Model IDs for 2026
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  let lastError = "";

  for (const modelId of modelsToTry) {
    try {
      // Using v1beta for advanced features in 2026
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
          throw new Error(`Empty response from model ${modelId}. Finish reason: ${finishReason}`);
        }

        return {
          choices: [{ message: { role: "model", content: aiText } }]
        };
      } else {
        const errorData = await response.json().catch(() => ({ error: { message: "Unknown API Error" } }));
        lastError = `Model ${modelId} failed: ${response.status} - ${errorData.error?.message || "No error message"}`;
        console.warn(`[AI DIAGNOSTIC] ${lastError}`);
      }
    } catch (err: any) {
      lastError = `Fetch failed for ${modelId}: ${err.message}`;
      console.warn(`[AI DIAG NOSTIC] ${lastError}`);
    }
  }

  throw new Error(`Neural Pulse Erratic: All models failed. Last error: ${lastError}`);
}
