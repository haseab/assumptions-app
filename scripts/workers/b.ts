import { aifn } from "@/scripts/aifn";
import { workerBPrompt } from "@/scripts/prompts/b";
import { workerCallOpenAI } from "@/utils";
import { workerBSelectorPrompt } from "../selectors/b";

export default aifn(async ({ messages, selector = false }) => {
  const systemMessage = selector ? workerBSelectorPrompt : workerBPrompt;

  const completion = await workerCallOpenAI({
    systemMessage,
    messages,
    selector,
  });

  return completion;
});
