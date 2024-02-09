import { aifn } from "@/scripts/aifn";
import { workerDPrompt } from "@/scripts/prompts/d";
import { workerCallOpenAI } from "@/utils";
import { workerDSelectorPrompt } from "../selectors/d";

export default aifn(async ({ messages, selector = false }) => {
  const systemMessage = selector ? workerDSelectorPrompt : workerDPrompt;

  const completion = await workerCallOpenAI({
    systemMessage,
    messages,
    selector,
  });

  return completion;
});
