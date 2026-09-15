import React, { forwardRef, useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Globe, 
  Github, 
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ResumeData, AtsAuditResult } from '../types';
import { detectActionVerb } from '../utils/actionVerbs';

interface ResumePreviewProps {
  resume: ResumeData;
  audit?: AtsAuditResult;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showInspector?: boolean;
  inspectorMode?: boolean;
  onToggleInspector?: () => void;
  onOpenJobMatcher?: () => void;
  onOpenRecruiterAudit?: () => void;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({
  resume,
  audit,
  zoom: controlledZoom,
  onZoomChange,
  showInspector: controlledShowInspector,
  inspectorMode,
  onToggleInspector,
  onOpenJobMatcher,
  onOpenRecruiterAudit
}, ref) => {
  const [internalZoom, setInternalZoom] = useState(100);
  const zoom = controlledZoom !== undefined ? controlledZoom : internalZoom;
  const handleZoomChange = onZoomChange || setInternalZoom;

  const showInspector = controlledShowInspector !== undefined ? controlledShowInspector : (inspectorMode || false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const theme = resume.theme || {
    fontFamily: 'sans',
    accentColor: '#1e3a8a',
    spacing: 'normal',
    margin: 'normal',
    headerLayout: 'classic',
    dividerStyle: 'solid',
    fontSize: 'medium',
    sectionsOrder: ['summary', 'experience', 'skills', 'education', 'projects', 'certifications']
  };

  // Font family class mappings
  const fontClasses: Record<string, string> = {
    sans: 'font-["Inter",system-ui,-apple-system,sans-serif]',
    serif: 'font-["Source_Serif_4","EB_Garamond",Georgia,serif]',
    mono: 'font-["JetBrains_Mono",monospace]',
    jakarta: 'font-["Plus_Jakarta_Sans",sans-serif]',
    cinzel: 'font-["Cinzel",serif]',
    roboto: 'font-["Roboto",sans-serif]'
  };

  // Spacing configurations
  const spacingConfig: Record<string, { sectionGap: string; itemGap: string; lineSpacing: string }> = {
    compact: { sectionGap: 'mb-3', itemGap: 'mb-2', lineSpacing: 'leading-tight' },
    normal: { sectionGap: 'mb-4.5', itemGap: 'mb-3', lineSpacing: 'leading-normal' },
    spacious: { sectionGap: 'mb-6', itemGap: 'mb-4', lineSpacing: 'leading-relaxed' }
  };

  // Margins
  const marginClasses: Record<string, string> = {
    narrow: 'p-6 sm:p-8',
    normal: 'p-8 sm:p-10 md:p-12',
    spacious: 'p-10 sm:p-12 md:p-14'
  };

  // Base font size
  const fontSizes: Record<string, { base: string; heading: string; title: string; sub: string }> = {
    small: { base: 'text-[9pt]', heading: 'text-[11pt]', title: 'text-[16pt]', sub: 'text-[9.5pt]' },
    medium: { base: 'text-[9.75pt]', heading: 'text-[12pt]', title: 'text-[18pt]', sub: 'text-[10pt]' },
    large: { base: 'text-[10.5pt]', heading: 'text-[13pt]', title: 'text-[20pt]', sub: 'text-[11pt]' }
  };

  const currentFont = fontClasses[theme.fontFamily] || fontClasses.sans;
  const currentSpacing = spacingConfig[theme.spacing] || spacingConfig.normal;
  const currentMargin = marginClasses[theme.margin] || marginClasses.normal;
  const currentFontSize = fontSizes[theme.fontSize] || fontSizes.medium;

  // Helper to highlight action verbs and metrics in inspector mode
  const renderInspectableBullet = (text: string) => {
    if (!showInspector || !text) return text;

    const firstWordMatch = text.match(/^([A-Za-z]+)(.*)$/);
    if (!firstWordMatch) return text;

    const firstWord = firstWordMatch[1];
    const rest = firstWordMatch[2];
    const isStrong = detectActionVerb(firstWord).isStrong;

    // Highlight metrics ($10M, 40%, 15+ etc.)
    const metricRegex = /(\b\d+(\.\d+)?%|\$\s?\d+([,\.]\d+)?\s*(k|m|b|million|billion|thousand)?|\b\d+\s*(x|times)\b|\b\d+\+\b)/gi;
    const parts = rest.split(metricRegex);

    return (
      <span>
        <span className={isStrong ? 'bg-indigo-100 text-indigo-900 font-semibold px-1 rounded' : 'bg-amber-100 text-amber-900 px-1 rounded'}>
          {firstWord}
        </span>
        {rest.split(/(\b\d+(?:\.\d+)?%|\$\s?\d+(?:[,\.]\d+)?\s*(?:k|m|b|million)?|\b\d+\s*x\b|\b\d+\+)/gi).map((part, i) => {
          if (metricRegex.test(part)) {
            return (
              <span key={i} className="bg-emerald-100 text-emerald-900 font-semibold px-1 rounded mx-0.5">
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  const sectionsOrder = theme.sectionsOrder || ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'];

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm p-6 overflow-y-auto' : ''}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border-b border-slate-200 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            Live ATS A4 Preview
          </span>
          {showInspector && (
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
              Inspector Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Inspector Toggle */}
          {onToggleInspector && (
            <button
              type="button"
              onClick={onToggleInspector}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                showInspector
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Highlight Action Verbs & Metrics"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showInspector ? 'Hide Audit' : 'ATS Audit View'}</span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => handleZoomChange(Math.max(50, zoom - 15))}
              disabled={zoom <= 50}
              className="p-1 hover:bg-white text-slate-600 hover:text-slate-900 rounded disabled:opacity-40 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-medium px-2 text-slate-700 select-none min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => handleZoomChange(Math.min(150, zoom + 15))}
              disabled={zoom >= 150}
              className="p-1 hover:bg-white text-slate-600 hover:text-slate-900 rounded disabled:opacity-40 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Inspector Legend */}
      {showInspector && (
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-1.5 flex items-center gap-4 text-xs text-indigo-950">
          <span className="font-semibold text-indigo-900">Live Highlighter:</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-indigo-200 border border-indigo-400"></span>
            Strong Action Verbs
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-400"></span>
            Quantifiable Metrics & Numbers
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-amber-200 border border-amber-400"></span>
            Weak Verbs to Improve
          </span>
        </div>
      )}

      {/* Scrollable Stage */}
      <div className="flex-1 overflow-auto bg-slate-200/70 p-4 sm:p-6 lg:p-8 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">
        <div 
          style={{ 
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="print:transform-none"
        >
          {/* A4 Sheet Container */}
          <div
            ref={ref}
            id="resume-printable-document"
            data-testid="ats-resume-preview-sheet"
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-xl border border-slate-300 print:border-none print:shadow-none print:w-full print:min-h-0 ${currentFont} ${currentMargin} ${currentFontSize.base} ${currentSpacing.lineSpacing}`}
          >
            {/* Header Section */}
            <header className={`${currentSpacing.sectionGap} ${theme.headerLayout === 'classic' ? 'text-center' : theme.headerLayout === 'minimal' ? 'text-left border-b border-slate-200 pb-3' : 'text-left'}`}>
              <h1 
                className={`font-bold tracking-tight text-slate-900 ${currentFontSize.title}`}
                style={{ color: theme.accentColor }}
              >
                {resume.contact.fullName || 'YOUR FULL NAME'}
              </h1>
              
              {resume.contact.jobTitle && (
                <div className={`font-semibold tracking-wide text-slate-700 mt-0.5 ${currentFontSize.sub}`}>
                  {resume.contact.jobTitle}
                </div>
              )}

              {/* Contact Details Bar */}
              <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 mt-2 text-[9pt] ${theme.headerLayout === 'classic' ? 'justify-center' : 'justify-start'}`}>
                {resume.contact.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{resume.contact.email}</span>
                  </span>
                )}
                {resume.contact.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{resume.contact.phone}</span>
                  </span>
                )}
                {resume.contact.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{resume.contact.location}</span>
                  </span>
                )}
                {resume.contact.linkedin && (
                  <span className="inline-flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-slate-400" />
                    <span>{resume.contact.linkedin}</span>
                  </span>
                )}
                {resume.contact.portfolio && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{resume.contact.portfolio}</span>
                  </span>
                )}
                {resume.contact.github && (
                  <span className="inline-flex items-center gap-1">
                    <Github className="w-3 h-3 text-slate-400" />
                    <span>{resume.contact.github}</span>
                  </span>
                )}
              </div>
            </header>

            {/* Dynamic Sections in User-configured Order */}
            {sectionsOrder.map((sectionId) => {
              const secConfig = resume.sections?.find((s) => s.id === sectionId);
              if (secConfig && !secConfig.visible) return null;

              // Render Section Divider / Header
              const renderSectionHeading = (title: string) => (
                <div className="mb-2">
                  <h2
                    className={`font-bold tracking-wider uppercase ${currentFontSize.heading}`}
                    style={{ color: theme.accentColor }}
                  >
                    {title}
                  </h2>
                  {theme.dividerStyle === 'solid' && (
                    <div 
                      className="h-[1.5px] w-full mt-0.5" 
                      style={{ backgroundColor: theme.accentColor }} 
                    />
                  )}
                  {theme.dividerStyle === 'dashed' && (
                    <div 
                      className="border-b-[1.5px] border-dashed w-full mt-0.5" 
                      style={{ borderColor: theme.accentColor }} 
                    />
                  )}
                </div>
              );

              // 1. Professional Summary
              if (sectionId === 'summary' && resume.summary && resume.summary.trim()) {
                return (
                  <section key="summary" className={currentSpacing.sectionGap}>
                    {renderSectionHeading(secConfig?.title || 'Professional Summary')}
                    <p className="text-slate-800 text-justify">
                      {renderInspectableBullet(resume.summary)}
                    </p>
                  </section>
                );
              }

              // 2. Work Experience
              if (sectionId === 'experience' && resume.experiences && resume.experiences.length > 0) {
                return (
                  <section key="experience" className={currentSpacing.sectionGap}>
                    {renderSectionHeading(secConfig?.title || 'Work Experience')}
                    <div className="space-y-3">
                      {resume.experiences.map((exp) => (
                        <div key={exp.id} className={currentSpacing.itemGap}>
                          <div className="flex flex-wrap justify-between items-baseline font-semibold text-slate-900">
                            <span className="font-bold text-slate-950">
                              {exp.position}
                              {exp.company ? ` • ${exp.company}` : ''}
                            </span>
                            <span className="text-slate-600 text-[9pt] font-medium">
                              {exp.startDate ? `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate || ''}` : ''}
                              {exp.location ? ` | ${exp.location}` : ''}
                            </span>
                          </div>

                          {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                            <ul className="list-disc ml-5 mt-1 space-y-1 text-slate-800 marker:text-slate-400">
                              {exp.bulletPoints.map((bullet, bIdx) => {
                                if (!bullet.trim()) return null;
                                return (
                                  <li key={bIdx} className="leading-snug">
                                    {renderInspectableBullet(bullet)}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // 3. Skills
              if (sectionId === 'skills' && resume.skillCategories && resume.skillCategories.length > 0) {
                return (
                  <section key="skills" className={currentSpacing.sectionGap}>
                    {renderSectionHeading(secConfig?.title || 'Skills & Competencies')}
                    <div className="space-y-1 text-slate-800">
                      {resume.skillCategories.map((category) => {
                        if (!category.skills || category.skills.length === 0) return null;
                        return (
                          <div key={category.id} className="leading-snug">
                            <span className="font-bold text-slate-900">{category.name}: </span>
                            <span className="text-slate-800">{category.skills.join(', ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              // 4. Education
              if (sectionId === 'education' && resume.education && resume.education.length > 0) {
                return (
                  <section key="education" className={currentSpacing.sectionGap}>
                    {renderSectionHeading(secConfig?.title || 'Education')}
                    <div className="space-y-2">
                      {resume.education.map((edu) => (
                        <div key={edu.id} className={currentSpacing.itemGap}>
                          <div className="flex flex-wrap justify-between items-baseline font-semibold text-slate-900">
                            <span>
                              <span className="font-bold">{edu.degree}</span>
                              {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                              {edu.institution ? ` • ${edu.institution}` : ''}
                            </span>
                            <span className="text-slate-600 text-[9pt] font-medium">
                              {edu.startDate ? `${edu.startDate} – ${edu.current ? 'Present' : edu.endDate || ''}` : ''}
                              {edu.location ? ` | ${edu.location}` : ''}
                            </span>
                          </div>

                          {(edu.gpa || edu.honors || edu.coursework) && (
                            <div className="text-[9pt] text-slate-700 mt-0.5 space-y-0.5">
                              {edu.gpa && <div><span className="font-semibold">GPA:</span> {edu.gpa}</div>}
                              {edu.honors && <div><span className="font-semibold">Honors:</span> {edu.honors}</div>}
                              {edu.coursework && <div><span className="font-semibold">Relevant Coursework:</span> {edu.coursework}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // 5. Projects
              if (sectionId === 'projects' && resume.projects && resume.projects.length > 0) {
                return (
                  <section key="projects" className={currentSpacing.sectionGap}>
                    {renderSectionHeading(secConfig?.title || 'Key Projects')}
                    <div className="space-y-2.5">
                      {resume.projects.map((proj) => (
                        <div key={proj.id} className={currentSpacing.itemGap}>
                          <div className="flex flex-wrap justify-between items-baseline">
                            <span className="font-bold text-slate-900">
                              {proj.name}
                              {proj.technologies ? (
                                <span className="font-normal text-slate-600 text-[9pt]"> | {proj.technologies}</span>
                              ) : null}
                            </span>
                            {proj.link && (
                              <span className="text-[9pt] text-slate-600 font-medium">
                                {proj.link}
                              </span>
                            )}
                          </div>

                          {proj.description && (
                            <p className="text-slate-700 mt-0.5 leading-snug">{proj.description}</p>
                          )}

                          {proj.bulletPoints && proj.bulletPoints.length > 0 && (
                            <ul className="list-disc ml-5 mt-1 space-y-0.5 text-slate-800 marker:text-slate-400">
                              {proj.bulletPoints.map((bullet, pIdx) => {
                                if (!bullet.trim()) return null;
                                return (
                                  <li key={pIdx} className="leading-snug">
                                    {renderInspectableBullet(bullet)}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // 6. Certifications
              if (sectionId === 'certifications' && resume.certifications && resume.certifications.length > 0) {
                return (
                  <section key="certifications" className={currentSpacing.sectionGap}>
                    {renderSectionHeading(secConfig?.title || 'Certifications & Credentials')}
                    <ul className="list-disc ml-5 space-y-1 text-slate-800 marker:text-slate-400">
                      {resume.certifications.map((cert) => (
                        <li key={cert.id} className="leading-snug">
                          <span className="font-bold text-slate-900">{cert.name}</span>
                          {cert.issuer ? ` – ${cert.issuer}` : ''}
                          {cert.issueDate ? ` (${cert.issueDate})` : ''}
                          {cert.credentialUrl ? (
                            <span className="text-slate-500 text-[8.5pt]"> [ID: {cert.credentialUrl}]</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
