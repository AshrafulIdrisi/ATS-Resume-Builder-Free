import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ResumeData, 
  CloudResumeItem, 
  AtsAuditResult,
  SkillCategory,
  ResumeTemplate
} from './types';
import { SAMPLE_RESUMES, DEFAULT_THEME_CONFIG } from './data/sampleResumes';
import { analyzeResumeAts } from './utils/atsAnalyzer';
import { 
  loadActiveResume, 
  saveActiveResume, 
  loadCloudResumes, 
  saveCloudResumes,
  saveCloudResumeItem,
  deleteCloudResumeItem,
  duplicateCloudResumeItem
} from './utils/cloudStorage';
import { exportResumeToPdf } from './utils/pdfGenerator';
import { downloadTxtResume } from './utils/txtGenerator';

import { Navbar } from './components/Navbar';
import { AtsScoreMeter } from './components/AtsScoreMeter';
import { ResumeEditor } from './components/ResumeEditor';
import { ResumePreview } from './components/ResumePreview';
import { UploadModal } from './components/UploadModal';
import { JobMatcherModal } from './components/JobMatcherModal';
import { CloudResumesModal } from './components/CloudResumesModal';
import { AiEnhancerModal, AiModalMode } from './components/AiEnhancerModal';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';

export default function App() {
  // 1. Core Resume State
  const [resume, setResume] = useState<ResumeData>(() => {
    const saved = loadActiveResume();
    return saved || SAMPLE_RESUMES.softwareEngineer;
  });

  const [activeResumeId, setActiveResumeId] = useState<string | undefined>('default-software-eng');
  const [cloudResumes, setCloudResumes] = useState<CloudResumeItem[]>(() => loadCloudResumes());
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [inspectorMode, setInspectorMode] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. Modals State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);

  const [aiModalState, setAiModalState] = useState<{
    isOpen: boolean;
    mode: AiModalMode;
    initialBullet?: string;
    bulletContext?: string;
    targetRole?: string;
    onApplyBullet?: (res: string) => void;
    onApplySummary?: (res: string) => void;
  }>({
    isOpen: false,
    mode: 'bullet'
  });

  // 3. Real-time ATS Audit calculation
  const atsAudit: AtsAuditResult = useMemo(() => {
    return analyzeResumeAts(resume);
  }, [resume]);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 4. Persistence Effect
  useEffect(() => {
    saveActiveResume(resume);
  }, [resume]);

  // Handle sample selection
  const handleSelectSample = (key: 'softwareEngineer' | 'productManager' | 'blank') => {
    const selected = SAMPLE_RESUMES[key];
    setResume(selected);
    showToast(`Loaded ${key === 'softwareEngineer' ? 'Software Engineer' : key === 'productManager' ? 'Product Manager' : 'Blank'} template`);
  };

  // Handle imported resume from upload
  const handleImportResume = (importedData: ResumeData, filename: string) => {
    setResume(importedData);
    const newId = `imported-${Date.now()}`;
    setActiveResumeId(newId);
    saveCloudResumeItem(
      filename.replace(/\.[^/.]+$/, ''),
      importedData.contact.jobTitle || 'Imported Candidate',
      importedData,
      analyzeResumeAts(importedData).overallScore
    );
    setCloudResumes(loadCloudResumes());
    showToast(`Successfully parsed and imported "${filename}"`);
  };

  // Export handlers
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    showToast('Generating high-resolution ATS-compliant PDF...');
    try {
      const filename = `${(resume.contact.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      await exportResumeToPdf('resume-printable-document', filename);
      showToast('PDF downloaded successfully!');
    } catch (err: any) {
      console.error(err);
      showToast('PDF export failed. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportTxt = () => {
    const filename = `${(resume.contact.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.txt`;
    downloadTxtResume(resume, filename);
    showToast('Plain text ASCII resume downloaded!');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(resume.contact.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON resume schema exported!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Cloud handlers
  const handleSaveCurrentVersion = (title: string) => {
    const saved = saveCloudResumeItem(
      title,
      resume.contact.jobTitle || 'Candidate',
      resume,
      atsAudit.overallScore
    );
    setActiveResumeId(saved.id);
    setCloudResumes(loadCloudResumes());
    showToast(`Saved version "${title}"`);
  };

  const handleSelectCloudResume = (item: CloudResumeItem) => {
    setResume(item.data);
    setActiveResumeId(item.id);
    showToast(`Loaded version "${item.title}"`);
  };

  const handleDeleteCloudResume = (id: string) => {
    deleteCloudResumeItem(id);
    setCloudResumes(loadCloudResumes());
    showToast('Version deleted.');
  };

  const handleDuplicateCloudResume = (id: string) => {
    duplicateCloudResumeItem(id);
    setCloudResumes(loadCloudResumes());
    showToast('Version duplicated.');
  };

  // Skill Add helper (from Job Matcher)
  const handleAddSkillFromMatcher = (skillName: string) => {
    setResume(prev => {
      const categories = [...prev.skillCategories];
      if (categories.length === 0) {
        categories.push({
          id: `cat-${Date.now()}`,
          name: 'Core Skills',
          skills: [skillName]
        });
      } else {
        // Add to first category or match Technical
        const target = categories.find(c => c.name.toLowerCase().includes('technical') || c.name.toLowerCase().includes('skill')) || categories[0];
        if (!target.skills.includes(skillName)) {
          target.skills = [...target.skills, skillName];
        }
      }
      return { ...prev, skillCategories: categories };
    });
    showToast(`Added "${skillName}" to Skills section`);
  };

  // Open AI Enhancers
  const openBulletEnhancer = (
    bullet: string,
    context?: string,
    targetRole?: string,
    onApply?: (enhanced: string) => void
  ) => {
    setAiModalState({
      isOpen: true,
      mode: 'bullet',
      initialBullet: bullet,
      bulletContext: context,
      targetRole: targetRole || resume.contact.jobTitle,
      onApplyBullet: onApply
    });
  };

  const openSummaryGenerator = () => {
    setAiModalState({
      isOpen: true,
      mode: 'summary',
      targetRole: resume.contact.jobTitle,
      onApplySummary: (newSummary: string) => {
        setResume(prev => ({ ...prev, summary: newSummary }));
        showToast('Applied AI Summary to resume');
      }
    });
  };

  const openRecruiterAudit = () => {
    setAiModalState({
      isOpen: true,
      mode: 'audit',
      targetRole: resume.contact.jobTitle
    });
  };

  const handleApplyTemplateStyle = (template: ResumeTemplate) => {
    setResume(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        fontFamily: template.theme.fontFamily,
        accentColor: template.theme.accentColor,
        secondaryColor: template.theme.secondaryColor,
        spacing: template.theme.spacing,
        margin: template.theme.margin,
        headerLayout: template.theme.headerLayout,
        dividerStyle: template.theme.dividerStyle,
        fontSize: template.theme.fontSize,
        sectionsOrder: template.theme.sectionsOrder
      }
    }));
    showToast(`Applied "${template.name}" styling to your resume`);
  };

  const handleLoadFullTemplate = (template: ResumeTemplate) => {
    setResume(template.sampleData);
    showToast(`Loaded "${template.name}" template & profile`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onSelectSample={handleSelectSample}
        onOpenTemplateGallery={() => setIsTemplateGalleryOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onExportPdf={handleExportPdf}
        onExportTxt={handleExportTxt}
        onExportJson={handleExportJson}
        onPrint={handlePrint}
        isExportingPdf={isExportingPdf}
        cloudCount={cloudResumes.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        score={atsAudit.overallScore}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* ATS Score Header Meter */}
        <AtsScoreMeter
          audit={atsAudit}
          onOpenAuditModal={openRecruiterAudit}
          onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
        />

        {/* Workspace Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Panel: Form Editor */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div className={`space-y-4 ${
              viewMode === 'editor' ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-6'
            }`}>
              <ResumeEditor
                resume={resume}
                onChange={setResume}
                onEnhanceBullet={openBulletEnhancer}
                onGenerateSummary={openSummaryGenerator}
                onOpenTemplateGallery={() => setIsTemplateGalleryOpen(true)}
              />
            </div>
          )}

          {/* Right Panel: Live Document Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className={`space-y-4 ${
              viewMode === 'preview' ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-6'
            } sticky top-20`}>
              <ResumePreview
                resume={resume}
                audit={atsAudit}
                inspectorMode={inspectorMode}
                onToggleInspector={() => setInspectorMode(!inspectorMode)}
                onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
                onOpenRecruiterAudit={openRecruiterAudit}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <TemplateGalleryModal
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        currentResume={resume}
        onApplyTemplateStyle={handleApplyTemplateStyle}
        onLoadFullTemplate={handleLoadFullTemplate}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportResume={handleImportResume}
      />

      <JobMatcherModal
        isOpen={isJobMatcherOpen}
        onClose={() => setIsJobMatcherOpen(false)}
        resume={resume}
        onAddSkill={handleAddSkillFromMatcher}
      />

      <CloudResumesModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        resumes={cloudResumes}
        activeResumeId={activeResumeId}
        onSelectResume={handleSelectCloudResume}
        onSaveCurrentVersion={handleSaveCurrentVersion}
        onDeleteResume={handleDeleteCloudResume}
        onDuplicateResume={handleDuplicateCloudResume}
        currentResume={resume}
        currentScore={atsAudit.overallScore}
      />

      <AiEnhancerModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState(prev => ({ ...prev, isOpen: false }))}
        mode={aiModalState.mode}
        resume={resume}
        initialBullet={aiModalState.initialBullet}
        bulletContext={aiModalState.bulletContext}
        targetRole={aiModalState.targetRole}
        onApplyBullet={aiModalState.onApplyBullet}
        onApplySummary={aiModalState.onApplySummary}
      />
    </div>
  );
}

