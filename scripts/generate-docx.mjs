import fs from "node:fs";
import path from "node:path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const projectRoot = process.cwd();
const docsDir = path.join(projectRoot, "docs", "entrega");
const logoBuffer = fs.readFileSync(path.join(projectRoot, "logo-MG.png"));
const issueDate = "19/03/2026";

const docs = [
  ["01-acta-entrega-interna.md", "MG-DES-ENT-001", "Acta de Entrega Interna", "Formalizar la entrega interna del sistema MGCalc para su recepcion, control y pase operativo."],
  ["02-documento-alcance.md", "MG-DES-ALC-001", "Documento de Alcance", "Definir el alcance funcional y tecnico del sistema entregado al cliente interno."],
  ["03-manual-usuario.md", "MG-DES-MUS-001", "Manual de Usuario", "Guiar al usuario interno en la operacion correcta del sistema MGCalc."],
  ["04-manual-tecnico.md", "MG-DES-MTE-001", "Manual Tecnico", "Documentar la arquitectura, configuracion y mantenimiento del sistema para soporte y continuidad."],
  ["05-accesos-entrega-tecnica.md", "MG-DES-AET-001", "Accesos y Entrega Tecnica", "Consolidar los accesos, responsables y datos de traspaso tecnico del proyecto."],
];

function cleanText(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function makeRuns(text) {
  return [new TextRun({ text: cleanText(text), size: 22 })];
}

function p(text, options = {}) {
  return new Paragraph({
    spacing: { line: 300, after: 120 },
    ...options,
    children: makeRuns(text),
  });
}

function heading(text, level = 1) {
  const map = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  };

  return new Paragraph({
    heading: map[level],
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: cleanText(text),
        bold: true,
        color: "1F3A5F",
        size: level === 1 ? 30 : 24,
      }),
    ],
  });
}

function infoTable(code) {
  const rows = [
    ["Codigo del documento", code],
    ["Proyecto", "MGCalc - Calculadora de Inversion de Lotes"],
    ["Area responsable", "Area de Desarrollo"],
    ["Version", "1.0"],
    ["Fecha de emision", issueDate],
    ["Estado", "Emitido para cliente interno"],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { fill: "D9E2F3" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 20 })] })],
          }),
        ],
      }),
    ),
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "B8C2CC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "B8C2CC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "B8C2CC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "B8C2CC" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D9E2EC" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D9E2EC" },
    },
  });
}

function parseTable(lines) {
  const data = lines.filter((line) => line.trim() && !/^(\|\s*-)/.test(line.trim()));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: data.map((line, index) => {
      const values = line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((item) => cleanText(item.trim()));

      return new TableRow({
        children: values.map((value) =>
          new TableCell({
            shading: index === 0 ? { fill: "EAF0F6" } : undefined,
            margins: { top: 90, bottom: 90, left: 110, right: 110 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: value, size: 20, bold: index === 0 })],
              }),
            ],
          }),
        ),
      });
    }),
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "C5CED8" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "C5CED8" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "C5CED8" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "C5CED8" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D8DEE9" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D8DEE9" },
    },
  });
}

function parseMarkdown(content) {
  const lines = content.replace(/^#\s+.+\n+/m, "").replace(/\r/g, "").split("\n");
  const out = [];
  let para = [];
  let table = [];
  let code = [];
  let inCode = false;

  function flushPara() {
    if (!para.length) return;
    out.push(p(para.join(" "), { alignment: AlignmentType.JUSTIFIED }));
    para = [];
  }

  function flushTable() {
    if (!table.length) return;
    out.push(parseTable(table));
    out.push(new Paragraph({ text: "" }));
    table = [];
  }

  function flushCode() {
    if (!code.length) return;
    out.push(
      new Paragraph({
        shading: { fill: "F4F6F8" },
        border: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "D8DEE9" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "D8DEE9" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "D8DEE9" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "D8DEE9" },
        },
        spacing: { after: 120 },
        children: code.map((line, index) => new TextRun({ text: line, font: "Consolas", size: 18, break: index ? 1 : 0 })),
      }),
    );
    code = [];
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushPara();
      flushTable();
      if (inCode) flushCode();
      inCode = !inCode;
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (/^\|.*\|$/.test(line.trim())) {
      flushPara();
      table.push(line);
      continue;
    }

    if (table.length) flushTable();

    if (!line.trim()) {
      flushPara();
      continue;
    }

    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      flushPara();
      out.push(heading(h[2], h[1].length));
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushPara();
      out.push(
        p(bullet[1], {
          bullet: { level: 0 },
          indent: { left: 420 },
          alignment: AlignmentType.JUSTIFIED,
        }),
      );
      continue;
    }

    const num = line.match(/^\d+\.\s+(.*)$/);
    if (num) {
      flushPara();
      out.push(p(num[1], { alignment: AlignmentType.JUSTIFIED }));
      continue;
    }

    para.push(line.trim());
  }

  flushPara();
  flushTable();
  flushCode();
  return out;
}

function cover(title, code, objective) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [new ImageRun({ data: logoBuffer, transformation: { width: 180, height: 74 } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "MALA GARDENS", bold: true, size: 30, color: "1F3A5F" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 420 },
      children: [new TextRun({ text: "AREA DE DESARROLLO", bold: true, size: 22, color: "52606D" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 700, after: 160 },
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 32, color: "243B53" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: "Sistema MGCalc", size: 24, color: "52606D" })],
    }),
    infoTable(code),
    new Paragraph({ text: "" }),
    p(`Objetivo del documento: ${objective}`, { alignment: AlignmentType.JUSTIFIED }),
    new Paragraph({ pageBreakBefore: true }),
  ];
}

async function generate(fileName, code, title, objective) {
  const mdPath = path.join(docsDir, fileName);
  const content = fs.readFileSync(mdPath, "utf8");

  const doc = new Document({
    creator: "Area de Desarrollo",
    title,
    description: `${title} - Mala Gardens`,
    sections: [
      {
        properties: {},
        children: [
          ...cover(title, code, objective),
          heading(title, 1),
          ...parseMarkdown(content),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(docsDir, fileName.replace(".md", "-final.docx"));
  fs.writeFileSync(outPath, buffer);
}

for (const doc of docs) {
  await generate(...doc);
  console.log(`Generated ${doc[0].replace(".md", "-final.docx")}`);
}
