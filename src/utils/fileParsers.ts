import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from '../types';

// Configure pdfjs worker if in browser with unpkg/jsdelivr fallback
if (typeof window !== 'undefined') {
  try {
    // Set modern standard worker CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set pdfjs workerSrc:', e);
  }
}

export interface ParsedFileResult {
  isJson: boolean;
  jsonData?: ResumeData;
  rawText?: string;
  base64Data?: string;
  mimeType?: string;
  filename: string;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
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
    console.warn('Client-side PDF text extraction failed, will use server-side multimodal AI:', error);
    return '';
  }
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.warn('DOCX client extraction warning:', error);
    return '';
  }
}

export async function extractTextFromTxt(file: File): Promise<string> {
  return await file.text();
}

export async function parseResumeFile(file: File): Promise<ParsedFileResult> {
  const filename = file.name;
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. JSON Direct Import
  if (ext === 'json') {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.contact || parsed.experiences || parsed.summary || parsed.skillCategories) {
        return { isJson: true, jsonData: parsed as ResumeData, filename };
      }
    } catch (e: any) {
      console.warn('JSON parse warning:', e);
    }
  }

  // Convert to Base64 for multimodal fallback
  let base64Data = '';
  try {
    base64Data = await fileToBase64(file);
  } catch (e) {
    console.warn('Base64 conversion warning:', e);
  }

  // 2. PDF Files
  if (ext === 'pdf') {
    const rawText = await extractTextFromPDF(file);
    return {
      isJson: false,
      rawText: rawText.length > 30 ? rawText : undefined,
      base64Data,
      mimeType: 'application/pdf',
      filename
    };
  }

  // 3. Word Documents (.docx / .doc)
  if (ext === 'docx' || ext === 'doc') {
    const rawText = await extractTextFromDocx(file);
    return {
      isJson: false,
      rawText: rawText.length > 20 ? rawText : undefined,
      base64Data,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename
    };
  }

  // 4. Plain Text or Markdown
  if (ext === 'txt' || ext === 'md') {
    const rawText = await extractTextFromTxt(file);
    return {
      isJson: false,
      rawText,
      base64Data,
      mimeType: 'text/plain',
      filename
    };
  }

  // 5. Image Resumes (.png, .jpg, .jpeg, .webp)
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return {
      isJson: false,
      base64Data,
      mimeType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      filename
    };
  }

  // Generic fallback: Try reading text first
  try {
    const rawText = await file.text();
    if (rawText && rawText.length > 20) {
      return { isJson: false, rawText, filename };
    }
  } catch (e) {
    // ignore
  }

  return {
    isJson: false,
    base64Data,
    mimeType: file.type || 'application/octet-stream',
    filename
  };
}
