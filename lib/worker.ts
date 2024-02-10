import * as prompts from "@/lib/prompts";
import * as selectors from "@/lib/selectors";
import chalk from "chalk";

export const promptMap = Object.entries(prompts).reduce((acc, [name, tool]) => {
  acc[name] = tool;
  return acc;
}, {} as Record<string, string>);

export const selectorMap = Object.entries(selectors).reduce(
  (acc, [name, tool]) => {
    acc[name] = tool;
    return acc;
  },
  {} as Record<string, string>
);

// export const workerCallOpenAI = async function* ({
//   messages,
//   worker,
//   selector = false,
// }: {
//   messages: any;
//   worker: string;
//   selector: boolean;
// }) {
//   const systemMessage = selector ? selectorMap[worker] : promptMap[worker];

//   let completionStream = await openai.chat.completions.create({
//     messages: [{ role: "system", content: systemMessage }, ...messages],
//     response_format: { type: selector ? "json_object" : "text" },
//     model: "gpt-4-0125-preview",
//     stream: true,
//     temperature: 0,
//   });

//   process.stdout.write(chalk.cyan("Assistant: "));
//   for await (const chunk of completionStream) {
//     const text = chunk.choices[0]?.delta?.content || "";
//     process.stdout.write(chalk.magenta(`${text}`));
//     yield text;
//   }
//   process.stdout.write("\n");

//   // console.log("WORKER A COMPLETION: ", chunks.join(""));
// };

export const workerCallOpenAI = async function* ({
  messages,
  worker,
  selector = false,
}: {
  messages: any;
  worker: string;
  selector: boolean;
}) {
  const systemMessage = selector ? selectorMap[worker] : promptMap[worker];

  const completionStream = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-0125-preview",
        messages: [{ role: "system", content: systemMessage }, ...messages],
        response_format: { type: selector ? "json_object" : "text" },
        stream: true,
        temperature: 0,
      }),
    }
  );

  process.stdout.write(chalk.cyan("Assistant: "));

  if (completionStream.body) {
    const reader = completionStream.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Assuming the stream is UTF-8 text, decode the chunk
        const textDecoder = new TextDecoder();
        const chunkText = textDecoder.decode(value);

        const text = JSON.parse(chunkText).choices[0]?.delta?.contentText;

        process.stdout.write(chalk.magenta(`${text}`));
        yield text;
      }
    } catch (err) {
      console.error("Error reading the stream:", err);
    } finally {
      reader.releaseLock();
    }
  } else {
    console.error("Fetch Response did not have a body.");
  }

  process.stdout.write("\n");

  // console.log("WORKER A COMPLETION: ", chunks.join(""));
};
