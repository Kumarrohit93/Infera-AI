
const { GoogleGenAI } = require("@google/genai");

// Connect to Gemini using the API key from .env.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-2.5-flash";
const MAX_RETRIES = 3;

// Check whether the error is temporary and retryable.
const isRetryableError = (error) => {
    const message = String(error.message || "");

    return (
        /\b(429|500|502|503|504)\b/.test(message) ||
        /UNAVAILABLE|RESOURCE_EXHAUSTED|fetch failed|ECONNRESET|ETIMEDOUT/i.test(message)
    );
};

// Wait before retrying.
const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

function buildPrompt({ question, context }) {
    if (!question || !question.trim()) {
        throw new Error("Question cannot be empty");
    }

    if (!context || !context.trim()) {
        throw new Error("Context cannot be empty");
    }

    return `
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
}

// Generate an answer with citations using retrieved document context.
const generateAnswer = async ({ question, context }) => {
    const prompt = buildPrompt({ question, context });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Gemini generation attempt: ${attempt + 1}`);

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
            if (attempt === MAX_RETRIES || !isRetryableError(error)) {
                throw new Error(
                    `Gemini Answer Generation Error: ${error.message}`
                );
            }

            const waitTime = 2000 * Math.pow(2, attempt);

            console.log(
                `Gemini temporarily unavailable. Retrying in ${waitTime / 1000} seconds...`
            );

            await delay(waitTime);
        }
    }
};

async function* generateAnswerStream({ question, context }) {
    const prompt = buildPrompt({ question, context });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        let receivedText = false;
        try {
            console.log(`Gemini streaming generation attempt: ${attempt + 1}`);
            const response = await ai.models.generateContentStream({
                model: MODEL_NAME,
                contents: prompt,
            });

            for await (const part of response) {
                const text = part.text || "";
                if (!text) continue;
                receivedText = true;
                yield text;
            }

            if (!receivedText) {
                throw new Error("Gemini returned an empty response");
            }
            return;
        } catch (error) {
            if (receivedText || attempt === MAX_RETRIES || !isRetryableError(error)) {
                throw new Error(`Gemini Answer Generation Error: ${error.message}`);
            }

            const waitTime = 2000 * Math.pow(2, attempt);
            console.log(
                `Gemini temporarily unavailable. Retrying in ${waitTime / 1000} seconds...`
            );
            await delay(waitTime);
        }
    }
}

module.exports = {
    generateAnswer,
    generateAnswerStream,
};
