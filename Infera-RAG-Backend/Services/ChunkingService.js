
const { get_encoding } = require("@dqbd/tiktoken");

const encoding = get_encoding("cl100k_base");

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 75;

const createChunks = (document) => {
    const chunks = [];
    let globalChunkIndex = 0;

    document.content.forEach((page) => {
        const tokens = encoding.encode(page.text);

        let start = 0;

        while (start < tokens.length) {
            const end = Math.min(start + CHUNK_SIZE, tokens.length);

            const chunkTokens = tokens.slice(start, end);
            const chunkText = encoding.decode(chunkTokens);

            chunks.push({
                chunkIndex: globalChunkIndex,
                documentName: document.fileName,
                fileType: document.fileType,
                pageNumber: page.pageNumber,
                text: Buffer.from(chunkText).toString("utf-8").trim(),
                tokenCount: chunkTokens.length
            });

            globalChunkIndex++;

            if (end === tokens.length) break;

            start = end - CHUNK_OVERLAP;
        }
    });

    return chunks;
};

module.exports = { createChunks };
