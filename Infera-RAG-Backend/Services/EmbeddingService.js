
const { GoogleGenAI } = require("@google/genai");

// Connect to Gemini using the API key from .env.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-embedding-001";

const EMBEDDING_DIMENSION = Number(
    process.env.EMBEDDING_DIMENSION || 1536
);

// Normalize the embedding vector to unit length.
const normalizeEmbedding = (embedding) => {
    const magnitude = Math.sqrt(
        embedding.reduce((sum, value) => sum + value * value, 0)
    );

    if (magnitude === 0) {
        throw new Error("Cannot normalize a zero embedding");
    }

    return embedding.map((value) => value / magnitude);
};

// Generate a normalized embedding for the given text.
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

        const embedding = response.embeddings[0].values;

        if (embedding.length !== EMBEDDING_DIMENSION) {
            throw new Error("Unexpected embedding dimensions");
        }

        return normalizeEmbedding(embedding);
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
