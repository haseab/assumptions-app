import { aifn } from "@/scripts/aifn";
import { workerJPrompt } from "@/scripts/prompts/j";
import { workerCallOpenAI } from "@/utils";
import { workerJSelectorPrompt } from "../selectors/j";

export default aifn(async ({ messages, selector = false }) => {
  const systemMessage = selector ? workerJSelectorPrompt : workerJPrompt;

  const completion: string = await workerCallOpenAI({
    systemMessage,
    messages,
    selector,
  });

  return completion;
});
