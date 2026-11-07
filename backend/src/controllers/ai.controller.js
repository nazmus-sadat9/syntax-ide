import { ai, MODEL, SYSTEM } from "../utils/gemini.js";

export const chat = async (req, res) => {
  try {
    const { message, code = "", filename = "", language = "", history = [] } = req.body;

    if (!message?.trim()) return res.status(400).json({ error: "Message required" });
    if (code.length > 30000) return res.status(413).json({ error: "File too large" });

    const contents = [
      ...history.slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
      {
        role: "user",
        parts: [{
          text: `File: ${filename} (${language})\n\`\`\`${language}\n${code}\n\`\`\`\n\n${message}`,
        }],
      },
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction: SYSTEM },
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
};
