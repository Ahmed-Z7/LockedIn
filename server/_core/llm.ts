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

  // Debug: Attempt to list models to see what's actually available
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${ENV.geminiApiKey}`;
    const listRes = await fetch(listUrl);
    if (listRes.ok) {
      const listData = await listRes.json();
      const modelNames = listData.models?.map((m: any) => m.name) || [];
      console.log("[AI Debug] Available Models for your key:", JSON.stringify(modelNames));
    }
  } catch (e) {
    console.warn("[AI Debug] Could not list models:", e);
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

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  let lastError = "";

  for (const modelId of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${ENV.geminiApiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error generating response";
        return {
          choices: [{ message: { role: "model", content: aiText } }]
        };
      } else {
        const errorText = await response.text();
        lastError = `Model ${modelId} failed: ${response.status} - ${errorText}`;
      }
    } catch (err: any) {
      lastError = `Fetch failed for ${modelId}: ${err.message}`;
    }
  }

  throw new Error(`All Gemini models failed. Latest error: ${lastError}`);
}
