const { PDFParse } = require("pdf-parse")
const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs/promises");



const extractDocxText = async (filePath) => {
    try {
        const result = await mammoth.convertToHtml({
            path: filePath,
        });

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
        const sections = await extractDocxText(filePath);

        content = sections.map((section) => ({
            pageNumber: null,
            heading: section.heading,
            text: section.text,
        }));
    }

    else if (extension === ".pdf") {
        content = await extractPdfText(filePath);
    }

    else if (extension === ".txt") {
        const text = await extractTxtText(filePath);

        content = [{
            pageNumber: null,
            heading: null,
            text,
        }];
    }

    else {
        throw new Error("Unsupported file format");
    }

    return {
        fileName: path.basename(filePath),
        fileType: extension.substring(1),
        totalPages: extension === ".pdf" ? content.length : null,
        content,
    };
};



module.exports = { extractDocxText, extractPdfText, extractTxtText, processDocument };
