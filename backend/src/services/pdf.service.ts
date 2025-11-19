import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

export interface ReportData {
  userName: string;
  date: string;
  activities: Array<{
    task: string;
    project: string;
    hours: number;
    description: string;
  }>;
  totalHours: number;
}

export async function generatePDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).fillColor('#007aff').text('Parte de Trabajo Diario', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#86868b').text('Wigac - Gestión de Proyectos', { align: 'center' });
    doc.moveDown(2);

    // Info box
    doc.fontSize(12).fillColor('#000');
    doc.text(`Empleado: ${data.userName}`);
    doc.text(`Fecha: ${data.date}`);
    doc.text(`Total de horas: ${data.totalHours.toFixed(2)}h`);
    doc.moveDown(2);

    // Table header
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 180;
    const col3X = 330;
    const col4X = 400;

    doc.fontSize(11).fillColor('#fff');
    doc.rect(col1X, tableTop, 495, 25).fillAndStroke('#007aff', '#007aff');
    doc.text('Proyecto', col1X + 5, tableTop + 8);
    doc.text('Tarea', col2X + 5, tableTop + 8);
    doc.text('Horas', col3X + 5, tableTop + 8);
    doc.text('Descripción', col4X + 5, tableTop + 8);

    let yPosition = tableTop + 25;

    // Table rows
    data.activities.forEach((act, idx) => {
      const rowHeight = 30;
      if (idx % 2 === 0) {
        doc.rect(col1X, yPosition, 495, rowHeight).fillAndStroke('#fff', '#e8e8ed');
      } else {
        doc.rect(col1X, yPosition, 495, rowHeight).fillAndStroke('#f5f5f7', '#e8e8ed');
      }

      doc.fontSize(10).fillColor('#000');
      doc.text(act.project, col1X + 5, yPosition + 10, { width: 120, ellipsis: true });
      doc.text(act.task, col2X + 5, yPosition + 10, { width: 140, ellipsis: true });
      doc.text(`${act.hours.toFixed(2)}h`, col3X + 5, yPosition + 10, { align: 'center' });
      doc.text(act.description, col4X + 5, yPosition + 10, { width: 140, ellipsis: true });
      yPosition += rowHeight;
    });

    // Total box
    yPosition += 20;
    doc.rect(50, yPosition, 495, 40).fillAndStroke('#f5f5f7', '#e8e8ed');
    doc.fontSize(16).fillColor('#007aff');
    doc.text(`Total: ${data.totalHours.toFixed(2)} horas`, 60, yPosition + 12, { align: 'right', width: 475 });

    // Footer
    yPosition += 80;
    doc.fontSize(9).fillColor('#86868b');
    doc.text(`Generado automáticamente por Wigac el ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 50, yPosition, {
      align: 'center',
      width: 495
    });

    doc.end();
  });
}
