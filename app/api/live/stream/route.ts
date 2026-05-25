import { runNewsPipeline, buildLiveSnapshot } from "@/lib/news";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;
  let lastSignature = "";

  const stream = new ReadableStream({
    async start(controller) {
      let interval: ReturnType<typeof setInterval> | undefined;
      let timeout: ReturnType<typeof setTimeout> | undefined;

      function safeClose() {
        if (closed) return;
        closed = true;
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
        try {
          controller.close();
        } catch {
          // The browser may already have closed the EventSource connection.
        }
      }

      async function pushSnapshot(eventName = "snapshot") {
        if (closed) return;
        try {
          const result = await runNewsPipeline();
          const snapshot = buildLiveSnapshot(result);
          const signature = `${snapshot.updatedAt}:${snapshot.liveStories.map((story) => story.id).join("|")}:${snapshot.trends
            .map((trend) => `${trend.name}:${trend.velocity}`)
            .join("|")}`;
          if (eventName === "snapshot" || signature !== lastSignature) {
            lastSignature = signature;
            controller.enqueue(encoder.encode(sse(eventName, snapshot)));
          } else {
            controller.enqueue(encoder.encode(sse("heartbeat", { updatedAt: new Date().toISOString() })));
          }
        } catch (error) {
          controller.enqueue(encoder.encode(sse("error", { message: error instanceof Error ? error.message : "Live stream update failed" })));
        }
      }

      await pushSnapshot("snapshot");
      interval = setInterval(() => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        pushSnapshot("update");
      }, 15000);

      timeout = setTimeout(safeClose, 120000);
    },
    cancel() {
      closed = true;
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
