import chalk from "chalk";
import console from "console";
import OpenAI from "openai";
import { workerCallOpenAI } from "./worker";

let selection: string;

export const getSelection = async ({
  messages,
  lastWorker = "workerA",
}: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  lastWorker: string;
}): Promise<any> => {
  try {
    selection = await workerCallOpenAI({
      messages,
      worker: lastWorker,
      selector: true,
    });

    const selectionJSON = JSON.parse(selection);

    const { nextWorker } = selectionJSON;

    console.log(chalk.yellow(`Worker called: ${nextWorker}`));

    return nextWorker;
  } catch (e) {
    console.log("ERROR: ", e);
  }
};

export const getCompletion = async ({
  messages,
  nextWorker = "workerA",
}: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  nextWorker: string;
}) => {
  console.log("NEXT WORKER:", nextWorker);
  try {
    const completion = await workerCallOpenAI({
      messages,
      worker: nextWorker,
      selector: false,
    });

    return completion;
  } catch (e) {
    console.log("ERROR: ", e);
    return "Error completing request. Please try again.";
  }
};
