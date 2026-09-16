import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  ArrowRight, 
  Copy, 
  Loader2, 
  Briefcase, 
  FileText, 
  ShieldAlert, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { ResumeData } from '../types';

export type AiModalMode = 'bullet' | 'summary' | 'audit';

interface AiEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AiModalMode;
  resume: ResumeData;
  initialBullet?: string;
  bulletContext?: string;
  targetRole?: string;
  onApplyBullet?: (enhanced: string) => void;
  onApplySummary?: (summary: string) => void;
}

export function AiEnhancerModal({
  isOpen,
  onClose,
  mode,
  resume,
  initialBullet = '',
  bulletContext = '',
  targetRole = '',
  onApplyBullet,
  onApplySummary
}: AiEnhancerModalProps) {
  const [bulletInput, setBulletInput] = useState(initialBullet);
  const [contextInput, setContextInput] = useState(bulletContext);
  const [roleInput, setRoleInput] = useState(targetRole || resume.contact.jobTitle);
  const [tone, setTone] = useState<'executive' | 'technical' | 'modern' | 'creative'>('technical');
  const [yearsOfExp, setYearsOfExp] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [enhancedBulletResult, setEnhancedBulletResult] = useState<{
    enhancedBullet: string;
    actionVerbUsed: string;
    quantifiableMetricAdded: string;
    xyzFormulaBreakdown: { x: string; y: string; z: string };
    alternativeOptions: string[];
  } | null>(null);

  const [summaryOptions, setSummaryOptions] = useState<string[]>([]);
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEnhanceBullet = async (customText?: string) => {
    const textToEnhance = customText || bulletInput;
    if (!textToEnhance.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText: textToEnhance,
          jobTitle: roleInput,
          companyContext: contextInput
        })
      });

      if (!res.ok) throw new Error('AI enhancement request failed.');
      const data = await res.json();
      setEnhancedBulletResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to enhance bullet point.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const allSkills: string[] = [];
      resume.skillCategories.forEach(c => allSkills.push(...c.skills));

      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: roleInput || resume.contact.jobTitle,
          yearsOfExperience: yearsOfExp,
          topSkills: allSkills.slice(0, 10),
          tone,
          currentExperienceSummary: resume.experiences.map(e => `${e.position} at ${e.company}`).join('; ')
        })
      });

      if (!res.ok) throw new Error('AI summary generation failed.');
      const data = await res.json();
      setSummaryOptions(data.summaries || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate professional summaries.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ats-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resume,
          resumeData: resume,
          targetRole: roleInput || resume.contact.jobTitle
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || 'Recruiter audit service temporarily unavailable.');
      }
      const data = await res.json();
      if (data.auditFeedback) {
        setAuditFeedback(data.auditFeedback);
      } else if (data.recruiterVerdict) {
        const report = [
          `🏆 EXECUTIVE VERDICT:\n${data.recruiterVerdict}`,
          `\n✨ TOP STRENGTHS:\n${(data.strengths || []).map((s: string) => `• ${s}`).join('\n')}`,
          `\n⚠️ ATS RED FLAGS:\n${(data.redFlags || []).map((f: string) => `• ${f}`).join('\n')}`,
          `\n🎯 PRIORITY ACTION ITEMS:\n${(data.priorityActionItems || []).map((a: string) => `• ${a}`).join('\n')}`
        ].join('\n');
        setAuditFeedback(report);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate recruiter audit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'bullet' && 'AI XYZ-Formula Bullet Enhancer'}
                {mode === 'summary' && 'AI ATS Professional Summary Generator'}
                {mode === 'audit' && 'AI Recruiter & ATS Simulation Diagnostic'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'bullet' && 'Converts passive tasks into high-impact, quantified achievement statements'}
                {mode === 'summary' && 'Generates high-ranking summary statements tailored for ATS parsers'}
                {mode === 'audit' && 'Simulates an executive technical recruiter review with actionable critique'}
              </p>
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* MODE 1: BULLET POINT ENHANCER */}
          {mode === 'bullet' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Draft Achievement / Bullet Point
                </label>
                <textarea
                  rows={3}
                  value={bulletInput}
                  onChange={e => setBulletInput(e.target.value)}
                  placeholder="e.g. Worked on database performance and helped make queries faster..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Job Title</label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={e => setRoleInput(e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company / Project Context</label>
                  <input
                    type="text"
                    value={contextInput}
                    onChange={e => setContextInput(e.target.value)}
                    placeholder="High throughput fintech API"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleEnhanceBullet()}
                  disabled={loading || !bulletInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Structuring XYZ Formula...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Enhance with Google XYZ Formula</span>
                    </>
                  )}
                </button>
              </div>

              {/* Enhanced Result */}
              {enhancedBulletResult && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Recommended XYZ Formula Enhancement
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      ATS Optimized
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 leading-relaxed">
                    {enhancedBulletResult.enhancedBullet}
                  </div>

                  {/* XYZ breakdown */}
                  {enhancedBulletResult.xyzFormulaBreakdown && (
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
                        <span className="font-bold text-blue-800 block">Accomplished [X]:</span>
                        <span className="text-blue-900">{enhancedBulletResult.xyzFormulaBreakdown.x}</span>
                      </div>
                      <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <span className="font-bold text-emerald-800 block">Measured by [Y]:</span>
                        <span className="text-emerald-900">{enhancedBulletResult.xyzFormulaBreakdown.y}</span>
                      </div>
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <span className="font-bold text-indigo-800 block">By doing [Z]:</span>
                        <span className="text-indigo-900">{enhancedBulletResult.xyzFormulaBreakdown.z}</span>
                      </div>
                    </div>
                  )}

                  {/* Apply Button */}
                  <div className="flex justify-end gap-2 pt-1">
                    {onApplyBullet && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyBullet(enhancedBulletResult.enhancedBullet);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply to Resume</span>
                      </button>
                    )}
                  </div>

                  {/* Alternative Variations */}
                  {enhancedBulletResult.alternativeOptions?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 block">Alternative Phrasings:</span>
                      {enhancedBulletResult.alternativeOptions.map((alt, aIdx) => (
                        <div key={aIdx} className="flex items-start justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700">
                          <span className="flex-1">{alt}</span>
                          {onApplyBullet && (
                            <button
                              type="button"
                              onClick={() => {
                                onApplyBullet(alt);
                                onClose();
                              }}
                              className="text-[11px] font-semibold text-indigo-600 hover:underline shrink-0"
                            >
                              Use this
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MODE 2: SUMMARY GENERATOR */}
          {mode === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Title *</label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={e => setRoleInput(e.target.value)}
                    placeholder="e.g. Lead Frontend Architect"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={yearsOfExp}
                    onChange={e => setYearsOfExp(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Professional Persona / Tone</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'technical', label: 'Technical & Systems' },
                    { id: 'executive', label: 'Executive & Leadership' },
                    { id: 'modern', label: 'Modern & Agile' },
                    { id: 'creative', label: 'Creative & Product' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as any)}
                      className={`p-2 text-xs font-medium rounded-lg border transition ${
                        tone === t.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Summaries...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate 3 ATS Summaries</span>
                    </>
                  )}
                </button>
              </div>

              {/* Summary Options */}
              {summaryOptions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-800 block">Choose an ATS Optimized Summary:</span>
                  {summaryOptions.map((opt, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <p className="text-xs text-slate-800 leading-relaxed">{opt}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                        <span>{opt.split(/\s+/).length} words • ATS Keyword Heavy</span>
                        {onApplySummary && (
                          <button
                            type="button"
                            onClick={() => {
                              onApplySummary(opt);
                              onClose();
                            }}
                            className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Select & Apply</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODE 3: RECRUITER AUDIT */}
          {mode === 'audit' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>Comprehensive Executive Recruiter Diagnostic</span>
                </div>
                <p>
                  Our AI scans the entire resume looking for formatting landmines, weak buzzwords, missing metrics, and role misalignment.
                </p>
              </div>

              {!auditFeedback && (
                <div className="flex justify-center py-4">
                  <button
                    type="button"
                    onClick={handleRunAudit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Recruiter AI is Reviewing Resume...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run Full Recruiter AI Diagnostic</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {auditFeedback && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-900">Recruiter Audit Report</span>
                    <button
                      type="button"
                      onClick={handleRunAudit}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Re-run Audit
                    </button>
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed space-y-2 font-mono bg-white p-4 rounded-lg border border-slate-200">
                    {auditFeedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
