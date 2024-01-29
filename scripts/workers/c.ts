import { aifn } from "@/scripts/aifn";
import { openai } from "@/scripts/main-2";
import { workerCPrompt } from "@/scripts/prompts/c";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export default aifn(
  "workerC",
  "Prerequisite: User is at 10/10 unacceptability and desires immediate action. Pick this if you think the user is at 10/10 unacceptability about delaying their problem.",
  z.object({
    messages: z.array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    ),
  }),
  async ({ messages }) => {
    let completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: workerCPrompt,
        },
        // @ts-ignore
        ...messages,
      ],
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
      model: "gpt-4-0125-preview",
    });

    const res = JSON.parse(
      completion.choices[0].message.function_call!.arguments
    );
    return res;
  }
);
