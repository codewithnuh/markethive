import { generateText } from "ai";
import { createOpenAI as createGroq } from "@ai-sdk/openai";

// Initialize Groq client with API configuration
const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1", // Groq API endpoint
  apiKey: process.env.GROQ_API_KEY, // API key should be set in environment variables
});

export const runtime = "edge"; // Enable edge runtime for better performance

/**
 * POST endpoint to enhance product descriptions using AI
 * @param req Request object containing the product description prompt
 * @returns Enhanced description with metadata
 */
export async function POST(req: Request) {
  try {
    // Extract prompt from request body
    const { prompt } = await req.json();

    // Validate input prompt
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid description prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate enhanced description using Groq API
    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      messages: [
        {
          role: "system",
          content:
            "You are a product description enhancement AI. Your task is to enhance product descriptions to be more engaging, SEO-friendly, and persuasive. Follow these rules:\n" +
            "1. Focus on benefits and key features\n" +
            "2. Use active voice and engaging language\n" +
            "3. Include relevant keywords naturally\n" +
            "4. Keep paragraphs short and scannable\n" +
            "5. Maintain a professional tone\n" +
            "6. Return only the enhanced description without any explanations or comments\n" +
            "7. Keep the description between 100-300 words",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      // AI generation parameters
      temperature: 0.7, // Balanced between creativity and consistency
      maxTokens: 200, // Increased for longer descriptions
      topP: 0.9, // Slightly reduced for more focused outputs
      frequencyPenalty: 0.6, // Increased to reduce repetitive phrases
      presencePenalty: 0.6, // Increased to encourage diverse language
    });

    // Clean and format the generated text
    const cleanedText = text
      .trim()
      // Remove multiple spaces
      .replace(/\s+/g, " ")
      // Remove markdown formatting
      .replace(/[#*_`~]/g, "")
      // Ensure proper spacing after punctuation
      .replace(/([.,!?])([^\s])/g, "$1 $2")
      // Remove any HTML tags
      .replace(/<[^>]*>/g, "")
      // Ensure proper capitalization of sentences
      .replace(/(^\w|\.\s+\w)/g, (letter) => letter.toUpperCase());

    // Validate the processed output
    if (!cleanedText || cleanedText.length < 50) {
      throw new Error("Generated description is too short or invalid");
    }

    // Log the enhanced description for debugging
    console.log("Enhanced description:", cleanedText);

    // Return successful response with enhanced text and metadata
    return new Response(
      JSON.stringify({
        text: cleanedText,
        originalLength: prompt.length,
        enhancedLength: cleanedText.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Log error for debugging
    console.error("Error enhancing description:", error);

    // Check if the error is due to rate limiting
    const isRateLimitError = error.message
      ?.toLowerCase()
      .includes("rate limit");

    // Return appropriate error response
    return new Response(
      JSON.stringify({
        error: isRateLimitError
          ? "Service is currently busy. Please try again in a moment."
          : "Failed to enhance description. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      {
        status: isRateLimitError ? 429 : 500,
        headers: {
          "Content-Type": "application/json",
          ...(isRateLimitError && { "Retry-After": "30" }),
        },
      }
    );
  }
}
