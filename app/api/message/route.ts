// `api/message/route.ts`
import { getCompletion, getSelection } from "@/lib/askai";
import { openai } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Create a ReadableStream for streaming the response
  const stream = new ReadableStream({
    start(controller) {
      (async () => {
        const body = await request.json();
        const { messages, lastWorker } = body;
        let nextWorker = "workerA";
        let firstRun = true;

        if (!firstRun) {
          nextWorker = await getSelection({ messages, openai, lastWorker });
        }
        firstRun = false;

        // Stream chunks from getCompletion
        for await (const chunk of getCompletion({
          messages,
          nextWorker,
          openai,
        })) {
          controller.enqueue(
            `data: ${JSON.stringify({
              completion: chunk,
              lastWorker: nextWorker,
            })}\n\n`
          );
        }

        controller.close(); // Close the stream when all chunks have been sent
      })().catch((err) => {
        console.error(err);
        controller.error(err);
      });
    },
  });

  return new NextResponse(stream, { headers });
}
