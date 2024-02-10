import { openai } from "@/scripts/openai";
import chalk from "chalk";
import OpenAI from "openai";
import readline from "readline";
import { getCompletion, getSelection } from "./askai";

async function main({
  messages = [],
  lastWorker = "workerA",
}: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  lastWorker: string;
}) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let completion: string;
  let firstRun = true;
  let nextWorker = "workerA";

  rl.question(chalk.cyan("User: "), async (answer) => {
    // Check if user wants to exit
    if (answer.toLowerCase() === "exit") {
      console.log(chalk.magenta("Goodbye!"));
      rl.close();
      return; // Exit the function, stopping the loop
    }

    if (!firstRun) {
      nextWorker = await getSelection({ messages, openai, lastWorker });
    }
    firstRun = false;
    if (answer) {
      messages.push({ role: "user", content: answer });

      // console.log("MESSAGES", messages);

      let completion = ""; // Initialize an empty string to collect the streamed data

      try {
        // Since workerCallOpenAI is now an async generator, use for-await-of to iterate over the chunks
        for await (const chunk of getCompletion({
          messages,
          openai,
          nextWorker,
        })) {
          completion += chunk; // Append each chunk to the selection string
        }

        messages.push({
          role: "assistant",
          content: completion,
        });
      } catch (e) {
        console.log("ERROR: ", e);
        // Handle error appropriately, potentially returning a default value or re-throwing the error
        throw e;
      }
    } else {
      console.log(chalk.red("You did not provide a query!"));
    }

    rl.close();
    main({ messages, lastWorker: nextWorker }); // Loop
  });
}

console.log(chalk.green("Welcome to assumptions.app cli tool!"));
console.log(chalk.green("Start by typing a query, or type 'exit' to exit."));
main({ lastWorker: "workerA", messages: [] });
