
const { GoogleGenAI } = require("@google/genai");

// Connect to Gemini using the API key from .env.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-embedding-001";

const EMBEDDING_DIMENSION = Number(
    process.env.EMBEDDING_DIMENSION || 1536
);

const EMBEDDING_BATCH_SIZE = 32;
const MAX_RATE_LIMIT_RETRIES = 3;

const delay = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

const getRateLimitDelay = (error, retryCount) => {
    const retryDelay = String(error.message || "").match(/retry in ([\d.]+)s/i);

    if (retryDelay) {
        return Math.ceil(Number(retryDelay[1]) * 1000);
    }

    return Math.min(1000 * (2 ** retryCount), 10000);
};

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

const generateEmbeddings = async (texts, taskType) => {
    let response;

    for (let retryCount = 0; ; retryCount += 1) {
        try {
            response = await ai.models.embedContent({
                model: MODEL_NAME,
                contents: texts,
                config: {
                    taskType,
                    outputDimensionality: EMBEDDING_DIMENSION,
                },
            });
            break;
        } catch (error) {
            if (error.status !== 429 || retryCount >= MAX_RATE_LIMIT_RETRIES) {
                throw error;
            }

            const retryDelay = getRateLimitDelay(error, retryCount);
            console.warn(
                `[Embedding] Gemini rate limit reached; retrying in ${Math.ceil(retryDelay / 1000)}s`
            );
            await delay(retryDelay);
        }
    }

    if (
        !response ||
        !Array.isArray(response.embeddings) ||
        response.embeddings.length !== texts.length
    ) {
        throw new Error("Gemini returned an unexpected number of embeddings");
    }

    return response.embeddings.map(({ values }) => {
        if (
            !Array.isArray(values) ||
            values.length !== EMBEDDING_DIMENSION
        ) {
            throw new Error("Unexpected embedding dimensions");
        }

        return normalizeEmbedding(values);
    });
};

// Generate a normalized embedding for the given text.
const generateEmbedding = async (text, taskType = "RETRIEVAL_DOCUMENT") => {
    try {
        if (!text || !text.trim()) {
            throw new Error("Text cannot be empty");
        }

        const [embedding] = await generateEmbeddings([text], taskType);
        return embedding;
    } catch (error) {
        throw new Error(`Gemini Embedding Error: ${error.message}`);
    }
};

// Generate embeddings for all document chunks.
const generateChunkEmbeddings = async (chunks) => {
    const embeddedChunks = [];

    try {
        for (
            let index = 0;
            index < chunks.length;
            index += EMBEDDING_BATCH_SIZE
        ) {
            const chunkBatch = chunks.slice(
                index,
                index + EMBEDDING_BATCH_SIZE
            );
            const texts = chunkBatch.map((chunk) => chunk.text);

            if (texts.some((text) => !text || !text.trim())) {
                throw new Error("Text cannot be empty");
            }

            const embeddings = await generateEmbeddings(
                texts,
                "RETRIEVAL_DOCUMENT"
            );

            embeddedChunks.push(
                ...chunkBatch.map((chunk, batchIndex) => ({
                    ...chunk,
                    embedding: embeddings[batchIndex],
                }))
            );
        }
    } catch (error) {
        throw new Error(`Gemini Embedding Error: ${error.message}`);
    }

    return embeddedChunks;
};

module.exports = {
    generateEmbedding,
    generateChunkEmbeddings,
};
