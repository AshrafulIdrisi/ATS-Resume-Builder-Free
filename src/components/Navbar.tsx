import React, { useState } from 'react';
import { 
  FileCheck2, 
  Upload, 
  Target, 
  Cloud, 
  Download, 
  FileText, 
  FileType, 
  Printer, 
  Sparkles, 
  ChevronDown, 
  RefreshCw,
  Layout,
  Columns,
  Maximize2
} from 'lucide-react';
import { SAMPLE_RESUMES } from '../data/sampleResumes';
import { ResumeData } from '../types';

interface NavbarProps {
  onSelectSample: (key: 'softwareEngineer' | 'productManager' | 'blank') => void;
  onOpenTemplateGallery: () => void;
  onOpenUpload: () => void;
  onOpenJobMatcher: () => void;
  onOpenCloudModal: () => void;
  onExportPdf: () => void;
  onExportTxt: () => void;
  onExportJson: () => void;
  onPrint: () => void;
  isExportingPdf: boolean;
  cloudCount: number;
  viewMode: 'split' | 'editor' | 'preview';
  onViewModeChange: (mode: 'split' | 'editor' | 'preview') => void;
  score: number;
}

export function Navbar({
  onSelectSample,
  onOpenTemplateGallery,
  onOpenUpload,
  onOpenJobMatcher,
  onOpenCloudModal,
  onExportPdf,
  onExportTxt,
  onExportJson,
  onPrint,
  isExportingPdf,
  cloudCount,
  viewMode,
  onViewModeChange,
  score
}: NavbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                ATS Resume Builder
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                ATS 90+ Standard
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Real-time ATS scoring, XYZ formula enhancement & single-column formats
            </p>
          </div>
        </div>

        {/* View Mode Toggle for Responsive / Focus */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition ${
              viewMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition ${
              viewMode === 'editor' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition ${
              viewMode === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Templates Gallery Button */}
          <button
            type="button"
            onClick={onOpenTemplateGallery}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl shadow-2xs transition"
            title="Browse 8 ATS-Friendly Templates"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-600" />
            <span>Templates</span>
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              8
            </span>
          </button>

          {/* Sample Templates Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSamplesOpen(!samplesOpen)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition"
            >
              <span>Sample Profiles</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {samplesOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onSelectSample('softwareEngineer');
                    setSamplesOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-800 hover:bg-slate-50 transition font-medium"
                >
                  Software Engineer (94 Score)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSample('productManager');
                    setSamplesOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-800 hover:bg-slate-50 transition font-medium"
                >
                  Product Manager (96 Score)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSample('blank');
                    setSamplesOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 transition font-medium border-t border-slate-100"
                >
                  Start Blank Resume
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition"
            title="Import PDF, Word, or TXT Resume"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Import</span>
          </button>

          {/* Match JD Button */}
          <button
            type="button"
            onClick={onOpenJobMatcher}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition"
            title="Match with Job Posting"
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Job Matcher</span>
          </button>

          {/* Cloud Resumes */}
          <button
            type="button"
            onClick={onOpenCloudModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition relative"
            title="Cloud Resumes & Versions"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Versions</span>
            {cloudCount > 0 && (
              <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {cloudCount}
              </span>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting...' : 'Export'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onExportPdf();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 transition flex items-center gap-2.5 font-medium"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="block font-bold">Download ATS PDF</span>
                    <span className="text-[10px] text-slate-500">Vector high-res, ATS readable</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportTxt();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 transition flex items-center gap-2.5 font-medium border-t border-slate-100"
                >
                  <FileType className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="block font-bold">Plain Text (.txt)</span>
                    <span className="text-[10px] text-slate-500">Universal ASCII format</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportJson();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 transition flex items-center gap-2.5 font-medium border-t border-slate-100"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="block font-bold">JSON Resume (.json)</span>
                    <span className="text-[10px] text-slate-500">Raw schema backup</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onPrint();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 transition flex items-center gap-2.5 font-medium border-t border-slate-100"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="block font-bold">Print Document</span>
                    <span className="text-[10px] text-slate-500">Browser print dialog</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
