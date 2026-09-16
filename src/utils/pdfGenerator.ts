import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export async function exportResumeToPdf(
  elementId: string = 'resume-printable-document',
  filename: string = 'Resume.pdf'
): Promise<void> {
  // Robust element resolution
  let element: HTMLElement | null = document.getElementById(elementId);
  if (!element) {
    element = document.getElementById('resume-printable-document') ||
              document.getElementById('ats-resume-preview-sheet') ||
              document.querySelector<HTMLElement>('[data-testid="ats-resume-preview-sheet"]') ||
              document.querySelector<HTMLElement>('.w-\\[210mm\\]');
  }

  if (!element) {
    throw new Error(`Resume preview element with id "${elementId}" not found.`);
  }

  // Create high-resolution image using html-to-image which natively supports CSS oklch/modern colors
  // Set skipFonts: true to prevent CORS security errors when inspecting external Google Fonts stylesheets
  const imgData = await toPng(element, {
    pixelRatio: 2.5, // Crisp rendering for ATS typography & layout
    backgroundColor: '#ffffff',
    cacheBust: true,
    skipFonts: true,
  });

  // Calculate dimensions from generated image
  const img = new Image();
  img.src = imgData;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  
  const imgWidth = pdfWidth;
  const imgHeight = (img.height * pdfWidth) / img.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Add extra pages if content overflows A4 height
  while (heightLeft > 5) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export function triggerNativePrint(): void {
  window.print();
}


