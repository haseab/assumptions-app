import { aifn } from "@/scripts/aifn";
import { openai } from "@/scripts/main-2";
import { workerAPrompt } from "@/scripts/prompts/a";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export default aifn(
  "workerE",
  "Pick this if the user has explored their fears vividly and are now ready to explore counterfactual situations regarding their fears.",
  z.object({
    messages: z.array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    ),
  }),
  async ({ messages }) => {
    const finalMessages = [
      {
        role: "system",
        content: workerAPrompt,
      },
      ...messages,
    ];

    let completion = await openai.chat.completions.create({
      // @ts-ignore
      messages: finalMessages,
      functions: [
        {
          name: "workerReturn",
          description: "The response format of the worker",
          parameters: zodToJsonSchema(
            z.object({
              success: z.boolean(),
              response: z.string(),
              recommendation: z.string(),
            })
          ),
        },
      ],
      function_call: {
        name: "workerReturn",
      },
      model: "gpt-3.5-turbo-1106",
    });

    const res = JSON.parse(
      completion.choices[0].message.function_call!.arguments
    );
    return res;
  }
);
