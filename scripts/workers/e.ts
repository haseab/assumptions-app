import { aifn } from "@/scripts/aifn";
import { workerEPrompt } from "@/scripts/prompts/e";
import { workerCallOpenAI } from "@/utils";
import { workerESelectorPrompt } from "../selectors/e";

export default aifn(async ({ messages, selector = false }) => {
  const systemMessage = selector ? workerESelectorPrompt : workerEPrompt;

  const completion = await workerCallOpenAI({
    systemMessage,
    messages,
    selector,
  });

  return completion;
});
