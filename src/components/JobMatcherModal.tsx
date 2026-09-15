import React, { useState } from 'react';
import { 
  Target, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  FileText,
  Loader2
} from 'lucide-react';
import { ResumeData, JobMatchResult } from '../types';

interface JobMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  onAddSkill: (skill: string) => void;
}

const SAMPLE_JOB_DESCRIPTIONS = [
  {
    title: 'Senior Full Stack Engineer',
    company: 'NextGen Cloud Platforms',
    text: `Job Description:
We are seeking a Senior Full Stack Software Engineer to build mission-critical, high-throughput microservices and modern web applications.
Responsibilities:
- Architect, build, and deploy scalable backend services using Node.js, TypeScript, Go, and PostgreSQL.
- Create responsive, accessible frontend user interfaces with React, Next.js, and Tailwind CSS.
- Manage containerized deployments on Kubernetes, Docker, and AWS (ECS, Lambda, S3, RDS).
- Optimize system latency, distributed Redis caching, and CI/CD pipelines on GitHub Actions.
- Collaborate across cross-functional product and design teams in fast-paced Agile/Scrum sprints.

Requirements:
- 5+ years of full-stack software development experience.
- Strong proficiency with TypeScript, React, Node.js, and SQL.
- Deep hands-on experience with Docker, Kubernetes, AWS Cloud, Redis, and Terraform.
- Track record of building high-performance systems handling 1M+ active users.
- Knowledge of GraphQL, RESTful APIs, and Test-Driven Development (TDD with Jest).`
  },
  {
    title: 'Principal Product Manager',
    company: 'FinFlow SaaS',
    text: `Job Description:
We are looking for a Principal Product Manager to own our core B2B growth loops, self-serve onboarding, and analytics platform.
Responsibilities:
- Define 3-year product vision, roadmap prioritization, and execute go-to-market (GTM) strategies.
- Lead cross-functional squads of 20+ software engineers, product designers, and data analysts.
- Run continuous user research, customer discovery interviews, and A/B experimentation (Amplitude, Mixpanel).
- Own revenue metrics, free-to-paid conversion rates, and ARR growth.

Requirements:
- 7+ years of product management experience in high-growth B2B SaaS.
- Strong data fluency: SQL, Mixpanel, Amplitude, Tableau, and cohort analysis.
- Experience with OKR tracking, Jira, Figma, PRD creation, and user story mapping.
- Proven track record generating $10M+ in recurring product revenue.`
  }
];

export function JobMatcherModal({
  isOpen,
  onClose,
  resume,
  onAddSkill
}: JobMatcherModalProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSampleSelect = (sample: typeof SAMPLE_JOB_DESCRIPTIONS[0]) => {
    setJobTitle(sample.title);
    setCompany(sample.company);
    setJobDescription(sample.text);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description or select a sample JD.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Gather resume text and skills
      const allSkills: string[] = [];
      resume.skillCategories.forEach(c => allSkills.push(...c.skills));
      
      const resumeText = [
        resume.contact.fullName,
        resume.contact.jobTitle,
        resume.summary,
        ...resume.experiences.map(e => `${e.company} ${e.position} ${e.bulletPoints.join(' ')}`),
        ...resume.projects.map(p => `${p.name} ${p.technologies} ${p.bulletPoints.join(' ')}`),
        ...resume.education.map(ed => `${ed.degree} ${ed.fieldOfStudy}`)
      ].join('\n');

      const response = await fetch('/api/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: `Target Title: ${jobTitle}\nCompany: ${company}\n${jobDescription}`,
          resumeSkills: allSkills
        })
      });

      if (!response.ok) {
        throw new Error('Failed to match job description with server.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to match job description.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkillClick = (skill: string) => {
    onAddSkill(skill);
    setAddedSkills(prev => [...prev, skill]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ATS Job Description Matcher & Keyword Gap Scanner</h2>
              <p className="text-xs text-slate-500">Scan candidate resume against target role for ATS keyword coverage</p>
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Sample quick loader */}
          <div>
            <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Quick Load Sample Job Descriptions:</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_JOB_DESCRIPTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleSelect(s)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg transition"
                >
                  {s.title} ({s.company})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Company (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, Meta"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Description Requirements & Responsibilities *
            </label>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting text here..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition font-mono leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !jobDescription.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Match with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run ATS Keyword Match</span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          {result && (
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              {/* Match Percentage Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-lg">
                    {result.matchPercentage}%
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Job Description Keyword Match
                    </h3>
                    <p className="text-xs text-slate-500">
                      {result.matchPercentage >= 85
                        ? 'High Alignment! Resume is ready for ATS submission.'
                        : result.matchPercentage >= 65
                        ? 'Moderate Match. Adding missing keywords will boost your score.'
                        : 'Low Match. Tailor resume skills and bullet points to match JD keywords.'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    result.roleTitleMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {result.roleTitleMatch ? '✓ Job Title Aligned' : '⚠️ Title Mismatch'}
                  </span>
                </div>
              </div>

              {/* Missing Keywords (Actionable) */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Missing High-Priority Keywords in Resume ({result.missingKeywords.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Click "+" to add to resume skills</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.missingKeywords.map((kw, i) => {
                    const isAdded = addedSkills.includes(kw);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSkillClick(kw)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          isAdded
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200'
                        }`}
                      >
                        {isAdded ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                        <span>{kw}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matched Keywords */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Successfully Matched Keywords ({result.matchedKeywords.length})
                </h4>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{kw}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Optimization Recommendations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {result.recommendations.map((rec, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
