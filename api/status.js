import { fal } from "@fal-ai/client";

const MODEL = "fal-ai/wan/v2.2-5b/text-to-video";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST requests only" });
  }

  const { requestId } = req.body || {};

  if (!requestId || typeof requestId !== "string") {
    return res.status(400).json({ error: "requestId is required" });
  }

  if (!process.env.FAL_KEY) {
    return res.status(500).json({ error: "FAL_KEY is not configured" });
  }

  try {
    fal.config({ credentials: process.env.FAL_KEY });

    const status = await fal.queue.status(MODEL, { requestId });

    if (status.status !== "COMPLETED") {
      return res.status(200).json({
        status: status.status
      });
    }

    const result = await fal.queue.result(MODEL, { requestId });

    return res.status(200).json({
      status: "COMPLETED",
      video: result.data.video?.url || null
    });
  } catch (error) {
    console.error("Video status error:", error);
    return res.status(500).json({
      error: "Could not check video status"
    });
  }
}
