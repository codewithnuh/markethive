// Import required dependencies
import { generateText } from "ai";
import { createOpenAI as createGroq } from "@ai-sdk/openai";

// Initialize Groq client with API configuration
const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Set edge runtime for optimal performance
export const runtime = "edge";

// Constants for AI model configuration
const MODEL_NAME = "llama-3.1-70b-versatile";
const MAX_WORDS = 10;
const SYSTEM_PROMPT = `You are a product title optimization AI. Your only task is to return ONE optimized version of the given product title. Do not provide any explanations, comments, or multiple options. Return only the final optimized title. Keep it concise, under ${MAX_WORDS} words, and focus on key product features and brand names. Do not use special characters or numbers.`;

// Helper function to clean and format text
const cleanText = (text: string): string => {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(" ")
    .slice(0, MAX_WORDS)
    .join(" ");
};

export async function POST(req: Request) {
  try {
    // Extract prompt from request body
    const { prompt } = await req.json();

    // Generate optimized title using AI
    const { text } = await generateText({
      model: groq(MODEL_NAME),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.5, // Reduced for more focused responses
      maxTokens: 30, // Reduced to limit response length
      topP: 1,
      frequencyPenalty: 0.5, // Added to reduce repetitive words
      presencePenalty: 0.5, // Added to encourage diversity
    });

    // Process and clean the generated text
    const cleanedText = cleanText(text);
    console.log("Optimized title:", cleanedText);

    // Return successful response
    return new Response(JSON.stringify({ text: cleanedText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Log and handle errors
    console.error("Error generating text:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
