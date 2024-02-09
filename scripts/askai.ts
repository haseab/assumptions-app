import console from "console";
import OpenAI from "openai";

import chalk from "chalk";
import * as tools from "./workers";

export const functions = Object.entries(tools).reduce((acc, [name, tool]) => {
  acc[name] = tool.fn;
  return acc;
}, {} as Record<string, (args: any) => any>);

// console.log(functions);

let function_name = "workerA";
let selection: string;

export const getSelection = async ({
  messages,
  functionName,
}: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  functionName?: string | undefined;
}): Promise<any> => {
  function_name = functionName ? functionName : function_name;

  try {
    selection = await functions[function_name]({
      messages,
      selector: true,
    });

    // console.log("SELECTION: ", selection);

    const selectionJSON = JSON.parse(selection);

    function_name = selectionJSON.nextWorker;

    console.log(chalk.yellow(`Worker called: ${function_name}`));

    return function_name;
  } catch (e) {
    console.log("ERROR: ", e);
  }
};

export const getCompletion = async ({
  messages,
}: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
}) => {
  try {
    const completion = await functions[function_name]({
      messages,
      selector: false,
    });

    return completion;
  } catch (e) {
    console.log("ERROR: ", e);
  }
};
