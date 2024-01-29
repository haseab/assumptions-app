import { aifn } from "@/scripts/aifn";
import { openai } from "@/scripts/main-2";
import { workerAPrompt } from "@/scripts/prompts/a";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export default aifn(
  "workerA",
  "Pick this if you think you suspect the problem as described by the user has not adequately been “grounded” in experience. “Grounding” means when the user is precisely and unambiguously accounting their experience (describing what they heard being said, what they felt, what they physically saw) as opposed to conceptually accounting what is happening. Input it context as a string which is every detail you see in your .",
  z.object({
    messages: z.array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    ),
  }),
  async ({ messages }) => {
    console.log("MESSAGES");
    console.log(messages);

    let completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: workerAPrompt,
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
