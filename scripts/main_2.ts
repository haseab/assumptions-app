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

    // console.log("FUNCTION NAME: ", function_name);

    // console.log("Messages: ", messages);
    // MAKE A SELECTION OF NEXT WORKER

    // console.log("TRYING TO CHOOSE NEXT WORKER");
    // console.log(firstRun);

    if (!firstRun) {
      nextWorker = await getSelection({ messages, lastWorker });
    }
    firstRun = false;
    if (answer) {
      messages.push({ role: "user", content: answer });

      // console.log("MESSAGES", messages);

      completion = await getCompletion({ messages, nextWorker });

      messages.push({
        role: "assistant",
        content: completion,
      });
    } else {
      console.log(chalk.red("You did not provide a query!"));
    }

    rl.close();
    main({ messages, lastWorker: nextWorker }); // Loop
  });
}

// console.log(JSON.stringify(schemas, null, 2));
// // Run the main function
console.log(chalk.green("Welcome to assumptions.app cli tool!"));
console.log(chalk.green("Start by typing a query, or type 'exit' to exit."));
main({ lastWorker: "workerA", messages: [] });
