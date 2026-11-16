
const path = require("path");

// Load environment variables before importing services.
require("dotenv").config({
    path: path.join(__dirname, ".env"),
});

const { processDocument } = require("./Services/DocumentProcessor.js");
const { createChunks } = require("./Services/ChunkingService.js");
const {
    generateChunkEmbeddings,
} = require("./Services/EmbeddingService");
const {
    saveDocumentChunks,
} = require("./Repositories/ChunkRepositery.js");

// Test document and organization IDs from PostgreSQL.
const DOCUMENT_ID = "afde8c59-c856-41bf-be80-546b4112314f";
const ORGANIZATION_ID = "f3d1d933-a03a-4fee-acbb-c42d92ff0691";

const testStorage = async () => {
    try {
        // Extract text from the sample PDF.
        const filePath = path.join(
            __dirname,
            "Sample-Documents",
            "Rohit-Kumar-Resume.pdf"
        );

        const document = await processDocument(filePath);

        console.log("Document:", document.fileName);

        // Split extracted text into chunks.
        const chunks = createChunks(document);

        console.log("Generated Chunks:", chunks.length);

        // Generate Gemini embeddings for all chunks.
        const embeddedChunks = await generateChunkEmbeddings(chunks);

        console.log("Generated Embeddings:", embeddedChunks.length);
        console.log(
            "Embedding Dimensions:",
            embeddedChunks[0].embedding.length
        );

        // Save chunks and embeddings in PostgreSQL.
        const result = await saveDocumentChunks({
            documentId: DOCUMENT_ID,
            organizationId: ORGANIZATION_ID,
            chunks: embeddedChunks,
        });

        console.log("\nStorage Successful!");
        console.log("Document ID:", result.documentId);
        console.log("Saved Chunks:", result.savedChunks);
    } catch (error) {
        console.error("Storage Test Failed:", error.message);
    }
};

testStorage();
