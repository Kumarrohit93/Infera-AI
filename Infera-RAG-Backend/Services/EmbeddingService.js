// This file generates embeddings for document chunks using Gemini API.

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-embedding-001";
const EMBEDDING_DIMENSION = Number(
    process.env.EMBEDDING_DIMENSION || 3072
);

// Generate an embedding for one text.
const generateEmbedding = async (
    text,
    taskType = "RETRIEVAL_DOCUMENT"
) => {
    try {
        if (!text || !text.trim()) {
            throw new Error("Text cannot be empty");
        }

        const response = await ai.models.embedContent({
            model: MODEL_NAME,
            contents: text,
            config: {
                taskType,
                outputDimensionality: EMBEDDING_DIMENSION,
            },
        });

        return response.embeddings[0].values;
    } catch (error) {
        throw new Error(`Gemini Embedding Error: ${error.message}`);
    }
};

// Generate embeddings for all document chunks.
const generateChunkEmbeddings = async (chunks) => {
    const embeddedChunks = [];

    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text);

        embeddedChunks.push({
            ...chunk,
            embedding,
        });
    }

    return embeddedChunks;
};

module.exports = {
    generateEmbedding,
    generateChunkEmbeddings,
};