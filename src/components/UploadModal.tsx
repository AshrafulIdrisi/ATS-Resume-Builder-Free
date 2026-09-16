import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileCode, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { parseResumeFile } from '../utils/fileParsers';
import { ResumeData } from '../types';
import { DEFAULT_THEME_CONFIG, DEFAULT_SECTIONS_CONFIG } from '../data/sampleResumes';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportResume: (resume: ResumeData, filename: string) => void;
}

export function UploadModal({
  isOpen,
  onClose,
  onImportResume
}: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<{
    name?: string;
    title?: string;
    expCount?: number;
    skillsCount?: number;
    resumeData?: ResumeData;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
    setLoading(true);
    setExtractedPreview(null);
    setStatusMessage('Reading file contents...');

    try {
      const parsedResult = await parseResumeFile(uploadedFile);

      if (parsedResult.isJson && parsedResult.jsonData) {
        // Direct JSON format
        const fullData: ResumeData = {
          ...parsedResult.jsonData,
          theme: parsedResult.jsonData.theme || DEFAULT_THEME_CONFIG,
          sections: parsedResult.jsonData.sections || DEFAULT_SECTIONS_CONFIG
        };
        const skillsCount = fullData.skillCategories?.reduce((acc, c) => acc + c.skills.length, 0) || 0;
        setExtractedPreview({
          name: fullData.contact?.fullName || 'Imported Candidate',
          title: fullData.contact?.jobTitle || 'Imported Profile',
          expCount: fullData.experiences?.length || 0,
          skillsCount,
          resumeData: fullData
        });
        setLoading(false);
        setStatusMessage('JSON Resume parsed successfully.');
        return;
      }

      // If PDF/DOCX/TXT/Image: call Gemini AI backend to structure resume content
      setStatusMessage('Extracting document layout and structuring fields with Gemini AI...');

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: parsedResult.rawText,
          base64Data: parsedResult.base64Data,
          mimeType: parsedResult.mimeType,
          filename: parsedResult.filename || uploadedFile.name
        })
      });

      if (!response.ok) {
        throw new Error('Server AI parsing failed. Please check file format.');
      }

      const { resume: parsedResume } = await response.json();

      const completeData: ResumeData = {
        contact: parsedResume.contact || {
          fullName: 'Imported Candidate',
          jobTitle: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          portfolio: '',
          github: ''
        },
        summary: parsedResume.summary || '',
        experiences: parsedResume.experiences || [],
        education: parsedResume.education || [],
        skillCategories: parsedResume.skillCategories || [],
        projects: parsedResume.projects || [],
        certifications: parsedResume.certifications || [],
        theme: DEFAULT_THEME_CONFIG,
        sections: DEFAULT_SECTIONS_CONFIG
      };

      const skillsCount = completeData.skillCategories.reduce((acc, c) => acc + c.skills.length, 0);

      setExtractedPreview({
        name: completeData.contact.fullName,
        title: completeData.contact.jobTitle,
        expCount: completeData.experiences.length,
        skillsCount,
        resumeData: completeData
      });

      setStatusMessage('AI extraction complete!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse resume document.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (extractedPreview?.resumeData && file) {
      onImportResume(extractedPreview.resumeData, file.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload & Parse Existing Resume</h2>
              <p className="text-xs text-slate-500">Auto-populate all builder fields from PDF, DOCX, TXT, or JSON</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Dropzone */}
          {!extractedPreview && !loading && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 text-indigo-600">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Drag & drop your resume file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    or click to browse your computer
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md text-slate-700">PDF (.pdf)</span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md text-slate-700">Word (.docx)</span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md text-slate-700">Plain Text (.txt)</span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md text-slate-700">JSON Schema (.json)</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">{statusMessage || 'Processing file...'}</p>
                <p className="text-xs text-slate-500 mt-0.5">Extracting contact, experience, skills, and projects...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Extracted Preview Confirmation */}
          {extractedPreview && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resume Extracted Successfully!</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs space-y-1.5 text-slate-700">
                  <div><strong>Name:</strong> {extractedPreview.name}</div>
                  <div><strong>Title:</strong> {extractedPreview.title || 'General'}</div>
                  <div><strong>Work Experience:</strong> {extractedPreview.expCount} positions extracted</div>
                  <div><strong>Skills:</strong> {extractedPreview.skillsCount} skills identified</div>
                </div>

                <p className="text-xs text-emerald-700">
                  Importing will replace current editor fields with this extracted resume. You can save your previous version to Cloud DB anytime.
                </p>
              </div>

              <div className="flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setExtractedPreview(null);
                    setFile(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Upload Different File
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm & Load into Editor</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
