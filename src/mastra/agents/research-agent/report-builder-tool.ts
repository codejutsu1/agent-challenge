import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { PDFDocument, StandardFonts } from "pdf-lib";
import axios from "axios";
import FormData from "form-data";

export const reportBuilderTool = createTool({
  id: "build-report-pdf",
  description: "Generate a textual and downloadable PDF report from paper summaries",
  inputSchema: z.object({
    topic: z.string(),
    summaries: z.array(z.object({
      title: z.string(),
      abstract: z.string(),
      year: z.number(),
      authors: z.array(z.string()),
      url: z.string(),
    })),
  }),
  outputSchema: z.object({
    reportText: z.string(),
    // downloadUrl: z.string(),
  }),
  execute: async ({ context }) => {
    const { topic, summaries } = context;

    let reportText = `# Research Summary: ${topic}\n\n`;
    summaries.forEach((s, i) => {
      const abstract = s.abstract ? s.abstract : "No abstract available.";
      reportText += `### ${i + 1}. ${s.title} (${s.year})\n`;
      reportText += `**Authors:** ${s.authors.join(", ")}\n`;
      reportText += `**Abstract:** ${abstract}\n`;
      reportText += `**Link:** [Read paper](${s.url})\n\n`;
    });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;

    const wrapText = (text: string, maxWidth: number, fontSize: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let line = "";

      for (const word of words) {
        const testLine = line + word + " ";
        const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (lineWidth > maxWidth) {
          lines.push(line.trim());
          line = word + " ";
        } else {
          line = testLine;
        }
      }

      if (line.trim()) lines.push(line.trim());
      return lines;
    };

    const writeWrappedText = (text: string, size: number) => {
      const lines = wrapText(text, width - 2 * margin, size);
      for (const line of lines) {
        if (y < 60) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        page.drawText(line, {
          x: margin,
          y,
          size,
          font,
        });
        y -= size + 4;
      }
    };

    writeWrappedText(`Research Summary: ${topic}`, 16);
    y -= 10;

    summaries.forEach((s, i) => {
      writeWrappedText(`${i + 1}. ${s.title} (${s.year})`, 14);
      writeWrappedText(`Authors: ${s.authors.join(", ")}`, 10);
      writeWrappedText(`Abstract: ${s.abstract}`, 10);
      writeWrappedText(`Link: ${s.url}`, 10);
      y -= 10;
    });

    const pdfBytes = await pdfDoc.save();

    const formData = new FormData();
    formData.append("file", Buffer.from(pdfBytes), {
      filename: "report.pdf",
      contentType: "application/pdf",
    });

    const uploadRes = await axios.post("https://file.io", formData, {
      headers: formData.getHeaders(),
    });

    if (!uploadRes.data.success) {
      throw new Error("Failed to upload PDF to file.io");
    }
    
    console.log(uploadRes.data)

    const downloadUrl = uploadRes.data.link;
    reportText += `\n\n[Download PDF Report](${downloadUrl})\n`;

    return {
      reportText,
    };
  },
});
