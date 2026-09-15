import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderGit2, 
  Award, 
  Palette, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown, 
  Check, 
  AlertCircle,
  X,
  FileText,
  Layout,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { 
  ResumeData, 
  WorkExperience, 
  Education, 
  SkillCategory, 
  Project, 
  Certification, 
  ResumeSectionId,
  ResumeTemplate
} from '../types';
import { detectActionVerb, detectWeakPhrases } from '../utils/actionVerbs';
import { SkillsKeywordSuggester } from './SkillsKeywordSuggester';
import { ExperienceKeywordSuggester } from './ExperienceKeywordSuggester';
import { RESUME_TEMPLATES_LIBRARY } from '../data/templates';

interface ResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onEnhanceBullet: (bullet: string, context?: string, targetRole?: string, onApply?: (enhanced: string) => void) => void;
  onGenerateSummary: () => void;
  activeSectionId?: string;
  onOpenTemplateGallery?: () => void;
}

export function ResumeEditor({
  resume,
  onChange,
  onEnhanceBullet,
  onGenerateSummary,
  activeSectionId,
  onOpenTemplateGallery
}: ResumeEditorProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    contact: true,
    summary: true,
    experience: true,
    skills: false,
    education: false,
    projects: false,
    certifications: false,
    theme: false
  });

  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper updates
  const updateContact = (field: keyof ResumeData['contact'], value: string) => {
    onChange({
      ...resume,
      contact: {
        ...resume.contact,
        [field]: value
      }
    });
  };

  const updateSummary = (value: string) => {
    onChange({
      ...resume,
      summary: value
    });
  };

  // Experience Handlers
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: true,
      bulletPoints: ['']
    };
    onChange({
      ...resume,
      experiences: [newExp, ...resume.experiences]
    });
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const deleteExperience = (id: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.filter(e => e.id !== id)
    });
  };

  const addBullet = (expId: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map(e => {
        if (e.id === expId) {
          return { ...e, bulletPoints: [...e.bulletPoints, ''] };
        }
        return e;
      })
    });
  };

  const updateBullet = (expId: string, bIdx: number, val: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map(e => {
        if (e.id === expId) {
          const newBullets = [...e.bulletPoints];
          newBullets[bIdx] = val;
          return { ...e, bulletPoints: newBullets };
        }
        return e;
      })
    });
  };

  const deleteBullet = (expId: string, bIdx: number) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map(e => {
        if (e.id === expId) {
          return { ...e, bulletPoints: e.bulletPoints.filter((_, i) => i !== bIdx) };
        }
        return e;
      })
    });
  };

  // Education Handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      coursework: ''
    };
    onChange({
      ...resume,
      education: [...resume.education, newEdu]
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange({
      ...resume,
      education: resume.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  const deleteEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter(edu => edu.id !== id)
    });
  };

  // Skills Handlers
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      name: 'Specialized Skills',
      skills: []
    };
    onChange({
      ...resume,
      skillCategories: [...resume.skillCategories, newCat]
    });
  };

  const updateSkillCategoryName = (id: string, name: string) => {
    onChange({
      ...resume,
      skillCategories: resume.skillCategories.map(c => c.id === id ? { ...c, name } : c)
    });
  };

  const addSkillTag = (categoryId: string, skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    onChange({
      ...resume,
      skillCategories: resume.skillCategories.map(c => {
        if (c.id === categoryId && !c.skills.includes(clean)) {
          return { ...c, skills: [...c.skills, clean] };
        }
        return c;
      })
    });
    setNewSkillInputs(prev => ({ ...prev, [categoryId]: '' }));
  };

  const removeSkillTag = (categoryId: string, skillToRemove: string) => {
    onChange({
      ...resume,
      skillCategories: resume.skillCategories.map(c => {
        if (c.id === categoryId) {
          return { ...c, skills: c.skills.filter(s => s !== skillToRemove) };
        }
        return c;
      })
    });
  };

  const deleteSkillCategory = (id: string) => {
    onChange({
      ...resume,
      skillCategories: resume.skillCategories.filter(c => c.id !== id)
    });
  };

  // Projects Handlers
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      technologies: '',
      link: '',
      description: '',
      bulletPoints: ['']
    };
    onChange({
      ...resume,
      projects: [...resume.projects, newProj]
    });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    onChange({
      ...resume,
      projects: resume.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const deleteProject = (id: string) => {
    onChange({
      ...resume,
      projects: resume.projects.filter(p => p.id !== id)
    });
  };

  const addProjectBullet = (projId: string) => {
    onChange({
      ...resume,
      projects: resume.projects.map(p => {
        if (p.id === projId) {
          return { ...p, bulletPoints: [...p.bulletPoints, ''] };
        }
        return p;
      })
    });
  };

  const updateProjectBullet = (projId: string, bIdx: number, val: string) => {
    onChange({
      ...resume,
      projects: resume.projects.map(p => {
        if (p.id === projId) {
          const newB = [...p.bulletPoints];
          newB[bIdx] = val;
          return { ...p, bulletPoints: newB };
        }
        return p;
      })
    });
  };

  const deleteProjectBullet = (projId: string, bIdx: number) => {
    onChange({
      ...resume,
      projects: resume.projects.map(p => {
        if (p.id === projId) {
          return { ...p, bulletPoints: p.bulletPoints.filter((_, i) => i !== bIdx) };
        }
        return p;
      })
    });
  };

  // Certifications Handlers
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: '',
      credentialUrl: ''
    };
    onChange({
      ...resume,
      certifications: [...resume.certifications, newCert]
    });
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    onChange({
      ...resume,
      certifications: resume.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const deleteCertification = (id: string) => {
    onChange({
      ...resume,
      certifications: resume.certifications.filter(c => c.id !== id)
    });
  };

  // Theme & Sections Order Handlers
  const updateTheme = (field: keyof ResumeData['theme'], value: any) => {
    onChange({
      ...resume,
      theme: {
        ...resume.theme,
        [field]: value
      }
    });
  };

  const toggleSectionVisibility = (secId: ResumeSectionId) => {
    const updated = (resume.sections || []).map(s => {
      if (s.id === secId) return { ...s, visible: !s.visible };
      return s;
    });
    onChange({ ...resume, sections: updated });
  };

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const order = [...(resume.theme.sectionsOrder || ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;

    const temp = order[idx];
    order[idx] = order[targetIdx];
    order[targetIdx] = temp;

    onChange({
      ...resume,
      theme: {
        ...resume.theme,
        sectionsOrder: order
      }
    });
  };

  // Preset color options
  const colorPresets = [
    { name: 'Navy Blue', hex: '#1e3a8a' },
    { name: 'Charcoal', hex: '#1f2937' },
    { name: 'Deep Teal', hex: '#0f766e' },
    { name: 'Emerald', hex: '#065f46' },
    { name: 'Indigo', hex: '#4338ca' },
    { name: 'Burgundy', hex: '#881337' },
    { name: 'Midnight', hex: '#090d16' },
    { name: 'Royal Blue', hex: '#2563eb' }
  ];

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full">
      {/* 1. Personal & Contact Info Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('contact')}
          className="w-full px-4 py-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">Personal & Contact Details</span>
              <span className="text-xs text-slate-500 block">Name, title, email, phone, links</span>
            </div>
          </div>
          {openSections.contact ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.contact && (
          <div className="p-4 pt-1 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={resume.contact.fullName}
                onChange={e => updateContact('fullName', e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title *</label>
              <input
                type="text"
                value={resume.contact.jobTitle}
                onChange={e => updateContact('jobTitle', e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={resume.contact.email}
                onChange={e => updateContact('email', e.target.value)}
                placeholder="alex.morgan@email.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={resume.contact.phone}
                onChange={e => updateContact('phone', e.target.value)}
                placeholder="(555) 234-5678"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location (City, State / Country)</label>
              <input
                type="text"
                value={resume.contact.location}
                onChange={e => updateContact('location', e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={resume.contact.linkedin}
                onChange={e => updateContact('linkedin', e.target.value)}
                placeholder="linkedin.com/in/alexmorgan"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio / Personal Site</label>
              <input
                type="text"
                value={resume.contact.portfolio}
                onChange={e => updateContact('portfolio', e.target.value)}
                placeholder="alexmorgan.dev"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile</label>
              <input
                type="text"
                value={resume.contact.github}
                onChange={e => updateContact('github', e.target.value)}
                placeholder="github.com/alexmorgan"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Professional Summary Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('summary')}
          className="w-full px-4 py-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">Professional Summary</span>
              <span className="text-xs text-slate-500 block">3-4 lines highlighting core value proposition</span>
            </div>
          </div>
          {openSections.summary ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.summary && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {resume.summary.length} characters • {resume.summary.trim() ? resume.summary.trim().split(/\s+/).length : 0} words
              </span>
              <button
                type="button"
                onClick={onGenerateSummary}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Summary Generator</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={resume.summary}
              onChange={e => updateSummary(e.target.value)}
              placeholder="Results-driven Software Engineer with 6+ years of experience architecting high-throughput distributed systems..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition leading-relaxed"
            />
            <p className="text-[11px] text-slate-500">
              💡 Tip: An ideal ATS summary is 40-75 words and mentions your target job title, years of experience, and key technical domains.
            </p>
          </div>
        )}
      </div>

      {/* 3. Work Experience Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="w-full px-4 py-3.5 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => toggleSection('experience')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">Work Experience ({resume.experiences.length})</span>
              <span className="text-xs text-slate-500 block">Roles, achievements, and impact bullets</span>
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addExperience}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection('experience')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              {openSections.experience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.experience && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-4">
            {resume.experiences.map((exp, expIdx) => (
              <div key={exp.id} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">Role #{expIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteExperience(exp.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="e.g. Stripe Inc."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Position / Job Title *</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={e => updateExperience(exp.id, 'position', e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={e => updateExperience(exp.id, 'location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                        placeholder="2023-01 or Jan 2023"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
                      <input
                        type="text"
                        disabled={exp.current}
                        value={exp.current ? 'Present' : exp.endDate}
                        onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                        placeholder="2024-05"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`curr-${exp.id}`}
                    checked={exp.current}
                    onChange={e => updateExperience(exp.id, 'current', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <label htmlFor={`curr-${exp.id}`} className="text-xs text-slate-700 font-medium cursor-pointer">
                    I currently work here
                  </label>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">Achievement Bullet Points (XYZ Format)</span>
                    <button
                      type="button"
                      onClick={() => addBullet(exp.id)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet
                    </button>
                  </div>

                  {exp.bulletPoints.map((bullet, bIdx) => {
                    const check = detectActionVerb(bullet);
                    const weakChecks = detectWeakPhrases(bullet);

                    return (
                      <div key={bIdx} className="space-y-1">
                        <div className="flex items-start gap-1.5">
                          <span className="text-slate-400 text-xs mt-2">•</span>
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={e => updateBullet(exp.id, bIdx, e.target.value)}
                            placeholder="Architected [X], as measured by [Y], by doing [Z]..."
                            className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => onEnhanceBullet(bullet, `${exp.position} at ${exp.company}`, resume.contact.jobTitle, (res) => updateBullet(exp.id, bIdx, res))}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition"
                              title="Enhance with AI (XYZ Formula)"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBullet(exp.id, bIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Real-time Bullet Feedback */}
                        {bullet.trim() && (
                          <div className="flex flex-wrap items-center gap-2 pl-4 text-[10px]">
                            {check.isStrong ? (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Action Verb: "{check.verb}"
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> Needs strong action verb
                              </span>
                            )}

                            {weakChecks.length > 0 && (
                              <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                                Passive phrase detected: "{weakChecks[0].found}"
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* AI Keywords, Action Verbs & XYZ Metric Assistant for this Role */}
                  <div className="pt-2">
                    <ExperienceKeywordSuggester
                      targetRole={resume.contact.jobTitle}
                      position={exp.position}
                      company={exp.company}
                      currentBullet={exp.bulletPoints[exp.bulletPoints.length - 1] || ''}
                      onInsertText={(text) => {
                        const lastIdx = exp.bulletPoints.length - 1;
                        if (lastIdx >= 0) {
                          const curr = exp.bulletPoints[lastIdx];
                          updateBullet(exp.id, lastIdx, curr ? `${curr} ${text}`.trim() : text);
                        } else {
                          addBullet(exp.id);
                        }
                      }}
                      onReplaceBullet={(text) => {
                        const lastIdx = exp.bulletPoints.length - 1;
                        if (lastIdx >= 0 && !exp.bulletPoints[lastIdx].trim()) {
                          updateBullet(exp.id, lastIdx, text);
                        } else {
                          // Add new bullet with template
                          onChange({
                            ...resume,
                            experiences: resume.experiences.map(e => e.id === exp.id ? {
                              ...e,
                              bulletPoints: [...e.bulletPoints, text]
                            } : e)
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Skills Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="w-full px-4 py-3.5 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => toggleSection('skills')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">Skills & Competencies ({resume.skillCategories.reduce((a, c) => a + c.skills.length, 0)})</span>
              <span className="text-xs text-slate-500 block">Categorized technical & professional keywords</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addSkillCategory}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection('skills')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              {openSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.skills && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3.5">
            {resume.skillCategories.map((cat) => (
              <div key={cat.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={e => updateSkillCategoryName(cat.id, e.target.value)}
                    placeholder="Category Name (e.g. Programming Languages)"
                    className="font-bold text-xs text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 pb-0.5 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => deleteSkillCategory(cat.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-800 border border-slate-200 shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkillTag(cat.id, skill)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Tag Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillInputs[cat.id] || ''}
                    onChange={e => setNewSkillInputs({ ...newSkillInputs, [cat.id]: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addSkillTag(cat.id, newSkillInputs[cat.id] || '');
                      }
                    }}
                    placeholder="Type skill & press Enter (e.g. TypeScript, AWS)"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => addSkillTag(cat.id, newSkillInputs[cat.id] || '')}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                  >
                    Add
                  </button>
                </div>

                {/* AI Context-Aware Skill & Trending Keyword Suggestions */}
                <SkillsKeywordSuggester
                  targetRole={resume.contact.jobTitle}
                  categoryName={cat.name}
                  currentSkills={cat.skills}
                  typingQuery={newSkillInputs[cat.id] || ''}
                  onAddSkill={(skill) => addSkillTag(cat.id, skill)}
                  onAddCategory={(newCatName) => {
                    const newCat: SkillCategory = {
                      id: `cat-${Date.now()}`,
                      name: newCatName,
                      skills: []
                    };
                    onChange({
                      ...resume,
                      skillCategories: [...resume.skillCategories, newCat]
                    });
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Education Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="w-full px-4 py-3.5 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => toggleSection('education')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">Education ({resume.education.length})</span>
              <span className="text-xs text-slate-500 block">Degrees, universities, GPA, coursework</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addEducation}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Degree</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection('education')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              {openSections.education ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.education && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3.5">
            {resume.education.map((edu) => (
              <div key={edu.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Institution & Degree</span>
                  <button
                    type="button"
                    onClick={() => deleteEducation(edu.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">University / School *</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                      placeholder="e.g. UC Berkeley"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                      placeholder="e.g. Bachelor of Science"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Major / Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={e => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Graduation Date</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                      placeholder="e.g. 2020-05 or May 2020"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">GPA (Optional)</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={e => updateEducation(edu.id, 'gpa', e.target.value)}
                      placeholder="3.85 / 4.0"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Relevant Coursework</label>
                    <input
                      type="text"
                      value={edu.coursework || ''}
                      onChange={e => updateEducation(edu.id, 'coursework', e.target.value)}
                      placeholder="Distributed Systems, Algorithms, Databases"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Projects Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="w-full px-4 py-3.5 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => toggleSection('projects')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">Projects ({resume.projects.length})</span>
              <span className="text-xs text-slate-500 block">Personal, open-source, or client projects</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addProject}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection('projects')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              {openSections.projects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.projects && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3.5">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Project Details</span>
                  <button
                    type="button"
                    onClick={() => deleteProject(proj.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={e => updateProject(proj.id, 'name', e.target.value)}
                      placeholder="e.g. CloudSync Distributed Storage"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={e => updateProject(proj.id, 'technologies', e.target.value)}
                      placeholder="Go, Docker, Redis, AWS"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Live URL / Repo Link</label>
                    <input
                      type="text"
                      value={proj.link}
                      onChange={e => updateProject(proj.id, 'link', e.target.value)}
                      placeholder="github.com/alexmorgan/cloudsync"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Project Bullets */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">Project Achievements / Bullets</span>
                    <button
                      type="button"
                      onClick={() => addProjectBullet(proj.id)}
                      className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet
                    </button>
                  </div>
                  {proj.bulletPoints.map((bullet, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-xs">•</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={e => updateProjectBullet(proj.id, pIdx, e.target.value)}
                        placeholder="Engineered chunked data deduplication algorithm reducing storage costs by 38%..."
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => deleteProjectBullet(proj.id, pIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Certifications Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="w-full px-4 py-3.5 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => toggleSection('certifications')}
            className="flex items-center gap-2.5 flex-1 text-left"
          >
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">Certifications ({resume.certifications.length})</span>
              <span className="text-xs text-slate-500 block">Licenses, certificates, and verified honors</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addCertification}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cert</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection('certifications')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              {openSections.certifications ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.certifications && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3">
            {resume.certifications.map((cert) => (
              <div key={cert.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Certificate</span>
                  <button
                    type="button"
                    onClick={() => deleteCertification(cert.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Certification Name *</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={e => updateCertification(cert.id, 'name', e.target.value)}
                      placeholder="AWS Solutions Architect"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issuing Body</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={e => updateCertification(cert.id, 'issuer', e.target.value)}
                      placeholder="Amazon Web Services"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issue Date</label>
                    <input
                      type="text"
                      value={cert.issueDate}
                      onChange={e => updateCertification(cert.id, 'issueDate', e.target.value)}
                      placeholder="2024-03"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Credential URL / ID</label>
                    <input
                      type="text"
                      value={cert.credentialUrl || ''}
                      onChange={e => updateCertification(cert.id, 'credentialUrl', e.target.value)}
                      placeholder="aws.amazon.com/verify/..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. Theme Customizer & Section Ordering Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('theme')}
          className="w-full px-4 py-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800">Theme & Layout Customizer</span>
              <span className="text-xs text-slate-500 block">Fonts, accent colors, margins, spacing, and section order</span>
            </div>
          </div>
          {openSections.theme ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.theme && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-4">
            {/* Quick Template Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-indigo-600" />
                  Pre-Designed ATS Templates (8 Presets)
                </label>
                {onOpenTemplateGallery && (
                  <button
                    type="button"
                    onClick={onOpenTemplateGallery}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md transition"
                  >
                    <span>Browse Full Gallery</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RESUME_TEMPLATES_LIBRARY.map((tmpl) => {
                  const isMatch = (
                    resume.theme.fontFamily === tmpl.theme.fontFamily &&
                    resume.theme.accentColor === tmpl.theme.accentColor
                  );

                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        onChange({
                          ...resume,
                          theme: {
                            ...resume.theme,
                            fontFamily: tmpl.theme.fontFamily,
                            accentColor: tmpl.theme.accentColor,
                            secondaryColor: tmpl.theme.secondaryColor,
                            spacing: tmpl.theme.spacing,
                            margin: tmpl.theme.margin,
                            headerLayout: tmpl.theme.headerLayout,
                            dividerStyle: tmpl.theme.dividerStyle,
                            fontSize: tmpl.theme.fontSize,
                            sectionsOrder: tmpl.theme.sectionsOrder
                          }
                        });
                      }}
                      className={`p-2 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                        isMatch
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tmpl.theme.accentColor }}></span>
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1 rounded">
                            {tmpl.atsScore}%
                          </span>
                        </div>
                        <span className="font-bold text-[11px] block text-slate-900 leading-tight">
                          {tmpl.name}
                        </span>
                        <span className="text-[9.5px] text-slate-500 block truncate mt-0.5">
                          {tmpl.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Family Selection */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">ATS Typography (Clean Fonts)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'sans', label: 'Inter (Modern Sans)' },
                  { id: 'serif', label: 'Garamond (Executive Serif)' },
                  { id: 'jakarta', label: 'Plus Jakarta (Clean)' },
                  { id: 'roboto', label: 'Roboto (Standard Sans)' },
                  { id: 'mono', label: 'JetBrains (Tech Mono)' },
                  { id: 'cinzel', label: 'Cinzel (Formal Display)' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateTheme('fontFamily', f.id)}
                    className={`p-2 rounded-lg border text-xs font-medium transition text-left ${
                      resume.theme.fontFamily === f.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Accent Color</label>
              <div className="flex flex-wrap items-center gap-2">
                {colorPresets.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => updateTheme('accentColor', c.hex)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                      resume.theme.accentColor === c.hex
                        ? 'border-slate-900 ring-2 ring-indigo-500/20 bg-slate-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing & Margins */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section Spacing</label>
                <select
                  value={resume.theme.spacing}
                  onChange={e => updateTheme('spacing', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="compact">Compact (Fit more content)</option>
                  <option value="normal">Standard (Balanced)</option>
                  <option value="spacious">Spacious (Open air)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Page Margins</label>
                <select
                  value={resume.theme.margin}
                  onChange={e => updateTheme('margin', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="narrow">Narrow (0.5 in)</option>
                  <option value="normal">Standard (0.75 in)</option>
                  <option value="spacious">Spacious (1.0 in)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Font Size</label>
                <select
                  value={resume.theme.fontSize}
                  onChange={e => updateTheme('fontSize', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="small">Small (9.5 pt)</option>
                  <option value="medium">Medium (10.5 pt)</option>
                  <option value="large">Large (11.5 pt)</option>
                </select>
              </div>
            </div>

            {/* Header Layout & Divider Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Header Layout</label>
                <select
                  value={resume.theme.headerLayout}
                  onChange={e => updateTheme('headerLayout', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="classic">Classic Centered</option>
                  <option value="modern">Modern Left-Aligned</option>
                  <option value="minimal">Minimal Underline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section Divider</label>
                <select
                  value={resume.theme.dividerStyle}
                  onChange={e => updateTheme('dividerStyle', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="solid">Solid Line</option>
                  <option value="dashed">Dashed Line</option>
                  <option value="none">No Line</option>
                </select>
              </div>
            </div>

            {/* Section Ordering & Visibility */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Section Order & Visibility</label>
              <div className="space-y-1.5">
                {(resume.theme.sectionsOrder || ['summary', 'experience', 'skills', 'education', 'projects', 'certifications']).map((secId, idx) => {
                  const secConfig = resume.sections?.find(s => s.id === secId);
                  const isVis = secConfig?.visible !== false;

                  return (
                    <div key={secId} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <span className="font-semibold text-slate-800 capitalize">
                        {secConfig?.title || secId}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleSectionVisibility(secId)}
                          className={`p-1 rounded ${isVis ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-200'}`}
                          title={isVis ? 'Hide Section' : 'Show Section'}
                        >
                          {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                          className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (resume.theme.sectionsOrder?.length || 6) - 1}
                          onClick={() => moveSection(idx, 'down')}
                          className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
