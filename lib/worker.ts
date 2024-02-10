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

console.log(process.env);
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
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: "system", content: systemMessage }, ...messages],
        response_format: { type: selector ? "json_object" : "text" },
        model: "gpt-4-0125-preview",
        stream: true,
        temperature: 0,
      }),
    }
  );

  process.stdout.write(chalk.cyan("Assistant: "));

  let buffer = ""; // Initialize an empty buffer

  if (completionStream.body) {
    const reader = completionStream.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textDecoder = new TextDecoder();
        buffer += textDecoder.decode(value, { stream: true }); // Append new data to buffer, ensuring to handle multi-byte characters correctly

        // Attempt to process complete JSON objects from the buffer
        while (buffer) {
          const endOfObject = buffer.indexOf("\n\n"); // Assuming each JSON object is delimited by "\n\n"
          if (endOfObject === -1) break; // If no end of object marker, wait for more data

          const chunk = buffer.substring(0, endOfObject); // Extract the complete JSON object
          buffer = buffer.substring(endOfObject + 2); // Remove processed object from buffer

          if (chunk.startsWith("data:")) {
            // if chunk is [Done] stop
            if (chunk.includes("DONE")) {
              break;
            }
            try {
              const jsonData = JSON.parse(chunk.substring(5)); // Remove 'data:' prefix and parse the JSON
              if (jsonData.choices && jsonData.choices.length > 0) {
                const content = jsonData.choices[0].delta?.content; // Extract the content from the first choice
                if (content) {
                  console.log("CONTENT: ", content);
                  yield content; // Yield or process the content
                }
              }
            } catch (parseError) {
              console.error("Error parsing JSON: ", parseError);
              // Optionally, handle incomplete/invalid JSON structure
              // You might want to append the chunk back to buffer or handle it differently
            }
          }
        }
      }
    } catch (error) {
      console.error("Error reading from the stream: ", error);
    } finally {
      reader.releaseLock();
    }
  } else {
    console.error("Fetch Response did not have a body.");
  }

  process.stdout.write("\n");

  // console.log("WORKER A COMPLETION: ", chunks.join(""));
};
