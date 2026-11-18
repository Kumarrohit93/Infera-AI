
const path = require("path");

// Load environment variables before importing services.
require("dotenv").config({
    path: path.join(__dirname, ".env"),
});

const { searchDocuments } = require("./Services/SearchService");

// Use the test organization created in PostgreSQL.
const ORGANIZATION_ID = "f3d1d933-a03a-4fee-acbb-c42d92ff0691";

// Test document retrieval using a natural language question.
const testSearch = async () => {
    try {
        const query = "What are my technical skills and programming languages?";

        console.log("Search Query:", query);
        console.log("\nSearching documents...\n");

        const response = await searchDocuments({
            query,
            organizationId: ORGANIZATION_ID,
            limit: 5,
            minSimilarity: 0.50,
        });

        console.log("Search Successful!");
        console.log("Total Results:", response.totalResults);

        console.log("\n------------------------");

        // Display the retrieved document chunks.
        response.results.forEach((result, index) => {
            console.log(`\nResult ${index + 1}`);
            console.log("Document:", result.original_filename);
            console.log("Page Number:", result.page_number);
            console.log("Chunk Index:", result.chunk_index);
            console.log("Similarity:", Number(result.similarity).toFixed(4));
            console.log("Text:", result.chunk_text);
            console.log("------------------------");
        });
    } catch (error) {
        console.error("Search Test Failed:", error.message);
    }
};

testSearch();
