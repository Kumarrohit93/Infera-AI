const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs/promises");

const extractDocxText = async (source) => {
    try {
        const mammothOptions = Buffer.isBuffer(source)
            ? { buffer: source }
            : typeof source === "object" && source.buffer
            ? { buffer: source.buffer }
            : { path: source };

        const result = await mammoth.convertToHtml(mammothOptions);

        const sections = [];
        let currentHeading = "General";

        // Read paragraphs and lists from converted HTML.
        const elements = result.value.match(
            /<p[^>]*>[\s\S]*?<\/p>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<ol[^>]*>[\s\S]*?<\/ol>|<ul[^>]*>[\s\S]*?<\/ul>/gi
        ) || [];

        for (const element of elements) {
            const isHeading = /^<h[1-6]/i.test(element);

            const text = element
                .replace(/<[^>]*>/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\s+/g, " ")
                .trim();

            if (!text) continue;

            // Detect numbered bold section headings.
            const isNumberedHeading =
                /^<p[^>]*>\s*<strong>[\s\S]*?<\/strong>\s*<\/p>$/i.test(element) &&
                /^\d+\.\s+/.test(text);

            if (isHeading || isNumberedHeading) {
                currentHeading = text;
                continue;
            }

            sections.push({
                heading: currentHeading,
                text,
            });
        }

        return sections;
    } catch (error) {
        throw new Error(`DOCX extraction failed: ${error.message}`);
    }
};

const extractPdfText = async (source) => {
    let parser;

    try {
        const buffer = Buffer.isBuffer(source)
            ? source
            : typeof source === "object" && source.buffer
            ? source.buffer
            : await fs.readFile(source);

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

const extractTxtText = async (source) => {
    try {
        if (Buffer.isBuffer(source)) {
            return source.toString("utf-8").trim();
        }
        if (typeof source === "object" && source.buffer) {
            return source.buffer.toString("utf-8").trim();
        }
        const text = await fs.readFile(source, "utf-8");
        return text.trim();
    } catch (error) {
        throw new Error(`TXT extraction failed: ${error.message}`);
    }
};

const processDocument = async (input) => {
    let filePath = null;
    let buffer = null;
    let fileName = "";
    let extension = "";

    if (typeof input === "string") {
        filePath = input;
        fileName = path.basename(filePath);
        extension = path.extname(filePath).toLowerCase();
    } else if (input && typeof input === "object") {
        filePath = input.filePath || null;
        buffer = input.buffer || null;
        fileName = input.originalFilename || (filePath ? path.basename(filePath) : "document");
        extension = input.extension
            ? (input.extension.startsWith(".") ? input.extension.toLowerCase() : `.${input.extension.toLowerCase()}`)
            : (filePath ? path.extname(filePath).toLowerCase() : "");
    } else {
        throw new Error("Invalid document processor input");
    }

    let content = [];

    if (extension === ".docx") {
        const sections = await extractDocxText(buffer || filePath);
        content = sections.map((section) => ({
            pageNumber: null,
            heading: section.heading,
            text: section.text,
        }));
    } else if (extension === ".pdf") {
        content = await extractPdfText(buffer || filePath);
    } else if (extension === ".txt") {
        const text = await extractTxtText(buffer || filePath);
        content = [{
            pageNumber: null,
            heading: null,
            text,
        }];
    } else {
        throw new Error("Unsupported file format");
    }

    return {
        fileName,
        fileType: extension.substring(1),
        totalPages: extension === ".pdf" ? content.length : null,
        content,
    };
};

module.exports = {
    extractDocxText,
    extractPdfText,
    extractTxtText,
    processDocument,
};
