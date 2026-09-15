import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  Layers, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { AtsAuditResult, AtsScoreCategory } from '../types';

interface AtsScoreMeterProps {
  audit: AtsAuditResult;
  onOpenAuditModal?: () => void;
  onOpenJobMatcher?: () => void;
  onSectionClick?: (sectionId: string) => void;
}

export function AtsScoreMeter({
  audit,
  onOpenAuditModal,
  onOpenJobMatcher,
  onSectionClick
}: AtsScoreMeterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategoryKey, setActiveCategoryKey] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'text-emerald-500', bar: 'bg-emerald-500' };
    if (score >= 80) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'text-blue-500', bar: 'bg-blue-500' };
    if (score >= 65) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'text-amber-500', bar: 'bg-amber-500' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', ring: 'text-rose-500', bar: 'bg-rose-500' };
  };

  const colors = getScoreColor(audit.overallScore);

  const categoryList = [
    { key: 'contact', data: audit.categories.contact, icon: ShieldCheck, targetSection: 'contact' },
    { key: 'actionVerbs', data: audit.categories.actionVerbs, icon: TrendingUp, targetSection: 'experience' },
    { key: 'quantifiableMetrics', data: audit.categories.quantifiableMetrics, icon: Target, targetSection: 'experience' },
    { key: 'formattingCompliance', data: audit.categories.formattingCompliance, icon: Layers, targetSection: 'summary' },
    { key: 'contentRelevance', data: audit.categories.contentRelevance, icon: FileCheck, targetSection: 'skills' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Top Banner / Summary */}
      <div className="p-4 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 flex flex-wrap items-center justify-between gap-4">
        {/* Score & Grade */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xs border border-slate-200">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={colors.ring}
                strokeDasharray={`${audit.overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-base font-extrabold ${colors.text}`}>
                {audit.overallScore}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">ATS Readiness Score</span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                Grade {audit.grade}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-sm line-clamp-1">
              {audit.summarySentence}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenJobMatcher && (
            <button
              type="button"
              onClick={onOpenJobMatcher}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Match with Job</span>
            </button>
          )}

          {onOpenAuditModal && (
            <button
              type="button"
              onClick={onOpenAuditModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI ATS Audit</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title={isExpanded ? 'Collapse ATS Breakdown' : 'Expand ATS Breakdown'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mini Progress Bars (Collapsed view) */}
      {!isExpanded && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {categoryList.map(({ key, data }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span className="truncate">{data.name.split(' ')[0]}</span>
                <span>{data.score}/{data.maxScore}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    data.status === 'excellent' ? 'bg-emerald-500' :
                    data.status === 'good' ? 'bg-blue-500' :
                    data.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${(data.score / data.maxScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Breakdown */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-200 space-y-4 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryList.map(({ key, data, icon: Icon, targetSection }) => {
              const isOpen = activeCategoryKey === key;
              const catPercent = Math.round((data.score / data.maxScore) * 100);

              return (
                <div
                  key={key}
                  className="bg-white border border-slate-200 rounded-lg p-3 hover:border-indigo-200 transition"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setActiveCategoryKey(isOpen ? null : key)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${
                        data.status === 'excellent' ? 'bg-emerald-50 text-emerald-600' :
                        data.status === 'good' ? 'bg-blue-50 text-blue-600' :
                        data.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{data.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {data.score} of {data.maxScore} points ({catPercent}%)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        data.status === 'excellent' ? 'bg-emerald-100 text-emerald-800' :
                        data.status === 'good' ? 'bg-blue-100 text-blue-800' :
                        data.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {data.status}
                      </span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Findings Checklist */}
                  <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-100">
                    {data.findings.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-1.5 text-xs">
                        {f.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : f.type === 'warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-[11px] leading-tight ${
                          f.type === 'success' ? 'text-slate-700' :
                          f.type === 'warning' ? 'text-amber-900 font-medium' : 'text-slate-600'
                        }`}>
                          {f.message}
                        </span>
                      </div>
                    ))}

                    {onSectionClick && targetSection && (
                      <button
                        type="button"
                        onClick={() => onSectionClick(targetSection)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline pt-1 inline-block"
                      >
                        Edit {data.name.split(' ')[0]} →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Metrics Stats */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-4">
              <span><strong>Word Count:</strong> {audit.wordCount} words</span>
              <span><strong>Est. Recruiter Read:</strong> ~{audit.estimatedReadTimeSec}s</span>
              <span><strong>Action Verbs:</strong> {audit.detectedActionVerbs.length} detected</span>
              <span><strong>Metrics:</strong> {audit.detectedMetrics.length} detected</span>
            </div>
            {audit.pageOverflowRisk && (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-semibold">
                ⚠️ Length Warning: May span into page 2
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
