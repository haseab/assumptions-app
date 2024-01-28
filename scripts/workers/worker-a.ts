import { workerAPrompt } from "@/app/worker-a";
import { aifn } from "@/scripts/aifn";
import { openai } from "@/scripts/main-2";
import { z } from "zod";

export default aifn(
  "workerA",
  "Pick this if you think you suspect the problem as described by the user has not adequately been “grounded” in experience. “Grounding” means when the user is precisely and unambiguously accounting their experience (describing what they heard being said, what they felt, what they physically saw) as opposed to conceptually accounting what is happening.",
  z.object({
    messages: z.array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    ),
  }),
  async ({ messages }) => {
    console.log("Messages: ");
    console.log(messages);
    let completion = await openai.chat.completions.create({
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: workerAPrompt,
        },
        //@ts-ignore
        ...messages,
      ],

      model: "gpt-4-1106-preview",
    });

    console.log("Completion: ");
    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content;
  }
);
