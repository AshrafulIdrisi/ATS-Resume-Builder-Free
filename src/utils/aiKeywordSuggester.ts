export interface SkillsSuggestionResult {
  recommendedSkills: string[];
  trendingKeywords: string[];
  categorySuggestions: string[];
}

export interface ExperienceSuggestionResult {
  actionVerbs: string[];
  technicalKeywords: string[];
  metricTemplates: string[];
  bulletTemplates: string[];
}

// Fallback recommendations for instant zero-latency responses or offline mode
const FALLBACK_SKILLS_MAP: Record<string, string[]> = {
  software: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'REST APIs', 'CI/CD', 'Git', 'Redis', 'Microservices', 'Jest', 'System Architecture'],
  engineer: ['Python', 'Java', 'Go', 'Distributed Systems', 'Linux', 'SQL', 'Terraform', 'Kafka', 'Performance Optimization', 'Security', 'Agile / Scrum', 'Unit Testing'],
  product: ['Product Discovery', 'Roadmap Planning', 'User Research', 'A/B Testing', 'Mixpanel', 'SQL', 'PRD Authoring', 'GTM Strategy', 'Stakeholder Management', 'Scrum / Kanban'],
  data: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Scikit-Learn', 'PyTorch', 'ETL Pipelines', 'BigQuery', 'Data Modeling'],
  finance: ['Financial Modeling', 'DCF Analysis', 'LBO Valuation', 'Bloomberg Terminal', 'Excel VBA', 'M&A Due Diligence', 'Capital IQ', 'Accounting (GAAP)', 'Risk Management'],
  management: ['Cross-Functional Leadership', 'Budgeting & P&L', 'Strategic Planning', 'OKRs', 'Executive Presentations', 'Vendor Management', 'Change Management']
};

const FALLBACK_ACTION_VERBS = [
  'Architected', 'Engineered', 'Spearheaded', 'Accelerated', 'Optimized',
  'Orchestrated', 'Delivered', 'Automated', 'Scaled', 'Pioneered',
  'Transformed', 'Instituted', 'Negotiated', 'Expanded', 'Reduced'
];

export async function fetchSkillSuggestions(params: {
  targetRole?: string;
  categoryName?: string;
  currentSkills?: string[];
  typingQuery?: string;
}): Promise<SkillsSuggestionResult> {
  try {
    const response = await fetch('/api/suggest-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'skills',
        targetRole: params.targetRole || '',
        categoryName: params.categoryName || '',
        currentSkills: params.currentSkills || [],
        typingQuery: params.typingQuery || ''
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      recommendedSkills: data.recommendedSkills || [],
      trendingKeywords: data.trendingKeywords || [],
      categorySuggestions: data.categorySuggestions || []
    };
  } catch (error) {
    console.warn('AI skill suggestion server request failed, using intelligent fallback:', error);
    
    // Fallback logic based on role keywords
    const roleKey = (params.targetRole || 'software').toLowerCase();
    const matched = Object.entries(FALLBACK_SKILLS_MAP).find(([key]) => roleKey.includes(key));
    const baseList = matched ? matched[1] : FALLBACK_SKILLS_MAP.software;

    const filtered = params.typingQuery
      ? baseList.filter(s => s.toLowerCase().includes((params.typingQuery || '').toLowerCase()))
      : baseList;

    return {
      recommendedSkills: filtered.length > 0 ? filtered : baseList.slice(0, 10),
      trendingKeywords: ['AI Integration', 'Cloud Architecture', 'Distributed Systems', 'CI/CD Automation', 'Modern Tooling'],
      categorySuggestions: ['Technical Skills', 'Frameworks & Libraries', 'Cloud & Tools', 'Leadership & Methodologies']
    };
  }
}

export async function fetchExperienceSuggestions(params: {
  targetRole?: string;
  position?: string;
  company?: string;
  currentBullet?: string;
  typingQuery?: string;
}): Promise<ExperienceSuggestionResult> {
  try {
    const response = await fetch('/api/suggest-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'experience',
        targetRole: params.targetRole || '',
        position: params.position || '',
        company: params.company || '',
        currentBullet: params.currentBullet || '',
        typingQuery: params.typingQuery || ''
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      actionVerbs: data.actionVerbs || FALLBACK_ACTION_VERBS,
      technicalKeywords: data.technicalKeywords || [],
      metricTemplates: data.metricTemplates || [],
      bulletTemplates: data.bulletTemplates || []
    };
  } catch (error) {
    console.warn('AI experience suggestion server request failed, using intelligent fallback:', error);
    return {
      actionVerbs: FALLBACK_ACTION_VERBS,
      technicalKeywords: ['p99 latency', 'throughput', 'CI/CD', 'microservices', 'PostgreSQL', 'AWS', 'Redis', 'Docker', 'REST API', 'KPI tracking'],
      metricTemplates: [
        'reduced latency by 45%',
        'scaled to 1.5M+ active users',
        'decreased cloud infrastructure costs by $35k/year',
        'accelerated release cycle by 3x',
        'boosted conversion rate by 24%'
      ],
      bulletTemplates: [
        'Architected high-throughput microservice in TypeScript, reducing p99 latency by 42% across 1M+ active users.',
        'Spearheaded automated CI/CD deployment pipeline, accelerating team release velocity by 60%.',
        'Engineered distributed caching tier with Redis, saving $120k in annual cloud infrastructure expenses.'
      ]
    };
  }
}
