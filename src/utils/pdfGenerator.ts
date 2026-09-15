import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  // Create high-resolution canvas from the preview container
  const canvas = await html2canvas(element, {
    scale: 2.5, // Crisp rendering for ATS text & fonts
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

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

