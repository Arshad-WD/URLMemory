import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "mistralai/mixtral-8x22b-instruct-v0.1";
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

export async function enrichBookmark(url: string, title: string | null, textContent: string) {
  const prompt = `
    Analyze the following bookmarked content.
    URL: ${url}
    Title: ${title || "Unknown"}
    Content Snippet: ${textContent.slice(0, 5000)}

    Provide:
    1. A concise 1-sentence summary (max 150 chars).
    2. A list of 3-5 relevant tags.
    3. A brief "why it matters" insight.

    Format the response as STRICT JSON only:
    {
      "summary": "...",
      "tags": ["...", "..."],
      "insight": "..."
    }
  `;

  // Try NVIDIA First
  if (NVIDIA_API_KEY) {
    try {
      const response = await axios.post(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        {
          model: NVIDIA_MODEL,
          messages: [
            { role: "system", content: "You are a helpful AI that summarizes web content into structured JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 1024,
        },
        {
          headers: {
            "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const text = response.data.choices[0].message.content;
      return parseJsonResponse(text);
    } catch (error) {
      console.error("NVIDIA AI Enrichment failed, falling back...", error);
    }
  }

  // Fallback to Gemini
  if (geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return parseJsonResponse(text);
    } catch (error) {
      console.error("Gemini AI Enrichment failed:", error);
    }
  }

  console.warn("No AI API keys available or all requests failed.");
  return null;
}

function parseJsonResponse(text: string) {
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI JSON response:", text);
    return null;
  }
}
