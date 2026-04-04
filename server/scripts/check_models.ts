
import { ENV } from "./server/_core/env.ts";

async function checkModels() {
  const apiKey = "AIzaSyDuLd1bRmUXdl9RinfbkHoJXzEUAOM4hhw"; // From user's previous message
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Available Models:");
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkModels();
