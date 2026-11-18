const path = require("path")
require("dotenv").config({
    path: path.join(__dirname, ".env"),
});

console.log(
    "API Key Loaded:",
    Boolean(process.env.GEMINI_API_KEY)
);
const {
    processDocument,
} = require("./Services/DocumentProcessor");

const {
    createChunks,
} = require("./Services/ChunkingService");

const {
    generateChunkEmbeddings,
} = require("./Services/EmbeddingService");

// Test Gemini embeddings using the first two chunks.
const testEmbedding = async () => {
    try {
        const filePath = path.join(
            __dirname,
            "Sample-Documents",
            "Rohit-Kumar-Resume.pdf"
        );

        const document = await processDocument(filePath);
        const chunks = createChunks(document);

        const testChunks = chunks.slice(0, 2);

        const embeddedChunks =
            await generateChunkEmbeddings(testChunks);

        console.log("Document:", document.fileName);
        console.log("Embedded Chunks:", embeddedChunks.length);

        embeddedChunks.forEach((chunk) => {
            console.log("\n------------------------");
            console.log("Chunk Index:", chunk.chunkIndex);
            console.log("Page Number:", chunk.pageNumber);
            console.log("Token Count:", chunk.tokenCount);
            console.log("Embedding Dimensions:", chunk.embedding.length);
            console.log("First 5 Values:", chunk.embedding.slice(0, 5));
        });
    } catch (error) {
        console.error("Embedding Test Failed:", error.message);
    }
};

testEmbedding();