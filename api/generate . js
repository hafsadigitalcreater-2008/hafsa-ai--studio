import { fal } from "@fal-ai/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST requests only"
    });
  }

  if (!process.env.FAL_KEY) {
    return res.status(500).json({
      error: "FAL_KEY is not configured"
    });
  }

  const { prompt, aspect_ratio = "9:16" } = req.body || {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({
      error: "Please enter a video prompt"
    });
  }

  try {
    fal.config({
      credentials: process.env.FAL_KEY
    });

    const result = await fal.queue.submit(
      "fal-ai/wan/v2.2-5b/text-to-video",
      {
        input: {
          prompt: prompt.trim(),
          aspect_ratio
        }
      }
    );

    return res.status(200).json({
      requestId: result.request_id,
      status: "IN_QUEUE"
    });
  } catch (error) {
    console.error("fal.ai request failed:", error);

    return res.status(500).json({
      error: "Video request failed. Check server logs."
    });
  }
}
