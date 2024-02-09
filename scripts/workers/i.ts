import { aifn } from "@/scripts/aifn";
import { workerIPrompt } from "@/scripts/prompts/i";
import { workerCallOpenAI } from "@/utils";
import { workerISelectorPrompt } from "../selectors/i";

export default aifn(async ({ messages, selector = false }) => {
  const systemMessage = selector ? workerISelectorPrompt : workerIPrompt;

  const completion = await workerCallOpenAI({
    systemMessage,
    messages,
    selector,
  });

  return completion;
});
