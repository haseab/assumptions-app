import { openai } from "@/scripts/main_2";
import chalk from "chalk";
import { OpenAI } from "openai";

export const conversationConverter = (
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
) => {
  let string = "";
  // turn into a string format from the above object format
  messages
    .filter((message) => {
      return message.role !== "system" && message.role !== "function";
    })
    .map((message) => {
      string += `${message.role}: ${message.content}\n`;
    });
  return string;
};

export const workerCallOpenAI = async ({
  systemMessage,
  messages,
  selector,
}: {
  systemMessage: string;
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  selector: boolean;
}): Promise<string> => {
  // console.log("WORKER: MESSAGES");
  // console.log([systemMessage, ...messages]);

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
