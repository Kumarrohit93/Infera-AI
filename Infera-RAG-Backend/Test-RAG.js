require("dotenv").config();

const { searchDocuments } = require("./Services/SearchService");

// Test the complete RAG pipeline.
const testRAG = async () => {
    try {
        const result = await searchDocuments({
            query: "Explain Node.js fundamentals and its event loop?",
            organizationId: "f3d1d933-a03a-4fee-acbb-c42d92ff0691",
            limit: 5,
            minSimilarity: 0.50,
        });

        console.log("\n========== RAG RESULT ==========\n");

        console.log("Question:", result.query);
        console.log("Total Sources:", result.totalResults);

        console.log("\nGenerated Answer:\n");
        console.log(result.answer);

        console.log("\n================================\n");

        console.log("\nSource References:");

        result.sources.forEach((source) => {
            console.log(`\n[${source.sourceId}] ${source.documentName}`);
            console.log("Page:", source.pageNumber);
            console.log("Similarity:", source.similarity);
        });

        result.sources.forEach((source) => {
            console.log(`\n[${source.sourceId}] ${source.documentName}`);
            console.log("Section:", source.heading);
            console.log("Chunk Index:", source.chunkIndex);
            console.log("Page:", source.pageNumber);
            console.log("Similarity:", source.similarity);
        });

        console.log("\n========== CITATION VALIDATION ==========\n");

        console.log(result.citationValidation);

        console.log("\n=========================================\n");
    } catch (error) {
        console.error("RAG Test Failed:", error.message);
    }
};

testRAG();