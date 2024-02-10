import OpenAI from "openai";

console.log("API KEY", process.env.OPENAI_API_KEY);
console.log("API KEY 2", process.env.OPEN_AI_API_KEY);

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
