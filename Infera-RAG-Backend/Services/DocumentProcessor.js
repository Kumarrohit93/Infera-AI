const { PDFParse } = require("pdf-parse")
const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs/promises");

const extractDocxText = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({
            path: filePath,
        });

        return result.value;
    } catch (error) {
        throw new Error(`DOCX extraction failed: ${error.message}`);
    }
};


const extractPdfText = async (filePath) => {
    let parser;

    try {
        const buffer = await fs.readFile(filePath);

        parser = new PDFParse({ data: buffer });

        const result = await parser.getText();

        const pages = result.pages.map((page) => ({
            pageNumber: page.num,
            text: page.text.trim(),
        }));

        return pages;

    } catch (error) {
        throw new Error(`PDF extraction failed: ${error.message}`);
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
};

const extractTxtText = async (filePath) => {
    try {
        const text = await fs.readFile(filePath, "utf-8");

        return text.trim();

    } catch (error) {
        throw new Error(`TXT extraction failed: ${error.message}`);
    }
};


const processDocument = async (filePath) => {
    const extension = path.extname(filePath).toLowerCase();

    let content = [];

    if (extension === ".docx") {
        const text = await extractDocxText(filePath);

        content = [{
            pageNumber: null,
            text: text.trim()
        }];
    }

    else if (extension === ".pdf") {
        content = await extractPdfText(filePath);
    }

    else if (extension === ".txt") {
        const text = await extractTxtText(filePath);

        content = [{
            pageNumber: null,
            text: text.trim()
        }];
    }

    else {
        throw new Error("Unsupported file format");
    }

    return {
        fileName: path.basename(filePath),
        fileType: extension.substring(1),
        totalPages: extension === ".pdf" ? content.length : null,
        content
    };
};



module.exports = { extractDocxText, extractPdfText, extractTxtText, processDocument };
