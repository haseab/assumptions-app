import { workerCCPrompt } from "@/scripts/prompts/cc";
import chalk from "chalk";
import OpenAI from "openai";
import readline from "readline";
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

let testMessages: OpenAI.Chat.ChatCompletionMessageParam[];

const startMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: workerCCPrompt,
  },
];

testMessages = [
  {
    role: "system",
    content:
      "\n" +
      "You are a piece of a super-intelligent AI called “The Assumptioneer” . The `GOAL` of “The Assumptioneer” is to guide humans to solve their problems permanently. There are 8 expert `WORKERS` that make up “The Assumptioneer”.\n" +
      "\n" +
      "You are the `WORKER` Control Center. Your job as `WORKER` Control Center is to decide which expert workers are important to be called on to respond to the conversation. \n" +
      "\n" +
      "Based on the `GOAL`, the `message_history` and `RECOMMENDATIONS`, pick the appropriate `WORKER` to respond to the user.\n" +
      "\n" +
      "RECCOMENDATIONS:\n" +
      "User has clearly grounded the problem to the 5 senses, recommendation to proceed with assessing urgency/unacceptance of situation\n",
  },
  {
    role: "user",
    content: "I eat lots of chocolate and don't know how to stop",
  },
  {
    role: "function",
    name: "workerA",
    content: `{"res":{"success":false,"response":"I hear you're struggling with your chocolate consumption. To help you better, I need you to detail your experience more concretely. How often do you find yourself eating chocolate? Describe to me the exact moments when you usually reach for chocolate. What do you see, what do you hear, and what are you doing right before that happens?","recommendation":""}}`,
  },
  {
    role: "assistant",
    content:
      "I hear you're struggling with your chocolate consumption. To help you better, I need you to detail your experience more concretely. How often do you find yourself eating chocolate? Describe to me the exact moments when you usually reach for chocolate. What do you see, what do you hear, and what are you doing right before that happens?",
  },
  {
    role: "user",
    content:
      "I was in my room, I had 2 reeses bars in my fridge, I didn't have much else to eat but then i thought about the 2 reeses bars and felt good, so I went an grabbed them, a thought crossed my head that i probably shouldn't do this, but I ignored it and opened it and viciously started eating it nonstop until there was none left. Then I had a thought that I Just put so much sugar in my body for only 5 min of pleasure",
  },
  {
    role: "function",
    name: "workerA",
    content:
      '{"res":{"success":true,"response":"","recommendation":"User has clearly grounded the problem to the 5 senses, recommendation to proceed with assessing urgency/unacceptance of situation"}}',
  },
  {
    role: "function",
    name: "workerB",
    content: `{"res":{"success":false,"response":"I understand you're feeling conflicted about eating chocolate, specifically the Reese's bars. Let's have a look at how this is sitting with you. If you decided to not take any steps toward addressing this problem for the next week, how unacceptable would that be for you on a scale from 1 to 10? You can get a better sense of what I mean by checking out this unacceptance chart [here](https://assumptions.app/criteria). Are we talking about a crisis level of concern, or is it more of a mild inconvenience to you?","recommendation":""}}`,
  },
  {
    role: "assistant",
    content:
      "I understand you're feeling conflicted about eating chocolate, specifically the Reese's bars. Let's have a look at how this is sitting with you. If you decided to not take any steps toward addressing this problem for the next week, how unacceptable would that be for you on a scale from 1 to 10? You can get a better sense of what I mean by checking out this unacceptance chart [here](https://assumptions.app/criteria). Are we talking about a crisis level of concern, or is it more of a mild inconvenience to you?",
  },
  { role: "user", content: "I would say it's probably a 5" },
  {
    role: "function",
    name: "workerB",
    content: `{"res":{"success":false,"response":"Alright, you've placed your level of unacceptance at a 5. It's definitely bothering you, but it's not yet pushing you over the edge. Can you pinpoint a time or event in the future when not addressing your chocolate consumption might escalate to a 10/10 level of unacceptance for you?","recommendation":""}}`,
  },
  {
    role: "assistant",
    content:
      "Alright, you've placed your level of unacceptance at a 5. It's definitely bothering you, but it's not yet pushing you over the edge. Can you pinpoint a time or event in the future when not addressing your chocolate consumption might escalate to a 10/10 level of unacceptance for you?",
  },
];

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
      let completion = await askAI({ messages });
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
main(testMessages ? testMessages : startMessages);
