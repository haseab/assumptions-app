import { aifn } from "@/scripts/aifn";
import { openai } from "@/scripts/main-2";
import { workerJPrompt } from "@/scripts/prompts/j";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export default aifn(
  "workerJ",
  "Pick this worker for all purposes that are not related to Workers A through I. Typically this worker is picked to steer the user back to the intended conversation, or respond to a casual question.",
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
          content: workerJPrompt,
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
