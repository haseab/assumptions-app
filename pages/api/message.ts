// `api/message/route.ts`
import { getCompletion, getSelection } from "@/scripts/askai";
import { NextApiRequest, NextApiResponse } from "next";

// export const dynamic = "force-dynamic";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Create a ReadableStream for streaming the response
  let firstRun = true;
  let nextWorker = "workerA";

  try {
    console.log("REQ BODY", req.body);
    const { messages, lastWorker } = JSON.parse(req.body);
    if (!firstRun) {
      nextWorker = await getSelection({ messages, lastWorker });
    }
    firstRun = false;

    // Assuming getCompletion is an async iterable or async generator
    for await (const chunk of getCompletion({ messages, nextWorker })) {
      // Send data down the stream
      const data = `data: ${JSON.stringify({
        completion: chunk,
        lastWorker: nextWorker,
      })}\n\n`;
      res.write(data);
      console.log(data);
    }
    // await new Promise((resolve) => setTimeout(resolve, 10000)); // Example delay
  } catch (err) {
    console.error(err);
    // If an error occurs, you might want to notify the client
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "An error occurred",
      })}\n\n`
    );
  }

  // Close the connection
  res.end();
}
