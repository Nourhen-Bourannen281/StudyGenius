const PDFDocument = require("pdfkit");

// Génère un PDF à partir d'un résumé structuré, et l'écrit directement
// dans la réponse HTTP (streaming, pas de fichier temporaire sur le disque)
const generateSummaryPDF = (res, { courseTitle, courseSubject, summary }) => {
  const doc = new PDFDocument({ margin: 50 });

  // On dit au navigateur que c'est un fichier à télécharger, pas à afficher
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="resume-${courseTitle.replace(/[^a-z0-9]/gi, "_")}.pdf"`
  );

  doc.pipe(res);

  // --- En-tête ---
  doc
    .fontSize(20)
    .fillColor("#5b6ef5")
    .text("StudyGenius", { align: "left" });

  doc.moveDown(0.3);
  doc
    .fontSize(16)
    .fillColor("#111111")
    .text(courseTitle, { align: "left" });

  doc
    .fontSize(11)
    .fillColor("#666666")
    .text(courseSubject || "Général");

  doc.moveDown(1);
  doc
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(1);

  // --- Sections du résumé ---
  (summary.sections || []).forEach((section) => {
    doc
      .fontSize(13)
      .fillColor("#5b6ef5")
      .text(section.heading, { align: "left" });

    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .fillColor("#333333")
      .text(section.content, { align: "left", lineGap: 3 });

    doc.moveDown(1);
  });

  // --- Points clés ---
  if (summary.keyPoints?.length > 0) {
    doc.moveDown(0.5);
    doc
      .fontSize(13)
      .fillColor("#5b6ef5")
      .text("Points clés");

    doc.moveDown(0.3);
    summary.keyPoints.forEach((point) => {
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(`•  ${point}`, { align: "left", lineGap: 2 });
    });
  }

  // --- Pied de page ---
  doc.moveDown(2);
  doc
    .fontSize(9)
    .fillColor("#999999")
    .text(`Généré le ${new Date().toLocaleDateString("fr-FR")} — StudyGenius`, {
      align: "center",
    });

  doc.end();
};

module.exports = { generateSummaryPDF };