import { Router } from "express";
import type { Request, Response } from "express";
import { runAgent } from "../agents/loan-product-assistant/run-agent.js";

const router = Router();

router.post("/llm_threads/:id/messages", async (req: Request, res: Response) => {
  const { message } = req.body;

  // Simple way to identify the "contractor" making the request.
  // Skipping authentication for this prototype.
  const contractorId = req.headers["x-contractor-id"] as string | undefined;
  if (!contractorId) {
    res.status(401).json({ error: "x-contractor-id header is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders(); // Send headers immediately to establish SSE connection

  await runAgent(message, contractorId, res);
  res.end();
});

export default router;
