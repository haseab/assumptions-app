import { getCompletion, getSelection } from "@/scripts/askai";
// import * as tools from "@/scripts/workers";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = "force-static";

export async function POST(request: Request) {
  console.log("request", request);
  const body = await request.json();
  const { messages, lastWorker } = body;

  console.log("messages", messages);
  console.log("lastWorker", lastWorker);

  let completion: string;
  let firstRun = true;
  let nextWorker = "workerA";

  if (!firstRun) {
    nextWorker = await getSelection({ messages, lastWorker });
  }
  firstRun = false;

  completion = await getCompletion({ messages, nextWorker });

  return new Response(
    JSON.stringify({ data: { completion, lastWorker: nextWorker } })
  );
}
