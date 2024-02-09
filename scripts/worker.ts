import * as prompts from "@/scripts/prompts";
import * as selectors from "@/scripts/selectors";
import chalk from "chalk";
import { openai } from "./openai";

export const promptMap = Object.entries(prompts).reduce((acc, [name, tool]) => {
  acc[name] = tool;
  return acc;
}, {} as Record<string, string>);

export const selectorMap = Object.entries(selectors).reduce(
  (acc, [name, tool]) => {
    acc[name] = tool;
    return acc;
  },
  {} as Record<string, string>
);

export const workerCallOpenAI = async ({
  messages,
  worker,
  selector = false,
}: {
  messages: any;
  worker: string;
  selector: boolean;
}) => {
  const systemMessage = selector ? selectorMap[worker] : promptMap[worker];

  let completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemMessage }, ...messages],
    response_format: { type: selector ? "json_object" : "text" },
    model: "gpt-4-0125-preview",
    stream: true,
    temperature: 0,
  });

  const chunks = [];

  process.stdout.write(chalk.cyan("Assistant: "));
  for await (const chunk of completion) {
    const text = chunk.choices[0]?.delta?.content || "";
    chunks.push(text);
    process.stdout.write(chalk.magenta(`${text}`));
  }
  process.stdout.write("\n");

  // console.log("WORKER A COMPLETION: ", chunks.join(""));
  const res = chunks.join("");
  return res;
};
