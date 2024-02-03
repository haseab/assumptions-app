import { workerCCPrompt } from "@/scripts/prompts/cc";
import chalk from "chalk";
import OpenAI from "openai";
import readline from "readline";
import { functionName, testMessages } from "./preload";
import { askAI } from "./utils";
import * as tools from "./workers";

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
    content: workerCCPrompt,
  },
];

const systemMessage = testMessages.length !== 0 ? testMessages : startMessages;

async function main(messages: OpenAI.Chat.ChatCompletionMessageParam[] = []) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(chalk.cyan("User: "), async (answer) => {
    // Check if user wants to exit
    if (answer.toLowerCase() === "exit") {
      console.log(chalk.magenta("Goodbye!"));
      rl.close();
      return; // Exit the function, stopping the loop
    }

    if (answer) {
      messages.push({ role: "user", content: answer }); // Append the user message
      let completion = await askAI({ messages, functionName });
      // console.log("Completion: ", JSON.stringify(completion, null, 2));
      messages.push({
        role: "assistant",
        content: completion,
      });
      console.log(chalk.magenta(`Assistant: ${completion}`));
    } else {
      console.log(chalk.red("You did not provide a query!"));
    }

    rl.close();
    main(messages); // Loop
  });
}

// console.log(functions);
// console.log(JSON.stringify(schemas, null, 2));
// // Run the main function
console.log(chalk.green("Welcome to the ai-fns cli tool!"));
console.log(chalk.green("Start by typing a query, or type 'exit' to exit."));
main(systemMessage);
