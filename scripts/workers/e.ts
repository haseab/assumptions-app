import { aifn } from "@/scripts/aifn";
import { openai } from "@/scripts/main-2";
import { workerEPrompt } from "@/scripts/prompts/e";
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
    let completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: workerEPrompt,
        },
        // @ts-ignore
        ...messages,
      ],
      tools: [
        {
          type: "function",
          function: {
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
        },
      ],
      tool_choice: {
        type: "function",
        function: {
          name: "workerReturn",
        },
      },
      model: "gpt-4-0125-preview",
    });

    const res = JSON.parse(
      completion.choices[0].message.tool_calls![0].function.arguments
    );
    return res;
  }
);
