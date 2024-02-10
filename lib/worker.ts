import { openai } from "@/lib/openai";
import * as prompts from "@/lib/prompts";
import * as selectors from "@/lib/selectors";
import chalk from "chalk";

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

export const workerCallOpenAI = async function* ({
  messages,
  worker,
  selector = false,
}: {
  messages: any;
  worker: string;
  selector: boolean;
}) {
  const systemMessage = selector ? selectorMap[worker] : promptMap[worker];

  console.log("API KEY", openai.apiKey);
  let completionStream = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemMessage }, ...messages],
    response_format: { type: selector ? "json_object" : "text" },
    model: "gpt-4-0125-preview",
    stream: true,
    temperature: 0,
  });

  process.stdout.write(chalk.cyan("Assistant: "));
  for await (const chunk of completionStream) {
    const text = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(chalk.magenta(`${text}`));
    yield text;
  }
  process.stdout.write("\n");

  // console.log("WORKER A COMPLETION: ", chunks.join(""));
};
