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

  // Try multiple model IDs to find one that is active in 2026
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash",
    "gemini-pro"
  ];

  let lastError = "";

  for (const modelId of modelsToTry) {
    try {
      console.log(`[AI] Attempting to invoke model: ${modelId}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${ENV.geminiApiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error generating response";
        console.log(`[AI] Successfully used model: ${modelId}`);
        return {
          choices: [{ message: { role: "model", content: aiText } }]
        };
      } else {
        const errorText = await response.text();
        lastError = `Model ${modelId} failed: ${response.status} - ${errorText}`;
        console.warn(`[AI] ${lastError}`);
      }
    } catch (err: any) {
      lastError = `Fetch failed for ${modelId}: ${err.message}`;
      console.warn(`[AI] ${lastError}`);
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}
