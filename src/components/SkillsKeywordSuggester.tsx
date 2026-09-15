import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Check, 
  TrendingUp, 
  Layers, 
  RefreshCw, 
  Wrench,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { fetchSkillSuggestions, SkillsSuggestionResult } from '../utils/aiKeywordSuggester';

interface SkillsKeywordSuggesterProps {
  targetRole: string;
  categoryName: string;
  currentSkills: string[];
  typingQuery?: string;
  onAddSkill: (skill: string) => void;
  onAddCategory?: (categoryName: string) => void;
}

export function SkillsKeywordSuggester({
  targetRole,
  categoryName,
  currentSkills,
  typingQuery,
  onAddSkill,
  onAddCategory
}: SkillsKeywordSuggesterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillsSuggestionResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [recentAdded, setRecentAdded] = useState<Record<string, boolean>>({});

  // Auto-fetch initial recommendations on mount or when category/target role changes
  const loadSuggestions = async (query?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchSkillSuggestions({
        targetRole,
        categoryName,
        currentSkills,
        typingQuery: query || typingQuery || ''
      });
      setSuggestions(res);
    } catch (err) {
      console.error('Failed to load skill suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [targetRole, categoryName]);

  // Debounced update when user is typing in the skill input
  useEffect(() => {
    if (!typingQuery || typingQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      loadSuggestions(typingQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [typingQuery]);

  const handleAdd = (skill: string) => {
    if (!currentSkills.includes(skill)) {
      onAddSkill(skill);
      setRecentAdded(prev => ({ ...prev, [skill]: true }));
      setTimeout(() => {
        setRecentAdded(prev => ({ ...prev, [skill]: false }));
      }, 1500);
    }
  };

  return (
    <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs space-y-2.5 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-600 text-white rounded-md shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            AI Skill & Keyword Suggester
            <span className="text-[10px] font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded">
              Gemini Powered
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => loadSuggestions()}
            disabled={isLoading}
            className="p-1 text-indigo-600 hover:bg-indigo-100/70 rounded-md transition disabled:opacity-50"
            title="Refresh AI Suggestions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-2.5 pt-1">
          {/* Top Recommended Hard Skills */}
          <div>
            <span className="text-[11px] font-semibold text-slate-600 block mb-1.5 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-indigo-500" />
              Recommended for <strong className="text-slate-900">{categoryName || targetRole || 'Role'}</strong>:
            </span>

            {isLoading && !suggestions ? (
              <div className="flex items-center gap-2 py-1 text-slate-500 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Generating industry-calibrated skills with Gemini...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(suggestions?.recommendedSkills || []).map((skill, idx) => {
                  const isExisting = currentSkills.includes(skill);
                  const isJustAdded = recentAdded[skill];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAdd(skill)}
                      disabled={isExisting}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : isExisting
                          ? 'bg-slate-200/80 text-slate-500 border border-slate-300 opacity-60 cursor-default'
                          : 'bg-white hover:bg-indigo-600 hover:text-white text-slate-800 border border-indigo-200 shadow-2xs'
                      }`}
                    >
                      {isJustAdded ? (
                        <Check className="w-3 h-3" />
                      ) : isExisting ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Plus className="w-3 h-3 text-indigo-500 group-hover:text-white" />
                      )}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trending 2025/2026 Keywords */}
          {suggestions?.trendingKeywords && suggestions.trendingKeywords.length > 0 && (
            <div className="pt-2 border-t border-indigo-100/80">
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                Trending Industry Standards:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.trendingKeywords.map((tech, idx) => {
                  const isExisting = currentSkills.includes(tech);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAdd(tech)}
                      disabled={isExisting}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium transition ${
                        isExisting
                          ? 'bg-slate-200 text-slate-500 opacity-60 cursor-default'
                          : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>{tech}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Category Clusters */}
          {onAddCategory && suggestions?.categorySuggestions && suggestions.categorySuggestions.length > 0 && (
            <div className="pt-2 border-t border-indigo-100/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                Suggested Categories:
              </span>
              {suggestions.categorySuggestions.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAddCategory(cat)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] whitespace-nowrap font-medium transition"
                >
                  + {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
