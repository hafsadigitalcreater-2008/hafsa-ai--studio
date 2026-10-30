
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(500).json({ error: "Gemini API key is not configured." });
  }

  const prompt = req.body?.prompt;
  const ratio = req.body?.aspect_ratio || "1:1";

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Please describe your image." });
  }

  if (!["1:1", "9:16", "16:9"].includes(ratio)) {
    return res.status(400).json({ error: "Invalid image format." });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt.trim().slice(0, 4000) }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            imageConfig: {
              aspectRatio: ratio
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Image generation failed."
      });
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    const image = parts.find(part => part.inlineData?.data);

    if (!image) {
      return res.status(500).json({
        error: "No image returned. Please try another prompt."
      });
    }

    return res.status(200).json({
      imageUrl: `data:${image.inlineData.mimeType};base64,${image.inlineData.data}`
    });

  } catch (error) {
    return res.status(500).json({
      error: "Image service is temporarily unavailable."
    });
  }
}
