export interface ContactInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bulletPoints: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  coursework?: string;
  honors?: string;
}

export interface SkillCategory {
  id: string;
  name: string; // e.g., "Programming Languages", "Cloud & DevOps", "Frameworks & Libraries"
  skills: string[]; // e.g., ["TypeScript", "React", "Node.js"]
}

export interface Project {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
  bulletPoints: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export type ResumeSectionId =
  | 'summary'
  | 'experience'
  | 'skills'
  | 'education'
  | 'projects'
  | 'certifications';

export interface SectionConfig {
  id: ResumeSectionId;
  title: string;
  visible: boolean;
}

export interface ThemeConfig {
  fontFamily: 'sans' | 'serif' | 'mono' | 'jakarta' | 'cinzel' | 'roboto';
  accentColor: string; // Hex or tailwind class
  secondaryColor?: string;
  spacing: 'compact' | 'normal' | 'spacious';
  margin: 'narrow' | 'normal' | 'spacious';
  headerLayout: 'classic' | 'modern' | 'minimal';
  dividerStyle: 'solid' | 'dashed' | 'none';
  fontSize: 'small' | 'medium' | 'large';
  sectionsOrder: ResumeSectionId[];
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experiences: WorkExperience[];
  education: Education[];
  skillCategories: SkillCategory[];
  projects: Project[];
  certifications: Certification[];
  theme: ThemeConfig;
  sections: SectionConfig[];
}

export interface AtsScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  findings: {
    type: 'success' | 'warning' | 'tip';
    message: string;
    fieldId?: string;
    sectionId?: string;
    details?: string[];
  }[];
}

export interface AtsAuditResult {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  summarySentence: string;
  categories: {
    contact: AtsScoreCategory;
    actionVerbs: AtsScoreCategory;
    quantifiableMetrics: AtsScoreCategory;
    formattingCompliance: AtsScoreCategory;
    contentRelevance: AtsScoreCategory;
  };
  detectedKeywords: string[];
  detectedActionVerbs: string[];
  detectedMetrics: string[];
  wordCount: number;
  estimatedReadTimeSec: number;
  pageOverflowRisk: boolean;
}

export interface JobMatchResult {
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  roleTitleMatch: boolean;
  recommendations: string[];
}

export interface CloudResumeItem {
  id: string;
  title: string;
  targetRole: string;
  lastUpdated: string;
  createdAt: string;
  score: number;
  data: ResumeData;
}

export type TemplateCategory = 
  | 'All'
  | 'Tech & Engineering'
  | 'Product & Management'
  | 'Finance & Banking'
  | 'Executive & Legal'
  | 'Compact & Minimal'
  | 'Healthcare & Science';

export interface ResumeTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  badge: string;
  targetRoles: string[];
  features: string[];
  theme: ThemeConfig;
  sampleData: ResumeData;
  atsScore: number;
}

