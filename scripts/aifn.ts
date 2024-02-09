import { z } from "zod";

/**
 * Schema for a function to be called by OpenAI
 *
 * @url https://platform.openai.com/docs/api-reference/chat/create#functions
 * @param name name of the function to be called by OpenAI
 * @param description description of what the function does, used by the model to choose when and how to call the function
 * @param schema parameters the function accepts, described as a zod schema
 */
export const OpenAIFunctionSchema = z.object({
  name: z
    .string()
    .describe("The name of the function to be called.")
    .max(64)
    .regex(/^[a-zA-Z0-9_-]*$/)
    .min(1),
  description: z
    .string()
    .describe(
      "A description of what the function does, used by the model to choose when and how to call the function."
    )
    .optional(),
  parameters: z
    .record(z.string(), z.unknown())
    .describe(
      "The parameters the functions accepts, described as a JSON Schema object."
    ),
});

/**
 * Consume a zod schema and a function and return an object that can be used by OpenAI
 * @param name name of the function to be called by OpenAI
 * @param description description of what the function does, used by the model to choose when and how to call the function
 * @param schema parameters the function accepts, described as a zod schema
 * @param f function to be called by OpenAI
 * @returns
 */

export const aifn = <
  P extends z.ZodType<any, any>,
  R extends z.ZodType<any, any>
>(
  f: (args: z.infer<P>) => z.infer<R>
): {
  fn: (params: z.infer<P>) => z.infer<R>;
} => ({
  fn: (args: z.infer<P>) => {
    return f(args);
  },
});
