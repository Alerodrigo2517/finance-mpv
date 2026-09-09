require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Actually the SDK doesn't easily expose listModels, but we can fetch it via REST
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
