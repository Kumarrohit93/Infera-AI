
const path = require("path");

const { processDocument } = require("./Services/DocumentProcessor.js");

const testExtraction = async () => {
    try {
        const files = [
            "Backend all Topic.docx",
            "Rohit-Kumar-Resume.pdf",
            "Sample.txt"
        ];

        for (const file of files) {
            const filePath = path.join(
                __dirname,
                "Sample-Documents",
                file
            );

            console.log(`\n========== ${file} ==========`);

            const document = await processDocument(filePath);

            console.log("File Name:", document.fileName);
            console.log("File Type:", document.fileType);
            console.log("Total Pages:", document.totalPages);
            console.log("Content:");

            document.content.forEach((item, index) => {
                console.log(`\nContent ${index + 1}`);
                console.log("Page Number:", item.pageNumber);
                console.log("Text:", item.text);
            });
        }

        console.log("\nAll documents processed successfully!");

    } catch (error) {
        console.error("\nDocument Processing Error:", error.message);
    }
};

testExtraction();
