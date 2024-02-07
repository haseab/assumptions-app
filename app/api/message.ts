// create next js api handler

import { askAI } from "@/scripts/askai";
import { workerCCPrompt } from "@/scripts/prompts/cc";
import * as tools from "@/scripts/workers";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export const functions = Object.entries(tools).reduce((acc, [name, tool]) => {
  acc[name] = tool.fn;
  return acc;
}, {} as Record<string, (args: any) => any>);

export const schemas = Object.values(tools).map((tool) => tool.schema);

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const startMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: workerCCPrompt({
      conversations: "",
      recommendations: "call on workerA",
    }),
  },
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { messages } = req.body;
  const [completion, _] = await askAI({ messages });
  res.status(200).json({ completion });
};
