
const { GoogleGenAI } = require("@google/genai");

// Connect to Gemini using the API key from .env.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Gemini model used for answer generation.
const MODEL_NAME = "gemini-2.5-flash";

// Generate an answer with citations using retrieved document context.
const generateAnswer = async ({ question, context }) => {
    try {
        // Validate the question and context.
        if (!question || !question.trim()) {
            throw new Error("Question cannot be empty");
        }

        if (!context || !context.trim()) {
            throw new Error("Context cannot be empty");
        }

        // Ask Gemini to generate answers with source citations.
        const prompt = `
You are an AI assistant for an enterprise knowledge base.

Answer the user's question using ONLY the provided document context.

Rules:
1. Do not use outside knowledge.
2. Do not invent facts or information.
3. If the answer is not available in the context, clearly say:
   "I could not find this information in the provided documents."
4. Add source citations like [1] or [2] after every factual claim.
5. Use only source numbers that actually exist in the provided context.
6. Do not create fake citations.
7. If multiple sources support an answer, cite all relevant sources.
8. Give clear and direct answers.
9. Use bullet points when useful.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}

ANSWER:
`;

        // Generate the answer using Gemini.
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        const answer = response.text;

        if (!answer || !answer.trim()) {
            throw new Error("Gemini returned an empty response");
        }

        return answer.trim();
    } catch (error) {
        throw new Error(`Gemini Answer Generation Error: ${error.message}`);
    }
};

module.exports = {
    generateAnswer,
};
