import { aifn } from "@/scripts/aifn";
import { workerCPrompt } from "@/scripts/prompts/c";
import { workerCallOpenAI } from "@/utils";
import { workerCSelectorPrompt } from "../selectors/c";

export default aifn(async ({ messages, selector = false }) => {
  const systemMessage = selector ? workerCSelectorPrompt : workerCPrompt;

  const completion = await workerCallOpenAI({
    systemMessage,
    messages,
    selector,
  });

  return completion;
});
