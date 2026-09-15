export interface VerbCategory {
  category: string;
  verbs: string[];
}

export const STRONG_ACTION_VERBS: VerbCategory[] = [
  {
    category: 'Leadership & Management',
    verbs: [
      'Accelerated', 'Architected', 'Championed', 'Coordinated', 'Directed',
      'Empowered', 'Engineered', 'Established', 'Executed', 'Founded',
      'Governed', 'Guided', 'Headheaded', 'Impacted', 'Instituted',
      'Led', 'Leveraged', 'Managed', 'Mentored', 'Mobilized',
      'Orchestrated', 'Overhauled', 'Pioneered', 'Spearheaded', 'Steered',
      'Supervised', 'Trained', 'Unified', 'Vanguard'
    ]
  },
  {
    category: 'Development & Engineering',
    verbs: [
      'Authored', 'Automated', 'Built', 'Configured', 'Constructed',
      'Crafted', 'Customized', 'Debugged', 'Deployed', 'Designed',
      'Developed', 'Devised', 'Drafted', 'Engineered', 'Fabricated',
      'Formulated', 'Generated', 'Implemented', 'Installed', 'Integrated',
      'Modernized', 'Modeled', 'Modified', 'Patched', 'Programmed',
      'Provisioned', 'Re-architected', 'Refactored', 'Rendered', 'Synthesized',
      'Upgraded', 'Validated'
    ]
  },
  {
    category: 'Optimization & Results',
    verbs: [
      'Boosted', 'Capitalized', 'Consolidated', 'Curtail', 'Decreased',
      'Delivered', 'Doubled', 'Eliminated', 'Enhanced', 'Expanded',
      'Expedited', 'Gained', 'Generated', 'Increased', 'Lifted',
      'Maximized', 'Minimized', 'Mitigated', 'Optimized', 'Outperformed',
      'Rebuilt', 'Reduced', 'Refined', 'Regulated', 'Restructured',
      'Scaled', 'Streamlined', 'Surpassed', 'Transformed', 'Trimmed',
      'Yielded'
    ]
  },
  {
    category: 'Research, Data & Analysis',
    verbs: [
      'Analyzed', 'Assessed', 'Audited', 'Benchmarked', 'Calculated',
      'Compiled', 'Derived', 'Discovered', 'Evaluated', 'Examined',
      'Forecasted', 'Identified', 'Investigated', 'Mapped', 'Measured',
      'Modeled', 'Monitored', 'Quantified', 'Queried', 'Researched',
      'Surveyed', 'Tested', 'Tracked', 'Uncovered'
    ]
  },
  {
    category: 'Collaboration & Communication',
    verbs: [
      'Advocated', 'Authored', 'Clarified', 'Collaborated', 'Communicated',
      'Conducted', 'Consulted', 'Conveyed', 'Documented', 'Engaged',
      'Facilitated', 'Liaised', 'Marketed', 'Negotiated', 'Partnered',
      'Presented', 'Promoted', 'Published', 'Resolved', 'Secured'
    ]
  }
];

export const ALL_ACTION_VERBS_SET = new Set(
  STRONG_ACTION_VERBS.flatMap(cat => cat.verbs.map(v => v.toLowerCase()))
);

export const WEAK_VERBS_MAP: Record<string, string[]> = {
  'worked on': ['Engineered', 'Developed', 'Executed', 'Spearheaded', 'Delivered'],
  'helped': ['Collaborated with', 'Facilitated', 'Assisted in', 'Coordinated'],
  'responsible for': ['Managed', 'Directed', 'Owned', 'Oversaw', 'Spearheaded'],
  'did': ['Executed', 'Completed', 'Implemented', 'Delivered'],
  'handled': ['Administered', 'Managed', 'Resolved', 'Coordinated'],
  'assisted': ['Collaborated', 'Facilitated', 'Supported', 'Partnered with'],
  'made': ['Engineered', 'Designed', 'Architected', 'Crafted', 'Developed'],
  'tried to': ['Initiated', 'Pioneered', 'Spearheaded'],
  'utilized': ['Leveraged', 'Applied', 'Employed', 'Integrated'],
  'tasked with': ['Spearheaded', 'Led', 'Directed', 'Executed'],
  'looked at': ['Analyzed', 'Evaluated', 'Audited', 'Assessed'],
  'talked to': ['Liaised with', 'Negotiated with', 'Partnered with', 'Consulted']
};

export function detectActionVerb(text: string): { isStrong: boolean; verb?: string } {
  if (!text || text.trim().length === 0) return { isStrong: false };
  const firstWord = text.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
  
  if (ALL_ACTION_VERBS_SET.has(firstWord)) {
    return { isStrong: true, verb: firstWord };
  }
  return { isStrong: false, verb: firstWord };
}

export function detectWeakPhrases(text: string): { found: string; suggestions: string[] }[] {
  const lower = text.toLowerCase();
  const results: { found: string; suggestions: string[] }[] = [];
  
  for (const [weak, suggestions] of Object.entries(WEAK_VERBS_MAP)) {
    if (lower.includes(weak)) {
      results.push({ found: weak, suggestions });
    }
  }
  return results;
}
