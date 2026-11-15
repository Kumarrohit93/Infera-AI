
// This file builds document context for Gemini answer generation.

// Convert retrieved document chunks into readable context.
const buildContext = (chunks) => {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        throw new Error("No document chunks available to build context");
    }

    // Add document name, page number and text for every chunk.
    const context = chunks.map((chunk, index) => {
        return `
SOURCE ${index + 1}
Document: ${chunk.original_filename}
Page: ${chunk.page_number || "Not available"}
Content:
${chunk.chunk_text}
`;
    });

    // Combine all document sources into one context string.
    return context.join("\n------------------------\n");
};

module.exports = {
    buildContext,
};
