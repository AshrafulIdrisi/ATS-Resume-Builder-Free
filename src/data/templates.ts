import { ResumeTemplate, ResumeData } from '../types';
import { 
  DEFAULT_THEME_CONFIG, 
  DEFAULT_SECTIONS_CONFIG, 
  SOFTWARE_ENGINEER_SAMPLE, 
  PRODUCT_MANAGER_SAMPLE 
} from './sampleResumes';

// 1. Harvard Ivy Executive Template
export const HARVARD_IVY_TEMPLATE: ResumeTemplate = {
  id: 'harvard-ivy',
  name: 'Harvard Ivy Executive',
  category: 'Executive & Legal',
  description: 'Traditional serif typography with centered header and solid horizontal rules. Harvard Business School & Wall Street ATS benchmark.',
  badge: 'Ivy League Standard',
  targetRoles: ['Chief Technology Officer', 'Strategy Consultant', 'Managing Director', 'Corporate Attorney', 'Senior Executive'],
  features: ['Source Serif 4 Display', 'Deep Navy Accents', 'Centered Header Hierarchy', 'Solid Academic Dividers'],
  atsScore: 98,
  theme: {
    fontFamily: 'serif',
    accentColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
    spacing: 'normal',
    margin: 'normal',
    headerLayout: 'classic',
    dividerStyle: 'solid',
    fontSize: 'medium',
    sectionsOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']
  },
  sampleData: {
    ...SOFTWARE_ENGINEER_SAMPLE,
    contact: {
      fullName: 'William Harrison',
      jobTitle: 'Chief Technology Officer & VP of Engineering',
      email: 'w.harrison@executiveadvisors.com',
      phone: '(555) 432-8765',
      location: 'Boston, MA',
      linkedin: 'linkedin.com/in/williamharrison-cto',
      portfolio: 'williamharrison.io',
      github: 'github.com/wharrison-eng'
    },
    summary: 'Transformational Engineering Executive with 12+ years of experience leading multi-disciplinary engineering organizations of 85+ engineers across North America and Europe. Directed $28M annual engineering budget, orchestrated cloud modernization saving $4.2M annually, and accelerated feature velocity by 48%. Expert in high-throughput distributed systems, enterprise SaaS architecture, and organizational scaling.',
    experiences: [
      {
        id: 'exp-ivy-1',
        company: 'Vanguard Global Technologies',
        position: 'Vice President of Engineering',
        location: 'Boston, MA',
        startDate: '2021-03',
        endDate: '',
        current: true,
        bulletPoints: [
          'Orchestrated enterprise migration of 40+ monolithic applications to AWS microservices, slashing annual infrastructure costs by $3.8M and improving p99 availability to 99.995%.',
          'Expanded engineering organization from 28 to 85 engineers across 6 specialized squads while reducing annualized voluntary attrition to sub-4%.',
          'Instituted enterprise-wide Engineering Excellence metrics (DORA, lead time to changes), accelerating sprint release frequency from bi-weekly to daily deployments.',
          'Partnered with Chief Information Security Officer (CISO) to achieve SOC 2 Type II and ISO 27001 compliance across all customer-facing endpoints.'
        ]
      },
      {
        id: 'exp-ivy-2',
        company: 'Beacon Strategic Software',
        position: 'Director of Software Engineering',
        location: 'New York, NY',
        startDate: '2017-08',
        endDate: '2021-02',
        current: false,
        bulletPoints: [
          'Led core platform engineering team of 24 backend engineers, processing $2.4B in annual transaction volume with zero critical data loss incidents.',
          'Re-architected core messaging bus with Kafka and Go, boosting message ingestion throughput by 4.5x (from 40k to 180k msgs/sec).',
          'Managed $6.5M annual department vendor budget, negotiating contract consolidations that reduced software licensing overhead by 22%.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-ivy-1',
        institution: 'Massachusetts Institute of Technology (MIT)',
        degree: 'Master of Science (M.S.)',
        fieldOfStudy: 'Computer Science & Distributed Systems',
        location: 'Cambridge, MA',
        startDate: '2013-09',
        endDate: '2015-06',
        current: false,
        gpa: '3.92 / 4.0'
      },
      {
        id: 'edu-ivy-2',
        institution: 'Harvard University',
        degree: 'Bachelor of Arts (B.A.)',
        fieldOfStudy: 'Computer Science & Mathematics',
        location: 'Cambridge, MA',
        startDate: '2009-09',
        endDate: '2013-05',
        current: false,
        gpa: '3.88 / 4.0',
        honors: 'Magna Cum Laude, Phi Beta Kappa'
      }
    ],
    theme: {
      fontFamily: 'serif',
      accentColor: '#1e3a8a',
      secondaryColor: '#3b82f6',
      spacing: 'normal',
      margin: 'normal',
      headerLayout: 'classic',
      dividerStyle: 'solid',
      fontSize: 'medium',
      sectionsOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']
    },
    sections: DEFAULT_SECTIONS_CONFIG
  }
};

// 2. Silicon Valley Modern (Tech Single-Column)
export const SILICON_VALLEY_TEMPLATE: ResumeTemplate = {
  id: 'silicon-valley',
  name: 'Silicon Valley Modern',
  category: 'Tech & Engineering',
  description: 'Clean single-column layout engineered for FAANG/MAMAA and high-growth VC startups. Prominent technical keyword density and GitHub/Portfolio integration.',
  badge: 'FAANG / Top Tech Benchmark',
  targetRoles: ['Senior Software Engineer', 'Full Stack Developer', 'Cloud / DevOps Engineer', 'AI/ML Engineer'],
  features: ['Inter Clean Sans', 'Tech Indigo Palette', 'Modern Left-Aligned Header', 'Structured Skills Taxonomy'],
  atsScore: 99,
  theme: {
    fontFamily: 'sans',
    accentColor: '#4338ca',
    secondaryColor: '#6366f1',
    spacing: 'normal',
    margin: 'normal',
    headerLayout: 'modern',
    dividerStyle: 'solid',
    fontSize: 'medium',
    sectionsOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications']
  },
  sampleData: {
    ...SOFTWARE_ENGINEER_SAMPLE,
    theme: {
      fontFamily: 'sans',
      accentColor: '#4338ca',
      secondaryColor: '#6366f1',
      spacing: 'normal',
      margin: 'normal',
      headerLayout: 'modern',
      dividerStyle: 'solid',
      fontSize: 'medium',
      sectionsOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications']
    }
  }
};

// 3. Product & Growth Strategist Template
export const PRODUCT_STRATEGIST_TEMPLATE: ResumeTemplate = {
  id: 'product-strategist',
  name: 'Product & Growth Leader',
  category: 'Product & Management',
  description: 'Engineered for Product Managers, Directors, and Growth Leaders. Focuses on quantifiable ARR metrics, conversion loops, and cross-functional leadership.',
  badge: 'Growth & Product Benchmark',
  targetRoles: ['Principal Product Manager', 'Group Product Manager', 'Head of Growth', 'Director of Product'],
  features: ['Plus Jakarta Sans Display', 'Deep Emerald Teal Accent', 'Impact Metrics Alignment', 'Product Discovery Focus'],
  atsScore: 97,
  theme: {
    fontFamily: 'jakarta',
    accentColor: '#0f766e',
    secondaryColor: '#14b8a6',
    spacing: 'normal',
    margin: 'normal',
    headerLayout: 'modern',
    dividerStyle: 'solid',
    fontSize: 'medium',
    sectionsOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications']
  },
  sampleData: {
    ...PRODUCT_MANAGER_SAMPLE,
    theme: {
      fontFamily: 'jakarta',
      accentColor: '#0f766e',
      secondaryColor: '#14b8a6',
      spacing: 'normal',
      margin: 'normal',
      headerLayout: 'modern',
      dividerStyle: 'solid',
      fontSize: 'medium',
      sectionsOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications']
    }
  }
};

// 4. Wall Street & Quant Template
export const WALL_STREET_TEMPLATE: ResumeTemplate = {
  id: 'wall-street',
  name: 'Wall Street & Financial Analyst',
  category: 'Finance & Banking',
  description: 'Conservative, high-density format standard for Goldman Sachs, Morgan Stanley, private equity funds, and quantitative trading desks.',
  badge: 'Investment Banking Standard',
  targetRoles: ['Investment Banking Analyst', 'Private Equity Associate', 'Quantitative Trader', 'Financial Analyst'],
  features: ['Source Serif 4 Typography', 'Dark Charcoal Palette', 'Compact Header & Rule Lines', 'Financial Metrics Emphasis'],
  atsScore: 98,
  theme: {
    fontFamily: 'serif',
    accentColor: '#1f2937',
    secondaryColor: '#4b5563',
    spacing: 'compact',
    margin: 'normal',
    headerLayout: 'classic',
    dividerStyle: 'solid',
    fontSize: 'medium',
    sectionsOrder: ['education', 'experience', 'skills', 'certifications', 'projects', 'summary']
  },
  sampleData: {
    contact: {
      fullName: 'David K. Sterling',
      jobTitle: 'Senior Investment Banking & Quantitative Analyst',
      email: 'david.sterling@alumni.wharton.upenn.edu',
      phone: '(555) 345-9812',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/davidsterling-ib',
      portfolio: '',
      github: 'github.com/dsterling-quant'
    },
    summary: 'Quantitative Financial Analyst with 5+ years of experience in M&A deal execution, financial modeling (DCF, LBO, Merger models), and Python-driven algorithmic risk analysis. Built automated transaction valuation models for 14 completed enterprise transactions valued at $4.8B aggregate.',
    experiences: [
      {
        id: 'exp-fin-1',
        company: 'Morgan & Chase Capital Partners',
        position: 'Investment Banking Associate – Technology M&A',
        location: 'New York, NY',
        startDate: '2022-07',
        endDate: '',
        current: true,
        bulletPoints: [
          'Engineered comprehensive 3-statement dynamic financial models and LBO analysis for 6 tech acquisitions totaling $2.6B in deal value.',
          'Authored 45+ page confidential information memorandums (CIM) and management presentations resulting in competitive bid auctions with 18% valuation premium.',
          'Spearheaded buyer due diligence workstreams across legal, accounting, and tax advisors, ensuring closing timelines 2 weeks ahead of target.',
          'Built Python automated benchmarking script pulling real-time comps via S&P Capital IQ API, saving 12 analyst hours weekly.'
        ]
      },
      {
        id: 'exp-fin-2',
        company: 'Bridgewater Analytics Group',
        position: 'Quantitative Research Analyst',
        location: 'Greenwich, CT',
        startDate: '2020-06',
        endDate: '2022-06',
        current: false,
        bulletPoints: [
          'Backtested multi-factor equity statistical arbitrage strategies in Python and SQL across 15 years of tick data, achieving a simulated Sharpe Ratio of 2.14.',
          'Optimized real-time portfolio risk engine, reducing daily VaR calculation latency by 65% across $850M in assets under management (AUM).'
        ]
      }
    ],
    education: [
      {
        id: 'edu-fin-1',
        institution: 'Wharton School of the University of Pennsylvania',
        degree: 'Bachelor of Science in Economics',
        fieldOfStudy: 'Finance & Statistics',
        location: 'Philadelphia, PA',
        startDate: '2016-09',
        endDate: '2020-05',
        current: false,
        gpa: '3.94 / 4.0',
        honors: 'Summa Cum Laude, Beta Gamma Sigma Honor Society'
      }
    ],
    skillCategories: [
      {
        id: 'skill-fin-1',
        name: 'Financial & Valuation Modeling',
        skills: ['DCF Analysis', 'LBO Modeling', 'M&A Accretion / Dilution', 'Comps (Trading & Transaction)', 'Capital IQ', 'Bloomberg Terminal', 'FactSet']
      },
      {
        id: 'skill-fin-2',
        name: 'Technical & Quantitative Tools',
        skills: ['Python (Pandas, NumPy, Scikit-learn)', 'SQL (PostgreSQL)', 'VBA / Advanced Excel', 'R', 'Monte Carlo Simulation', 'Risk Modeling (VaR)']
      }
    ],
    projects: [
      {
        id: 'proj-fin-1',
        name: 'Algorithmic Portfolio Optimizer',
        technologies: 'Python, CVXPY, Yahoo Finance API',
        link: 'github.com/dsterling-quant/markowitz-optimizer',
        description: 'Mean-variance portfolio frontier calculator with Black-Litterman Bayesian shrinkage.',
        bulletPoints: [
          'Calculated optimal asset allocations across S&P 500 constituents with automated covariance shrinkage estimators.'
        ]
      }
    ],
    certifications: [
      {
        id: 'cert-fin-1',
        name: 'CFA Charterholder (Chartered Financial Analyst)',
        issuer: 'CFA Institute',
        issueDate: '2023-08',
        credentialUrl: 'cfainstitute.org'
      },
      {
        id: 'cert-fin-2',
        name: 'FINRA Series 7 & Series 63 Licensed',
        issuer: 'FINRA',
        issueDate: '2020-09',
        credentialUrl: ''
      }
    ],
    theme: {
      fontFamily: 'serif',
      accentColor: '#1f2937',
      secondaryColor: '#4b5563',
      spacing: 'compact',
      margin: 'normal',
      headerLayout: 'classic',
      dividerStyle: 'solid',
      fontSize: 'medium',
      sectionsOrder: ['education', 'experience', 'skills', 'certifications', 'projects', 'summary']
    },
    sections: DEFAULT_SECTIONS_CONFIG
  }
};

// 5. Clean Compact 1-Page Minimalist
export const CLEAN_COMPACT_TEMPLATE: ResumeTemplate = {
  id: 'clean-compact',
  name: 'Clean Compact 1-Page',
  category: 'Compact & Minimal',
  description: 'Designed specifically to fit comprehensive careers into a clean, scannable single-page. Maximum negative-space efficiency with 100% ATS readability.',
  badge: '1-Page Guaranteed',
  targetRoles: ['Software Engineer', 'Data Analyst', 'Marketing Specialist', 'Project Manager', 'Early Career to Mid-Level'],
  features: ['Ultra-Clean Sans', 'Midnight Slate Palette', 'Compact Line Spacing', 'Minimalist Header Alignment'],
  atsScore: 99,
  theme: {
    fontFamily: 'sans',
    accentColor: '#0f172a',
    secondaryColor: '#334155',
    spacing: 'compact',
    margin: 'narrow',
    headerLayout: 'minimal',
    dividerStyle: 'dashed',
    fontSize: 'small',
    sectionsOrder: ['summary', 'experience', 'skills', 'education', 'projects', 'certifications']
  },
  sampleData: {
    ...SOFTWARE_ENGINEER_SAMPLE,
    theme: {
      fontFamily: 'sans',
      accentColor: '#0f172a',
      secondaryColor: '#334155',
      spacing: 'compact',
      margin: 'narrow',
      headerLayout: 'minimal',
      dividerStyle: 'dashed',
      fontSize: 'small',
      sectionsOrder: ['summary', 'experience', 'skills', 'education', 'projects', 'certifications']
    }
  }
};

// 6. Cloud & Systems Architect (Monospace Accents)
export const CLOUD_ARCHITECT_TEMPLATE: ResumeTemplate = {
  id: 'cloud-architect',
  name: 'Cloud & Infrastructure Architect',
  category: 'Tech & Engineering',
  description: 'Engineered for Solutions Architects, SREs, and DevOps leads. Features technical monospaced details, clear architecture taxonomy, and cloud certifications.',
  badge: 'Cloud & SRE Benchmark',
  targetRoles: ['Principal Cloud Architect', 'Lead DevOps / SRE', 'Platform Engineer', 'Cybersecurity Engineer'],
  features: ['JetBrains Mono Accents', 'Cobalt Royal Blue', 'Modern Technical Structure', 'Prominent Cloud Certifications'],
  atsScore: 98,
  theme: {
    fontFamily: 'mono',
    accentColor: '#1d4ed8',
    secondaryColor: '#3b82f6',
    spacing: 'normal',
    margin: 'normal',
    headerLayout: 'modern',
    dividerStyle: 'solid',
    fontSize: 'medium',
    sectionsOrder: ['summary', 'skills', 'experience', 'certifications', 'projects', 'education']
  },
  sampleData: {
    ...SOFTWARE_ENGINEER_SAMPLE,
    contact: {
      fullName: 'Marcus Vance',
      jobTitle: 'Principal Cloud & Infrastructure Architect',
      email: 'm.vance@cloudsystems.net',
      phone: '(555) 789-0123',
      location: 'Seattle, WA',
      linkedin: 'linkedin.com/in/marcusvance-cloud',
      portfolio: 'marcusvance.tech',
      github: 'github.com/mvance-infra'
    },
    summary: 'Solutions Architect with 9+ years of experience designing multi-region AWS and GCP cloud architectures, Kubernetes clusters, and automated Terraform infrastructure as code (IaC). Slashed enterprise cloud expenditures by $1.8M while maintaining 99.999% platform availability across 8 global regions.',
    experiences: [
      {
        id: 'exp-arch-1',
        company: 'Apex Cloud Systems Corp.',
        position: 'Principal Solutions Architect',
        location: 'Seattle, WA',
        startDate: '2022-01',
        endDate: '',
        current: true,
        bulletPoints: [
          'Architected multi-region active-active Kubernetes clusters across AWS us-east-1 and eu-west-1, handling 450M monthly API invocations with automated failover in <15 seconds.',
          'Authored modular Terraform and OpenTofu infrastructure modules managing 600+ cloud instances, reducing environment provisioning time from 4 days to 12 minutes.',
          'Instituted FinOps cloud cost governance, rightsizing compute resources and implementing Spot instances to achieve $1.4M in annualized AWS savings.',
          'Integrated zero-trust security mesh (Istio, HashiCorp Vault) enforcing mTLS encryption across 180+ microservices.'
        ]
      }
    ],
    theme: {
      fontFamily: 'mono',
      accentColor: '#1d4ed8',
      secondaryColor: '#3b82f6',
      spacing: 'normal',
      margin: 'normal',
      headerLayout: 'modern',
      dividerStyle: 'solid',
      fontSize: 'medium',
      sectionsOrder: ['summary', 'skills', 'experience', 'certifications', 'projects', 'education']
    }
  }
};

// 7. Healthcare & Clinical Sciences Template
export const HEALTHCARE_TEMPLATE: ResumeTemplate = {
  id: 'healthcare-sciences',
  name: 'Healthcare & Clinical Director',
  category: 'Healthcare & Science',
  description: 'Designed for Medical Directors, Healthcare Administrators, Clinical Researchers, and Biomedical Engineers. Clean, formal layout with medical licensing emphasis.',
  badge: 'Clinical & Healthcare Standard',
  targetRoles: ['Medical Director', 'Clinical Research Manager', 'Biomedical Engineer', 'Healthcare Operations Lead'],
  features: ['Roboto Clean Typography', 'Emerald Forest Palette', 'Formal Regulatory Sectioning', 'Licensing & Publications Focus'],
  atsScore: 97,
  theme: {
    fontFamily: 'roboto',
    accentColor: '#065f46',
    secondaryColor: '#059669',
    spacing: 'normal',
    margin: 'normal',
    headerLayout: 'classic',
    dividerStyle: 'solid',
    fontSize: 'medium',
    sectionsOrder: ['summary', 'experience', 'education', 'certifications', 'skills', 'projects']
  },
  sampleData: {
    contact: {
      fullName: 'Dr. Sarah Jenkins, MD, MPH',
      jobTitle: 'Clinical Operations Director & Medical Specialist',
      email: 'dr.sjenkins@healthpartners.org',
      phone: '(555) 678-1234',
      location: 'Chicago, IL',
      linkedin: 'linkedin.com/in/drsarahjenkins',
      portfolio: '',
      github: ''
    },
    summary: 'Board-certified Physician Executive with 10+ years of clinical practice and health systems leadership experience. Directed hospital clinical operations across a 450-bed tertiary care center, spearheading electronic health record (Epic EHR) modernization that improved clinical documentation compliance by 34% and reduced patient discharge delays by 2.2 hours.',
    experiences: [
      {
        id: 'exp-health-1',
        company: 'Midwest Medical Health Center',
        position: 'Director of Clinical Operations',
        location: 'Chicago, IL',
        startDate: '2020-04',
        endDate: '',
        current: true,
        bulletPoints: [
          'Directed clinical workflow operations across 14 inpatient departments with 180+ clinical staff, maintaining 99.4% Joint Commission accreditation standards.',
          'Spearheaded hospital-wide telemedicine expansion during emergency surge, scaling virtual consult capacity to 35,000+ patient visits annually with 96% satisfaction.',
          'Reduced 30-day hospital readmission rates by 18% by standardizing multidisciplinary discharge protocols and automated post-care follow-up.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-health-1',
        institution: 'Northwestern University Feinberg School of Medicine',
        degree: 'Doctor of Medicine (M.D.)',
        fieldOfStudy: 'Internal Medicine',
        location: 'Chicago, IL',
        startDate: '2012-08',
        endDate: '2016-05',
        current: false
      },
      {
        id: 'edu-health-2',
        institution: 'Johns Hopkins Bloomberg School of Public Health',
        degree: 'Master of Public Health (M.P.H.)',
        fieldOfStudy: 'Health Policy & Management',
        location: 'Baltimore, MD',
        startDate: '2016-09',
        endDate: '2018-05',
        current: false
      }
    ],
    skillCategories: [
      {
        id: 'skill-health-1',
        name: 'Clinical Leadership & Administration',
        skills: ['Hospital Operations', 'Joint Commission Compliance', 'Epic EHR / Cerner', 'Quality Improvement (CQI)', 'Clinical Protocol Design', 'Patient Safety']
      },
      {
        id: 'skill-health-2',
        name: 'Public Health & Analytics',
        skills: ['Biostatistics (R, SAS)', 'Epidemiological Surveillance', 'Health Informatics', 'Population Health Management', 'Clinical Trial Oversight']
      }
    ],
    projects: [
      {
        id: 'proj-health-1',
        name: 'Inpatient Sepsis Early Detection Protocol',
        technologies: 'Epic EHR, Clinical AI Alert System',
        link: '',
        description: 'Quality improvement study integrating automated vital sign telemetry alerts into physician bedside workflow.',
        bulletPoints: [
          'Decreased time-to-antibiotic administration for septic patients from 84 minutes down to 31 minutes hospital-wide.'
        ]
      }
    ],
    certifications: [
      {
        id: 'cert-health-1',
        name: 'American Board of Internal Medicine (ABIM) Certified',
        issuer: 'ABIM',
        issueDate: '2019-08',
        expiryDate: '2029-08'
      },
      {
        id: 'cert-health-2',
        name: 'State of Illinois Medical License (Active)',
        issuer: 'Illinois Dept of Financial & Professional Regulation',
        issueDate: '2016-06'
      }
    ],
    theme: {
      fontFamily: 'roboto',
      accentColor: '#065f46',
      secondaryColor: '#059669',
      spacing: 'normal',
      margin: 'normal',
      headerLayout: 'classic',
      dividerStyle: 'solid',
      fontSize: 'medium',
      sectionsOrder: ['summary', 'experience', 'education', 'certifications', 'skills', 'projects']
    },
    sections: DEFAULT_SECTIONS_CONFIG
  }
};

// 8. Corporate Operations & Chief of Staff (Burgundy Classic)
export const OPERATIONS_LEADER_TEMPLATE: ResumeTemplate = {
  id: 'operations-leader',
  name: 'Operations Leader & Chief of Staff',
  category: 'Executive & Legal',
  description: 'Distinguished, authoritative layout designed for Chiefs of Staff, VP Operations, HR Leaders, and Legal Directors. Elegant Roman display typography with high-contrast rules.',
  badge: 'Corporate Executive Standard',
  targetRoles: ['Chief of Staff', 'VP of Business Operations', 'Director of People / HR', 'Legal Operations Director'],
  features: ['Cinzel Display / Inter Body', 'Burgundy Wine Accent', 'Structured Operational Matrix', 'Executive Strategic Focus'],
  atsScore: 98,
  theme: {
    fontFamily: 'cinzel',
    accentColor: '#881337',
    secondaryColor: '#be123c',
    spacing: 'normal',
    margin: 'normal',
    headerLayout: 'classic',
    dividerStyle: 'solid',
    fontSize: 'medium',
    sectionsOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects']
  },
  sampleData: {
    contact: {
      fullName: 'Victoria Montgomery',
      jobTitle: 'Chief of Staff & VP of Business Operations',
      email: 'v.montgomery@enterprise-ops.com',
      phone: '(555) 890-2345',
      location: 'Washington, DC',
      linkedin: 'linkedin.com/in/victoriamontgomery-ops',
      portfolio: '',
      github: ''
    },
    summary: 'Strategic Chief of Staff with 10+ years of experience partnering directly with CEOs and Executive Boards to drive organizational transformation, operational efficiency, and global business expansion. Managed cross-functional operational programs across 1,200+ employees, executed $45M restructuring initiatives, and improved operational margins by 6.8 percentage points.',
    experiences: [
      {
        id: 'exp-ops-1',
        company: 'Apex Global Enterprises',
        position: 'Chief of Staff to the Chief Executive Officer',
        location: 'Washington, DC',
        startDate: '2021-05',
        endDate: '',
        current: true,
        bulletPoints: [
          'Partnered with CEO and C-suite executives to define 3-year strategic growth OKRs across 8 global business units, driving 24% year-over-year revenue expansion.',
          'Led enterprise operational restructuring across 1,200 employees, eliminating cross-department redundancies and saving $8.4M in annual SG&A overhead.',
          'Chaired weekly Executive Committee cadence, standardizing executive dashboards and board reporting packages for quarterly Board of Directors meetings.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-ops-1',
        institution: 'Georgetown University',
        degree: 'Master of Public Policy (M.P.P.)',
        fieldOfStudy: 'International Business & Organizational Strategy',
        location: 'Washington, DC',
        startDate: '2014-09',
        endDate: '2016-05',
        current: false
      }
    ],
    skillCategories: [
      {
        id: 'skill-ops-1',
        name: 'Executive Leadership & Strategy',
        skills: ['Executive Cadence', 'Board Relations', 'Strategic Planning & OKRs', 'Cross-Functional Governance', 'Change Management', 'M&A Integration']
      },
      {
        id: 'skill-ops-2',
        name: 'Operations & Process Optimization',
        skills: ['Financial P&L Oversight', 'Vendor Negotiations', 'Process Automation', 'Risk Management', 'HR & People Operations', 'Enterprise KPI Telemetry']
      }
    ],
    projects: [
      {
        id: 'proj-ops-1',
        name: 'Enterprise ERP Modernization Program',
        technologies: 'Workday, Salesforce, Tableau',
        link: '',
        description: '18-month multi-million dollar digital business transformation initiative across 6 global offices.',
        bulletPoints: [
          'Unified financial, procurement, and HR workflows under a single cloud platform, cutting month-end financial close duration by 4 days.'
        ]
      }
    ],
    certifications: [
      {
        id: 'cert-ops-1',
        name: 'Project Management Professional (PMP)',
        issuer: 'Project Management Institute (PMI)',
        issueDate: '2018-04'
      },
      {
        id: 'cert-ops-2',
        name: 'Lean Six Sigma Black Belt',
        issuer: 'ASQ',
        issueDate: '2019-11'
      }
    ],
    theme: {
      fontFamily: 'cinzel',
      accentColor: '#881337',
      secondaryColor: '#be123c',
      spacing: 'normal',
      margin: 'normal',
      headerLayout: 'classic',
      dividerStyle: 'solid',
      fontSize: 'medium',
      sectionsOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects']
    },
    sections: DEFAULT_SECTIONS_CONFIG
  }
};

// All 8 Templates Library Export
export const RESUME_TEMPLATES_LIBRARY: ResumeTemplate[] = [
  HARVARD_IVY_TEMPLATE,
  SILICON_VALLEY_TEMPLATE,
  PRODUCT_STRATEGIST_TEMPLATE,
  WALL_STREET_TEMPLATE,
  CLEAN_COMPACT_TEMPLATE,
  CLOUD_ARCHITECT_TEMPLATE,
  HEALTHCARE_TEMPLATE,
  OPERATIONS_LEADER_TEMPLATE
];

export const TEMPLATE_CATEGORIES: ('All' | ResumeTemplate['category'])[] = [
  'All',
  'Tech & Engineering',
  'Product & Management',
  'Finance & Banking',
  'Executive & Legal',
  'Compact & Minimal',
  'Healthcare & Science'
];
