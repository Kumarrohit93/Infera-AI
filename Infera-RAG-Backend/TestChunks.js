
const path = require("path");

const { processDocument } = require("./Services/DocumentProcessor");
const { createChunks } = require("./Services/ChunkingService");

const testChunking = async () => {
    try {
        const filePath = path.join(
            __dirname,
            "Sample-Documents",
            "Rohit-Kumar-Resume.pdf"
        );

        const document = await processDocument(filePath);

        const chunks = createChunks(document);

        console.log("Document:", document.fileName);
        console.log("Total Chunks:", chunks.length);

        chunks.forEach((chunk) => {
            console.log("\n------------------------");
            console.log("Chunk Index:", chunk.chunkIndex);
            console.log("File type: ", chunk.fileType)
            console.log("Document:", chunk.documentName);
            console.log("Page:", chunk.pageNumber);
            console.log("Tokens:", chunk.tokenCount);
            console.log("Text:", chunk.text);
        });

    } catch (error) {
        console.error("Chunking Error:", error);
    }
};

testChunking();
