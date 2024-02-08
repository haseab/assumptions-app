import { askAI } from "@/scripts/askai";
import { workerCCPrompt } from "@/scripts/prompts/cc";
// import * as tools from "@/scripts/workers";
import OpenAI from "openai";

// export const functions = Object.entries(tools).reduce((acc, [name, tool]) => {
//   acc[name] = tool.fn;
//   return acc;
// }, {} as Record<string, (args: any) => any>);

// export const schemas = Object.values(tools).map((tool) => tool.schema);

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const startMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: workerCCPrompt({ conversations: "", recommendations: "" }),
  },
];
export const dynamic = "force-static";

export async function POST(request: Request) {
  console.log("request", request);
  const body = await request.json();
  const { messages } = body;
  // messages[0] = startMessages[0];
  console.log("MESSAGES", messages);
  const [completion, _] = await askAI({ messages });
  // console.log("COMPLETION", completion);
  return new Response(JSON.stringify({ data: "API HANDLER WORKING" }));
}
