import { aifn } from "@/scripts/aifn";
import { openai } from "@/scripts/main-2";
import { workerDPrompt } from "@/scripts/prompts/d";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export default aifn(
  "workerD",
  "Pick this once the user has identified a root problem but hasn’t investigated their fears thoroughy.",
  z.object({
    messages: z.array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    ),
  }),
  async ({ messages }) => {
    console.log("WORKER D: MESSAGES");
    console.log(messages);
    let completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: workerDPrompt,
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
      temperature: 0,
    });

    const res = JSON.parse(
      completion.choices[0].message.tool_calls![0].function.arguments
    );
    return res;
  }
);
