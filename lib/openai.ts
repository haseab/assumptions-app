import { env } from "@/env.mjs";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: env.OPEN_AI_API_KEY,
});
