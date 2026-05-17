const apiKey = "AIzaSyAxEmYYCyEgjV0Y7K2nEBCVPmrATEI5zAk";

const models = [
  { id: "gemini-2.0-flash-lite", apiVersion: "v1beta" },
  { id: "gemini-2.0-flash",      apiVersion: "v1beta" },
  { id: "gemini-1.5-flash",      apiVersion: "v1beta" },
  { id: "gemini-1.5-flash-8b",   apiVersion: "v1beta" },
  { id: "gemini-1.5-flash",      apiVersion: "v1" },
  { id: "gemini-2.5-flash",      apiVersion: "v1beta" }
];

async function run() {
  for (const model of models) {
    console.log(`\n--- Testing ${model.id} (${model.apiVersion}) ---`);
    const url = `https://generativelanguage.googleapis.com/${model.apiVersion}/models/${model.id}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Hello! Reply with OK if you read this." }] }]
        })
      });
      console.log(`Status: ${response.status} ${response.statusText}`);
      const body = await response.json();
      console.log("Response Body:", JSON.stringify(body, null, 2));
    } catch (e: any) {
      console.error("Error:", e.message);
    }
  }
}

run();
