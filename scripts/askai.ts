import { conversationConverter } from "@/utils";
import chalk from "chalk";
import console from "console";
import OpenAI from "openai";
import { functions, openai, schemas } from "./main_2";
import { workerCCPrompt } from "./prompts/cc";

let function_name = "";
let recommendations = "call on workerA";
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
  functionName?: string | undefined;
}): Promise<any> => {
  // console.log(messages.filter((m) => m.role !== "system"));

  function_name = functionName ? functionName : function_name;
  console.log("FUNCTION NAME: ", function_name);

  messages[0].content = workerCCPrompt({
    recommendations,
    conversations: conversationConverter(messages),
  });

  console.log("CONTROL WORKER Messages: ", [messages[0]]);

  console.log(
    JSON.stringify(
      schemas.map((schema) => {
        return {
          type: "function",
          function: {
            name: schema.name,
            description: schema.description, // This is optional and will be included if provided in the schema.
            parameters: schema.parameters,
          },
        };
      }),
      null,
      2
    )
  );

  let completion = await openai.chat.completions.create({
    messages: [messages[0]],
    tools: schemas.map((schema) => ({
      type: "function",
      function: {
        name: schema.name,
        description: schema.description, // This is optional and will be included if provided in the schema.
        parameters: schema.parameters,
      },
    })),
    ...(function_name && {
      tool_choice: {
        type: "function",
        function: {
          name: function_name,
        },
      },
    }),
    model,
    temperature: 0,
    ...props,
  });
  function_name = "";
  recommendations = "";

  console.log("COMPLETION: ", completion);

  console.log("message:", completion.choices[0].message);
  // if you deliberatley specify OpenAI to call a specific function (line 52) with the function_call property, the finish_reason will be "stop" instead of "function_call"

  console.log(
    schemas.map((schema) => ({
      type: "function",
      function: {
        name: schema.name,
        description: schema.description, // This is optional and will be included if provided in the schema.
        parameters: schema.parameters,
      },
    }))
  );
  if (completion.choices[0].message.tool_calls![0].function.name) {
    completion.choices[0].finish_reason = "tool_calls";
  }

  switch (completion.choices[0].finish_reason) {
    case "stop":
      return completion.choices[0].message.content;
    // return completion;1
    case "length":
      throw new Error("Message too long");
    case "tool_calls":
      const { name, arguments: args } =
        completion.choices[0].message.tool_calls![0].function;
      console.log(chalk.yellow("Function call: ", name));
      // console.log("Args: ", args);l
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

      // messages.push({
      //   role: "function",
      //   name,
      //   content: JSON.stringify({ res }),
      // });

      if (res.success === false) {
        function_name = name;
        // WE WANT USER INPUT NEXT
        return [res.response, function_name];
      } else {
        // if true, call next function, input recommendation into prompt
        // messages.push({
        //   role: "system",
        //   content: workerCCPrompt2({res.recommendation),
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
