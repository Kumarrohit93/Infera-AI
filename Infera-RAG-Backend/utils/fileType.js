const PDF_HEADER = Buffer.from("%PDF-")
const ZIP_HEADER = Buffer.from([0x50, 0x4b, 0x03, 0x04])
const DOCX_MARKER = Buffer.from("word/document.xml")

function detectFileType(buffer) {
  if (!buffer || buffer.length === 0) return null

  if (buffer.subarray(0, PDF_HEADER.length).equals(PDF_HEADER)) {
    return { ext: "pdf", mime: "application/pdf" }
  }

  if (buffer.subarray(0, ZIP_HEADER.length).equals(ZIP_HEADER)) {
    if (buffer.includes(DOCX_MARKER)) {
      return {
        ext: "docx",
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }
    }
    return null
  }

  if (!buffer.includes(0)) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(buffer)
      return { ext: "txt", mime: "text/plain" }
    } catch (err) {
      return null
    }
  }

  return null
}

module.exports = { detectFileType }