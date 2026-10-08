const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);

  const parser = new PDFParse({ data: fileBuffer });
  const result = await parser.getText();
  await parser.destroy();

  return result.text;
};

module.exports = { extractTextFromPDF };