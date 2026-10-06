import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportCsv(
  filename: string,
  columns: string[],
  rows: (string | number | null | undefined)[][],
) {
  const escape = (v: any) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = [columns.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join(
    "\n",
  );
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPdf(
  title: string,
  columns: string[],
  rows: (string | number | null | undefined)[][],
  filename: string,
) {
  const doc = new jsPDF({ orientation: columns.length > 4 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleString(), 14, 22);
  autoTable(doc, {
    head: [columns],
    body: rows.map((r) => r.map((v) => (v == null ? "" : String(v)))),
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 122, 87] },
  });
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
