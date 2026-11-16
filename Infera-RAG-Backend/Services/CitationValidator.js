
// Validate citation references against retrieved document sources.

// Check whether every citation in the answer exists in the sources.
const validateCitations = (answer, sources) => {
    if (!answer || typeof answer !== "string") {
        throw new Error("Answer must be a valid string");
    }

    if (!Array.isArray(sources)) {
        throw new Error("Sources must be an array");
    }

    // Extract citation numbers such as [1], [2], [3].
    const citationMatches = answer.match(/\[(\d+)\]/g) || [];

    const usedCitations = [
        ...new Set(
            citationMatches.map((citation) =>
                Number(citation.replace(/\[|\]/g, ""))
            )
        ),
    ];

    // Get source IDs that actually exist.
    const availableSources = new Set(
        sources.map((source) => source.sourceId)
    );

    // Find citations that do not have a matching source.
    const invalidCitations = usedCitations.filter(
        (citation) => !availableSources.has(citation)
    );

    return {
        isValid: invalidCitations.length === 0,
        usedCitations,
        invalidCitations,
    };
};

module.exports = {
    validateCitations,
};
