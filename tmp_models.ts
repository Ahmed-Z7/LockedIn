import dotenv from 'dotenv';
dotenv.config(); // make sure this is BEFORE env.ts
import { ENV } from './server/_core/env.ts';

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.models) {
    console.log(data.models.map((m: any) => `${m.name} - ${m.supportedGenerationMethods?.join(',')}`).join('\n'));
  } else {
    console.log('Error fetching models:', data, url);
  }
}

listModels();
