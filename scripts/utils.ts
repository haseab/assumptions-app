import { workerCCprompt2 } from "@/scripts/prompts/cc";
import chalk from "chalk";
import OpenAI from "openai";
import { functions, openai, schemas } from "./main-2";

let function_name = "";
let recommendations = "";
/**
 * Ask the AI a question
 * @param messages messages to send to the AI
 * @param model model to use
 * @param props
 * @returns
 * @throws
 * @example
 * const messages = [
 *  {
 *   role: "user",
 *   content: "What is the meaning of life?"
 *  }
 * ]
 *
 * const completion = await askAI(messages)
 * console.log(completion)
 *
 **/
export const askAI = async ({
  messages,
  model = "gpt-4-0125-preview",
  props,
  functionName,
}: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  model?: string;
  props?: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming;
  functionName?: string;
}): Promise<any> => {
  // console.log(messages.filter((m) => m.role !== "system"));
  console.log("CONTROL WORKER Messages: ", messages);

  // let newSystemMessage = "";
  // if (function_name) {
  // newSystemMessage = workerCCprompt2(recommendations);
  messages[0].content = workerCCprompt2(recommendations);
  // }

  let completion = await openai.chat.completions.create({
    messages,
    functions: schemas,
    model,
    ...(function_name && {
      tool_choice: {
        type: "function",
        function: {
          name: function_name,
        },
      },
    }),
    ...props,
  });
  function_name = "";

  // if you deliberatley specify OpenAI to call a specific function (line 52) with the function_call property, the finish_reason will be "stop" instead of "function_call"

  if (completion.choices[0].message.function_call?.name) {
    completion.choices[0].finish_reason = "function_call";
  }

  switch (completion.choices[0].finish_reason) {
    case "stop":
      return completion.choices[0].message.content;
    // return completion;
    case "length":
      throw new Error("Message too long");
    case "function_call":
      const { name, arguments: args } =
        completion.choices[0].message.function_call!;
      console.log(chalk.yellow("Function call: ", name));
      // console.log("Args: ", args);
      const fn = functions[name];
      if (!fn) throw new Error(`Unknown function ${name}`);
      const res = (await fn({
        messages: messages.filter(
          (m) => m.role !== "system" && m.role !== "function"
        ),
      })) as {
        success: boolean;
        response: string;
        recommendation: string;
      };
      console.log(
        chalk.yellow("Function response: ", JSON.stringify(res, null, 2))
      );

      // messages.push({
      //   role: "assistant",
      //   // content: "",
      //   function_call: {
      //     name,
      //     arguments: args,
      //   },
      // });

      messages.push({
        role: "function",
        name,
        content: JSON.stringify({ res }),
      });

      if (res.success === false) {
        function_name = name;
        // WE WANT USER INPUT NEXT
        return res.response;
      } else {
        // if true, call next function, input recommendation into prompt
        // messages.push({
        //   role: "assistant",
        //   content: res.recommendation,
        // });
        recommendations = res.recommendation;
        return askAI({
          messages,
        });
      }

    // console.log("FINAL MESSAGE: ");
    // console.log(messages);
    default:
      throw new Error("Unknown finish reason");
  }
};
