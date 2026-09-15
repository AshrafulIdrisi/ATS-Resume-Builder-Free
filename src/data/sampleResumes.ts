import { ResumeData } from '../types';

export const DEFAULT_THEME_CONFIG: ResumeData['theme'] = {
  fontFamily: 'sans',
  accentColor: '#1e3a8a', // Deep Navy
  secondaryColor: '#3b82f6',
  spacing: 'normal',
  margin: 'normal',
  headerLayout: 'classic',
  dividerStyle: 'solid',
  fontSize: 'medium',
  sectionsOrder: ['summary', 'experience', 'skills', 'education', 'projects', 'certifications']
};

export const DEFAULT_SECTIONS_CONFIG: ResumeData['sections'] = [
  { id: 'summary', title: 'Professional Summary', visible: true },
  { id: 'experience', title: 'Work Experience', visible: true },
  { id: 'skills', title: 'Skills & Competencies', visible: true },
  { id: 'education', title: 'Education', visible: true },
  { id: 'projects', title: 'Key Projects', visible: true },
  { id: 'certifications', title: 'Certifications', visible: true }
];

export const SOFTWARE_ENGINEER_SAMPLE: ResumeData = {
  contact: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Full Stack Software Engineer',
    email: 'alex.morgan@email.com',
    phone: '(555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan-dev',
    portfolio: 'alexmorgan.dev',
    github: 'github.com/alexmorgan'
  },
  summary: 'Performance-driven Senior Software Engineer with 6+ years of experience architecting high-throughput distributed microservices, modern full-stack web applications, and cloud-native systems. Proven track record reducing system latencies by 42% and scaling platforms to 1.5M+ active users while championing clean architecture and CI/CD automation.',
  experiences: [
    {
      id: 'exp-1',
      company: 'Stripe Innovations Inc.',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2023-01',
      endDate: '',
      current: true,
      bulletPoints: [
        'Architected high-throughput payment settlement microservice in Node.js and TypeScript, handling $45M+ in monthly transactions with 99.99% uptime.',
        'Engineered distributed Redis caching tier that slashed p99 database query latency by 45% (from 180ms down to 35ms) across 1.2M daily active users.',
        'Spearheaded automated CI/CD pipeline modernization on GitHub Actions and Kubernetes, decreasing deployment release cycles by 60%.',
        'Mentored 6 junior and mid-level engineers in test-driven development (TDD), resulting in an 18% reduction in production bug escalations.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Apex Cloud Solutions',
      position: 'Full Stack Software Engineer',
      location: 'Austin, TX',
      startDate: '2020-06',
      endDate: '2022-12',
      current: false,
      bulletPoints: [
        'Developed customer telemetry analytics dashboard in React, TypeScript, and Tailwind CSS, increasing enterprise client engagement by 32%.',
        'Refactored legacy REST endpoints into GraphQL microservices, saving 25% payload bandwidth and boosting mobile client load speeds by 2.4x.',
        'Automated database migration scripts in PostgreSQL and Docker, eliminating 8 hours of manual weekly DBA intervention.',
        'Collaborated with product and UX teams across 4 agile sprints to ship multi-tenant RBAC security features to 85+ enterprise accounts.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science & Software Engineering',
      location: 'Berkeley, CA',
      startDate: '2016-08',
      endDate: '2020-05',
      current: false,
      gpa: '3.85 / 4.0',
      coursework: 'Distributed Systems, Data Structures & Algorithms, Database Design, Operating Systems, Computer Security',
      honors: 'Dean\'s Honor List (4 semesters), Upsilon Pi Epsilon CS Honor Society'
    }
  ],
  skillCategories: [
    {
      id: 'skill-1',
      name: 'Programming Languages',
      skills: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'Go', 'SQL (PostgreSQL)', 'Java']
    },
    {
      id: 'skill-2',
      name: 'Frameworks & Libraries',
      skills: ['React 19', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'GraphQL', 'RESTful APIs']
    },
    {
      id: 'skill-3',
      name: 'Cloud, DevOps & Tools',
      skills: ['AWS (Lambda, S3, ECS, RDS)', 'Docker', 'Kubernetes', 'Redis', 'Git', 'GitHub Actions', 'PostgreSQL', 'Terraform']
    },
    {
      id: 'skill-4',
      name: 'Methodologies & Practices',
      skills: ['Distributed Microservices', 'CI/CD Automation', 'Agile / Scrum', 'Test-Driven Development (Jest)', 'System Architecture']
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'CloudSync Distributed File Store',
      technologies: 'Go, gRPC, Docker, Redis, AWS S3',
      link: 'github.com/alexmorgan/cloudsync-engine',
      description: 'Open-source distributed blob storage engine with real-time replication and SHA-256 deduplication.',
      bulletPoints: [
        'Engineered chunked data deduplication algorithm that reduced cloud storage expenses by 38% across 500GB+ test datasets.',
        'Benchmarked throughput at 14,000 requests/sec with sub-10ms response times under simulated peak concurrency.'
      ]
    },
    {
      id: 'proj-2',
      name: 'DevPulse AI Code Reviewer',
      technologies: 'React, TypeScript, Gemini API, Express, PostgreSQL',
      link: 'devpulse.io',
      description: 'Developer productivity tool that scans Git PRs for syntax, security vulnerabilities, and code smell.',
      bulletPoints: [
        'Integrated automated AST parsing and LLM reasoning, accelerating PR triage velocity by 25% for 400+ active beta developers.'
      ]
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2024-03',
      expiryDate: '2027-03',
      credentialUrl: 'aws.amazon.com/verify/1092834'
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'The Linux Foundation',
      issueDate: '2023-09',
      expiryDate: '2026-09',
      credentialUrl: 'cncf.io/verify/8374291'
    }
  ],
  theme: DEFAULT_THEME_CONFIG,
  sections: DEFAULT_SECTIONS_CONFIG
};

export const PRODUCT_MANAGER_SAMPLE: ResumeData = {
  contact: {
    fullName: 'Elena Rostova',
    jobTitle: 'Principal Product Manager',
    email: 'elena.rostova@pmleaders.com',
    phone: '(555) 987-6543',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/elenarostova-pm',
    portfolio: 'elenarostova.co',
    github: ''
  },
  summary: 'Data-driven Principal Product Manager with 8+ years of experience leading cross-functional teams of 25+ engineers, designers, and data scientists. Generated $18M+ in net-new ARR by executing product discovery, B2B SaaS growth loops, and algorithmic recommendation features. Expert in product analytics, user research, and executive stakeholder alignment.',
  experiences: [
    {
      id: 'exp-pm-1',
      company: 'FinFlow SaaS Group',
      position: 'Principal Product Manager, Growth',
      location: 'New York, NY',
      startDate: '2022-04',
      endDate: '',
      current: true,
      bulletPoints: [
        'Spearheaded self-serve onboarding redesign that lifted free-to-paid conversion rate by 28%, generating $4.2M in annual recurring revenue (ARR).',
        'Managed $3.5M product R&D budget across 3 scrum squads, shipping 14 major feature milestones on-schedule.',
        'Conducted 60+ customer discovery interviews and analyzed Mixpanel event telemetry to prioritize 2024 product roadmap with 94% executive buy-in.',
        'Accelerated feature release velocity by 35% through standardized OKR tracking, PRD templates, and automated A/B testing frameworks.'
      ]
    },
    {
      id: 'exp-pm-2',
      company: 'OmniCommerce Inc.',
      position: 'Senior Product Manager',
      location: 'Boston, MA',
      startDate: '2019-02',
      endDate: '2022-03',
      current: false,
      bulletPoints: [
        'Launched real-time personalized checkout recommendation engine, increasing average order value (AOV) by 16.5% across 2M monthly shoppers.',
        'Collaborated with machine learning engineers to reduce checkout fraud by $1.8M while maintaining 99.2% customer approval rate.',
        'Negotiated strategic API integration partnerships with 4 top tier payment gateways (Stripe, Adyen, PayPal, Klarna).'
      ]
    }
  ],
  education: [
    {
      id: 'edu-pm-1',
      institution: 'Columbia University',
      degree: 'Master of Business Administration (MBA)',
      fieldOfStudy: 'Technology Management & Strategy',
      location: 'New York, NY',
      startDate: '2017-09',
      endDate: '2019-05',
      current: false,
      gpa: '3.90 / 4.0',
      coursework: 'Strategic Product Management, Quantitative Market Analysis, Venture Capital, Corporate Finance'
    },
    {
      id: 'edu-pm-2',
      institution: 'Boston University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Economics & Information Systems',
      location: 'Boston, MA',
      startDate: '2013-09',
      endDate: '2017-05',
      current: false,
      gpa: '3.80 / 4.0'
    }
  ],
  skillCategories: [
    {
      id: 'skill-pm-1',
      name: 'Product Strategy & Management',
      skills: ['Product Discovery', 'Roadmap Planning', 'GTM Strategy', 'User Research & Personas', 'Pricing & Packaging', 'PRD & Feature Specs']
    },
    {
      id: 'skill-pm-2',
      name: 'Data & Analytics',
      skills: ['SQL', 'Mixpanel', 'Amplitude', 'Google Analytics 4', 'Tableau', 'A/B Experimentation (Optimizely)']
    },
    {
      id: 'skill-pm-3',
      name: 'Tools & Agile Methodologies',
      skills: ['Jira / Confluence', 'Figma', 'Notion', 'Scrum / Kanban', 'User Story Mapping', 'Stakeholder Management']
    }
  ],
  projects: [
    {
      id: 'proj-pm-1',
      name: 'B2B Enterprise Migration Wizard',
      technologies: 'React, Figma, Segment, Mixpanel',
      link: 'finflow.com/enterprise-migration',
      description: 'Automated legacy financial data onboarding system designed for Fortune 500 migrations.',
      bulletPoints: [
        'Reduced enterprise time-to-first-value from 24 days down to 6 days, increasing customer retention by 22%.'
      ]
    }
  ],
  certifications: [
    {
      id: 'cert-pm-1',
      name: 'Pragmatic Certified Product Manager (PMC-III)',
      issuer: 'Pragmatic Institute',
      issueDate: '2022-01',
      credentialUrl: ''
    }
  ],
  theme: {
    ...DEFAULT_THEME_CONFIG,
    accentColor: '#0f766e', // Deep Teal
    secondaryColor: '#14b8a6'
  },
  sections: DEFAULT_SECTIONS_CONFIG
};

export const BLANK_RESUME_TEMPLATE: ResumeData = {
  contact: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    github: ''
  },
  summary: '',
  experiences: [
    {
      id: 'exp-blank-1',
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: true,
      bulletPoints: ['']
    }
  ],
  education: [
    {
      id: 'edu-blank-1',
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      coursework: ''
    }
  ],
  skillCategories: [
    {
      id: 'skill-blank-1',
      name: 'Technical Skills',
      skills: []
    }
  ],
  projects: [],
  certifications: [],
  theme: DEFAULT_THEME_CONFIG,
  sections: DEFAULT_SECTIONS_CONFIG
};

export const SAMPLE_RESUMES = {
  softwareEngineer: SOFTWARE_ENGINEER_SAMPLE,
  productManager: PRODUCT_MANAGER_SAMPLE,
  blank: BLANK_RESUME_TEMPLATE
};


