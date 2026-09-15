import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Zap, 
  TrendingUp, 
  Target, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { fetchExperienceSuggestions, ExperienceSuggestionResult } from '../utils/aiKeywordSuggester';

interface ExperienceKeywordSuggesterProps {
  targetRole: string;
  position: string;
  company: string;
  currentBullet?: string;
  onInsertText: (text: string) => void;
  onReplaceBullet?: (text: string) => void;
}

export function ExperienceKeywordSuggester({
  targetRole,
  position,
  company,
  currentBullet,
  onInsertText,
  onReplaceBullet
}: ExperienceKeywordSuggesterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ExperienceSuggestionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'verbs' | 'keywords' | 'metrics' | 'templates'>('verbs');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchExperienceSuggestions({
        targetRole,
        position,
        company,
        currentBullet
      });
      setSuggestions(res);
    } catch (err) {
      console.error('Failed to load experience suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !suggestions) {
      loadSuggestions();
    }
  }, [isExpanded, position, company]);

  const handleCopyOrInsertTemplate = (template: string, idx: number) => {
    if (onReplaceBullet) {
      onReplaceBullet(template);
    } else {
      onInsertText(template);
    }
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-xs transition">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-slate-50 cursor-pointer hover:bg-indigo-50 transition select-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-600 text-white rounded-md shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            AI Keywords & Action Verbs for <span className="text-indigo-700 font-extrabold">{position || targetRole || 'this Role'}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[10px] text-indigo-600 font-semibold hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Expand Suggestions'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-slate-200 bg-white space-y-3">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1">
              {[
                { id: 'verbs', label: 'Action Verbs', icon: Zap },
                { id: 'keywords', label: 'Tech & Domain', icon: Target },
                { id: 'metrics', label: 'Metric Formulas', icon: TrendingUp },
                { id: 'templates', label: 'XYZ Templates', icon: FileText }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={loadSuggestions}
              disabled={isLoading}
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"
              title="Refresh with Gemini AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Tab Content Panels */}
          {isLoading && !suggestions ? (
            <div className="py-4 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analyzing job scope and generating tailored keywords...</span>
            </div>
          ) : (
            <div>
              {/* 1. Action Verbs */}
              {activeTab === 'verbs' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 block font-medium">
                    Click to insert strong past-tense action verbs directly into your bullet:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(suggestions?.actionVerbs || []).map((verb, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onInsertText(verb + ' ')}
                        className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 text-xs font-semibold shadow-2xs transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{verb}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Technical Domain Keywords */}
              {activeTab === 'keywords' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 block font-medium">
                    Role-relevant keywords that enterprise ATS parsers prioritize:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(suggestions?.technicalKeywords || []).map((kw, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onInsertText(kw)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-800 border border-slate-200 text-xs font-medium shadow-2xs transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Metric Templates */}
              {activeTab === 'metrics' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 block font-medium">
                    Quantifiable impact benchmarks (click to append to active bullet):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {(suggestions?.metricTemplates || []).map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onInsertText(` ${m}`)}
                        className="text-left p-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs transition flex items-start justify-between gap-1.5"
                      >
                        <span className="font-medium">{m}</span>
                        <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. XYZ Formula Starters */}
              {activeTab === 'templates' && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 block font-medium">
                    Google-standard XYZ formula bullets: "Accomplished [X], measured by [Y], by doing [Z]"
                  </span>
                  <div className="space-y-1.5">
                    {(suggestions?.bulletTemplates || []).map((b, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition space-y-1.5"
                      >
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                          {b}
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => handleCopyOrInsertTemplate(b, idx)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded shadow-2xs transition"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Applied!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Use This Template</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
