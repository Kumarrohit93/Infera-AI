
const path = require("path");

// Load environment variables before importing services.
require("dotenv").config({
    path: path.join(__dirname, ".env"),
});

const { searchDocuments } = require("./Services/SearchService");

const {
    searchSimilarChunks,
} = require("./Repositories/SearchRepository");

const ORGANIZATION_ID = "f3d1d933-a03a-4fee-acbb-c42d92ff0691";

// Check whether a function correctly rejects invalid input.
const runTest = async (testName, testFunction) => {
    try {
        await testFunction();
        console.log(`FAILED: ${testName} - Expected an error`);
    } catch (error) {
        console.log(`PASSED: ${testName}`);
        console.log("Reason:", error.message);
    }
};

const testValidation = async () => {
    console.log("\nStarting Search Validation Tests\n");

    // Test 1: Empty query should be rejected.
    await runTest("Empty query", async () => {
        await searchDocuments({
            query: "",
            organizationId: ORGANIZATION_ID,
        });
    });

    // Test 2: Missing organization ID should be rejected.
    await runTest("Missing organization ID", async () => {
        await searchDocuments({
            query: "What are my skills?",
        });
    });

    // Test 3: Invalid embedding dimensions should be rejected.
    await runTest("Invalid embedding dimensions", async () => {
        await searchSimilarChunks({
            organizationId: ORGANIZATION_ID,
            queryEmbedding: [0.1, 0.2, 0.3],
        });
    });

    // Test 4: Invalid result limit should be rejected.
    await runTest("Invalid result limit", async () => {
        await searchSimilarChunks({
            organizationId: ORGANIZATION_ID,
            queryEmbedding: Array(1536).fill(0.1),
            limit: 50,
        });
    });

    console.log("\nValidation Tests Completed");
};

testValidation();
