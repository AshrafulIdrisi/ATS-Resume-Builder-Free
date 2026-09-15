import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Layout, 
  Palette, 
  ShieldCheck, 
  ArrowRight, 
  FileText,
  Briefcase,
  Layers,
  ChevronRight,
  Eye,
  Sliders
} from 'lucide-react';
import { ResumeTemplate, TemplateCategory, ResumeData } from '../types';
import { RESUME_TEMPLATES_LIBRARY, TEMPLATE_CATEGORIES } from '../data/templates';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResume: ResumeData;
  onApplyTemplateStyle: (template: ResumeTemplate) => void;
  onLoadFullTemplate: (template: ResumeTemplate) => void;
}

export function TemplateGalleryModal({
  isOpen,
  onClose,
  currentResume,
  onApplyTemplateStyle,
  onLoadFullTemplate
}: TemplateGalleryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');
  const [activeTemplate, setActiveTemplate] = useState<ResumeTemplate>(RESUME_TEMPLATES_LIBRARY[0]);
  const [previewTab, setPreviewTab] = useState<'visual' | 'details'>('visual');

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'All'
    ? RESUME_TEMPLATES_LIBRARY
    : RESUME_TEMPLATES_LIBRARY.filter(t => t.category === selectedCategory);

  const isCurrentTheme = (template: ResumeTemplate) => {
    return (
      currentResume.theme.fontFamily === template.theme.fontFamily &&
      currentResume.theme.accentColor === template.theme.accentColor &&
      currentResume.theme.headerLayout === template.theme.headerLayout
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">ATS Resume Templates Library</h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  100% ATS Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Choose from 8 pre-designed, single-column templates tested against enterprise ATS parsers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Body: Left Gallery Grid + Right Active Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Template Cards Grid */}
          <div className="lg:col-span-7 p-4 sm:p-5 border-r border-slate-200 overflow-y-auto max-h-[62vh] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTemplates.map((template) => {
                const isSelected = activeTemplate.id === template.id;
                const isApplied = isCurrentTheme(template);

                return (
                  <div
                    key={template.id}
                    onClick={() => setActiveTemplate(template)}
                    className={`group relative rounded-xl border p-3.5 text-left cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {template.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <span 
                            className="w-3 h-3 rounded-full border border-white shadow-2xs" 
                            style={{ backgroundColor: template.theme.accentColor }} 
                            title={template.theme.accentColor}
                          />
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {template.atsScore}% ATS
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                        {template.name}
                        {isApplied && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {template.description}
                      </p>

                      {/* Mini Visual Preview Block */}
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[9px] space-y-1 select-none pointer-events-none">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-bold" style={{ color: template.theme.accentColor }}>
                            {template.sampleData.contact.fullName.toUpperCase()}
                          </span>
                          <span className="text-slate-400 font-mono text-[8px]">
                            {template.theme.fontFamily}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-sm w-3/4"></div>
                        <div className="h-1.5 bg-slate-200 rounded-sm w-full"></div>
                        <div className="h-1 bg-slate-100 rounded-sm w-5/6"></div>
                      </div>
                    </div>

                    {/* Features Tag List */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1 text-[10px] text-slate-600">
                      {template.features.slice(0, 2).map((feat, i) => (
                        <span key={i} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Active Template View & Actions */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/50 flex flex-col justify-between overflow-y-auto max-h-[62vh]">
            <div className="space-y-4">
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {activeTemplate.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {activeTemplate.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeTemplate.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activeTemplate.description}
                </p>
              </div>

              {/* Theme Specifications */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Template Theme Specs
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Font Typography</span>
                    <span className="font-semibold text-slate-800 capitalize">{activeTemplate.theme.fontFamily}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Accent Color</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeTemplate.theme.accentColor }}></span>
                      <span className="font-mono text-[10px]">{activeTemplate.theme.accentColor}</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Header Style</span>
                    <span className="font-semibold text-slate-800 capitalize">{activeTemplate.theme.headerLayout}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Spacing & Margins</span>
                    <span className="font-semibold text-slate-800 capitalize">{activeTemplate.theme.spacing} / {activeTemplate.theme.margin}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block text-[10px] mb-1">Target Roles & Specializations:</span>
                  <div className="flex flex-wrap gap-1">
                    {activeTemplate.targetRoles.map((role, rIdx) => (
                      <span key={rIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ATS Safety Guarantee */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Semantic HTML & Standard CSS Certified</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Strictly avoids floating tables, multi-column text-boxes, or canvas vectors that cause parser dropout in Taleo, Workday, and Greenhouse.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onApplyTemplateStyle(activeTemplate);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <Palette className="w-4 h-4" />
                <span>Apply Template Style to My Resume</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Load complete sample resume for "${activeTemplate.name}"? This will populate the editor with role-specific sample data.`)) {
                    onLoadFullTemplate(activeTemplate);
                    onClose();
                  }
                }}
                className="w-full py-2 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Load Template with Sample Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
