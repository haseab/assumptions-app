import chalk from "chalk";
import OpenAI from "openai";
import { functions, openai, schemas } from "./main-2";

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
export const askAI = async (
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: string = "gpt-4-0125-preview",
  props?: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
  functionName?: string
): Promise<any> => {
  // console.log(messages.filter((m) => m.role !== "system"));
  console.log("CONTROL WORKER Messages: ", messages);
  let completion = await openai.chat.completions.create({
    messages,
    functions: schemas,
    model,
    ...(functionName && {
      function_call: {
        name: functionName,
      },
    }),
    ...props,
  });

  switch (completion.choices[0].finish_reason) {
    case "stop":
      return completion;
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
        messages.push({
          role: "assistant",
          content: res.response,
        });
        return res.response;
        // return askAI(messages, undefined, undefined, name);
      } else {
        // if true, call next function, input recommendation into prompt
        messages.push({
          role: "assistant",
          content: res.recommendation,
        });
        return askAI(messages);
      }

    // console.log("FINAL MESSAGE: ");
    // console.log(messages);
    default:
      throw new Error("Unknown finish reason");
  }
};
