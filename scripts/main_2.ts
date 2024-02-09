import chalk from "chalk";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources/index.mjs";
import readline from "readline";
import { getCompletion, getSelection } from "./askai";
import { functionName } from "./preload";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let function_name = functionName ? functionName : "workerA";
let selection: ChatCompletion;
let completion: string;
let firstRun = true;

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

    console.log("FUNCTION NAME: ", function_name);

    console.log("Messages: ", messages);
    // MAKE A SELECTION OF NEXT WORKER

    console.log("TRYING TO CHOOSE NEXT WORKER");
    console.log(firstRun);

    if (!firstRun) {
      console.log("GOT IN");
      function_name = await getSelection({ messages });
    }
    firstRun = false;
    if (answer) {
      messages.push({ role: "user", content: answer });

      console.log("MESSAGES", messages);

      completion = await getCompletion({ messages });

      messages.push({
        role: "assistant",
        content: completion,
      });
    } else {
      console.log(chalk.red("You did not provide a query!"));
    }

    rl.close();
    main(messages); // Loop
  });
}

// console.log(JSON.stringify(schemas, null, 2));
// // Run the main function
console.log(chalk.green("Welcome to assumptions.app cli tool!"));
console.log(chalk.green("Start by typing a query, or type 'exit' to exit."));
main();
