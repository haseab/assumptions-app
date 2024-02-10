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
  let selection = ""; // Initialize an empty string to collect the streamed data

  try {
    // Since workerCallOpenAI is now an async generator, use for-await-of to iterate over the chunks
    for await (const chunk of workerCallOpenAI({
      messages,
      worker: lastWorker,
      selector: true,
    })) {
      selection += chunk; // Append each chunk to the selection string
    }

    // Once all chunks have been collected, parse the final result
    const selectionJSON = JSON.parse(selection);
    const { nextWorker } = selectionJSON;
    console.log(chalk.yellow(`Worker called: ${nextWorker}`));

    return nextWorker;
  } catch (e) {
    console.log("ERROR: ", e);
    // Handle error appropriately, potentially returning a default value or re-throwing the error
    throw e;
  }
};

export const getCompletion = async function* ({
  messages,
  nextWorker = "workerA",
}: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  nextWorker: string;
}) {
  console.log("NEXT WORKER:", nextWorker);
  try {
    for await (const chunk of workerCallOpenAI({
      messages,
      worker: nextWorker,
      selector: false,
    })) {
      // Yield each chunk as it's received
      yield chunk;
    }
  } catch (e) {
    console.log("ERROR: ", e);
    yield "Error completing request. Please try again.";
  }
};
