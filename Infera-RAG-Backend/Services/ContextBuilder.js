
// This file builds document context and source references for Gemini.

const buildContext = (chunks) => {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        throw new Error("No document chunks available to build context");
    }

    // Create structured source references.
    const sources = chunks.map((chunk, index) => ({
        sourceId: index + 1,
        documentId: chunk.document_id,
        documentName: chunk.original_filename,
        chunkId: chunk.chunk_id,
        chunkIndex: chunk.chunk_index,
        heading: chunk.heading || null,
        pageNumber: chunk.page_number,
        similarity: Number(chunk.similarity),
    }));

    // Build readable context with document headings.
    const context = chunks.map((chunk, index) => {
        return `
SOURCE [${index + 1}]
Document: ${chunk.original_filename}
Section: ${chunk.heading || "General"}
Page: ${chunk.page_number || "Not available"}
Content:
${chunk.chunk_text}
`;
    }).join("\n------------------------\n");

    return {
        context,
        sources,
    };
};

module.exports = {
    buildContext,
};
