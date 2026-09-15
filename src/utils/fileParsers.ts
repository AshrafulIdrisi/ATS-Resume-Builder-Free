import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from '../types';

// Configure pdfjs worker if in browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += `\n--- Page ${i} ---\n` + pageText;
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF document. Please verify the file is not password-protected.');
  }
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. Ensure it is a valid Word document.');
  }
}

export async function extractTextFromTxt(file: File): Promise<string> {
  return await file.text();
}

export async function parseResumeFile(file: File): Promise<{
  isJson: boolean;
  jsonData?: ResumeData;
  rawText?: string;
  filename: string;
}> {
  const filename = file.name;
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'json') {
    const text = await file.text();
    const parsed = JSON.parse(text);
    // Basic verification
    if (parsed.contact || parsed.experiences || parsed.summary) {
      return { isJson: true, jsonData: parsed as ResumeData, filename };
    }
    throw new Error('Invalid JSON resume schema format.');
  }

  if (ext === 'pdf') {
    const rawText = await extractTextFromPDF(file);
    return { isJson: false, rawText, filename };
  }

  if (ext === 'docx' || ext === 'doc') {
    const rawText = await extractTextFromDocx(file);
    return { isJson: false, rawText, filename };
  }

  if (ext === 'txt' || ext === 'md') {
    const rawText = await extractTextFromTxt(file);
    return { isJson: false, rawText, filename };
  }

  throw new Error(`Unsupported file format (.${ext}). Supported formats: PDF, DOCX, TXT, JSON.`);
}
