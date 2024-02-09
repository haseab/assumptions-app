import { aifn } from "@/scripts/aifn";
import { workerCallOpenAI } from "@/utils";
import { workerAPrompt } from "../prompts/a";
import { workerASelectorPrompt } from "../selectors/a";

export default aifn(async ({ messages, selector = false }) => {
  const systemMessage = selector ? workerASelectorPrompt : workerAPrompt;

  const completion = await workerCallOpenAI({
    systemMessage,
    messages,
    selector,
  });

  return completion;
});
