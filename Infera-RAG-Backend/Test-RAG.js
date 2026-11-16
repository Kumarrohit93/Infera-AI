require("dotenv").config();

const { searchDocuments } = require("./Services/SearchService");

// Test the complete RAG pipeline.
const testRAG = async () => {
    try {
        const result = await searchDocuments({
            query: "What is my favorite programming language?",
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
    } catch (error) {
        console.error("RAG Test Failed:", error.message);
    }
};

testRAG();