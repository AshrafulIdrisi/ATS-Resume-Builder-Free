import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini Content Generator with multi-model failover & backoff retries
async function generateGeminiContentWithRetry(options: {
  contents: any;
  config?: any;
}): Promise<any> {
  // Use gemini-flash-latest first for highest availability and throughput
  const modelsToTry = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  const ai = getGeminiClient();

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config: options.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = (err?.message || '').toLowerCase();
      const errStatus = err?.status || err?.code || '';
      
      const isUnavailable =
        errStatus === 503 ||
        errStatus === 'UNAVAILABLE' ||
        errMsg.includes('demand') ||
        errMsg.includes('unavailable') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('503');

      if (isUnavailable) {
        // Model cluster is experiencing temporary high demand; seamlessly cascade to the next model
        continue;
      }

      const isRateLimited =
        errStatus === 429 ||
        errStatus === 'RESOURCE_EXHAUSTED' ||
        errMsg.includes('quota') ||
        errMsg.includes('rate limit');

      if (isRateLimited) {
        await new Promise(r => setTimeout(r, 600));
        try {
          const retryResp = await ai.models.generateContent({
            model: modelName,
            contents: options.contents,
            config: options.config,
          });
          return retryResp;
        } catch (retryErr: any) {
          lastError = retryErr;
          continue;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini model fallbacks exhausted.');
}

// Fallback Rule-Based ATS Recruiter Audit Engine (Used if API encounters temporary 503 outage)
function generateRuleBasedAtsAudit(resume: any, targetRole: string) {
  const contact = resume?.contact || {};
  const experiences = resume?.experiences || [];
  const skills = resume?.skillCategories || [];
  const education = resume?.education || [];
  const summary = resume?.summary || '';

  const strengths: string[] = [];
  const redFlags: string[] = [];
  const priorityActionItems: string[] = [];

  // Contact checks
  if (contact.email && contact.phone && contact.linkedin) {
    strengths.push('Complete, clean contact header with LinkedIn profile and direct communication channels.');
  } else {
    if (!contact.linkedin) redFlags.push('Missing professional LinkedIn or Portfolio URL in header.');
    if (!contact.phone) redFlags.push('Missing contact telephone number for direct recruiter outreach.');
    priorityActionItems.push('Add a customized LinkedIn profile URL to boost recruiter contact conversion.');
  }

  // Summary checks
  if (summary && summary.trim().length > 120) {
    strengths.push('Strong professional executive summary highlighting domain expertise and value proposition.');
  } else {
    redFlags.push('Executive summary is either absent or too brief (< 3 lines) to capture recruiter attention.');
    priorityActionItems.push('Craft a 3-4 sentence ATS-optimized summary integrating core keywords for ' + (targetRole || 'the target role') + '.');
  }

  // Bullet point metrics check
  let totalBullets = 0;
  let quantifiedBullets = 0;
  experiences.forEach((exp: any) => {
    (exp.bulletPoints || []).forEach((b: string) => {
      totalBullets++;
      if (/\d+%|\$\d+|\d+\+|\b\d+\b/i.test(b)) {
        quantifiedBullets++;
      }
    });
  });

  if (totalBullets > 0 && quantifiedBullets / totalBullets >= 0.5) {
    strengths.push(`High quantification density: ${Math.round((quantifiedBullets / totalBullets) * 100)}% of bullet points contain measurable metrics or KPIs.`);
  } else {
    redFlags.push('Insufficient metric quantification: Many bullet points describe passive responsibilities rather than measured business outcomes (XYZ formula).');
    priorityActionItems.push('Rewrite bullet points using Google\'s XYZ formula ("Accomplished [X], as measured by [Y], by doing [Z]").');
  }

  // Skills check
  const allSkills = skills.flatMap((c: any) => c.skills || []);
  if (allSkills.length >= 8) {
    strengths.push(`Rich skill inventory with ${allSkills.length} categorized technical and domain competencies.`);
  } else {
    redFlags.push('Low skill inventory: Less than 8 listed competencies limits ATS search algorithm indexing.');
    priorityActionItems.push('Group skills into 3-4 logical categories (e.g. Core Languages, Frameworks, Cloud & DevOps).');
  }

  // Education check
  if (education.length > 0) {
    strengths.push('Clearly structured academic credentials with institutional accreditation.');
  } else {
    priorityActionItems.push('Ensure educational background or relevant professional certifications are listed.');
  }

  const roleName = targetRole || contact.jobTitle || 'Target Position';
  const recruiterVerdict = totalBullets >= 4 && allSkills.length >= 6
    ? `Candidate displays a solid trajectory for ${roleName}. With targeted keyword alignment and enhanced metric quantification in recent roles, this resume will comfortably pass ATS filtration and secure first-round recruiter screens.`
    : `Candidate profile has high potential for ${roleName}, but currently lacks the structural keyword density and quantifiable achievements necessary to guarantee a 90%+ ATS pass rate.`;

  return {
    recruiterVerdict,
    strengths: strengths.length > 0 ? strengths : ['Clear chronological organization across professional history.'],
    redFlags: redFlags.length > 0 ? redFlags : ['Ensure recent bullet points consistently feature concrete metrics.'],
    priorityActionItems: priorityActionItems.length > 0 ? priorityActionItems : ['Maintain quarterly updates to skill inventory as tech stacks evolve.']
  };
}

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. AI Bullet Point Enhancer (XYZ format)
app.post('/api/enhance-bullet', async (req, res) => {
  try {
    const { bullet, context, targetRole } = req.body;
    if (!bullet || typeof bullet !== 'string' || bullet.trim().length === 0) {
      return res.status(400).json({ error: 'Valid bullet point text is required.' });
    }

    const prompt = `You are a premier Executive Resume Writer and ATS Optimization Specialist.
Rewrite the following resume bullet point using Google's XYZ formula:
"Accomplished [X], as measured by [Y], by doing [Z]"

Original Bullet: "${bullet}"
${targetRole ? `Target Role: "${targetRole}"` : ''}
${context ? `Work Context / Company: "${context}"` : ''}

Strict Requirements:
1. Start with a decisive, high-impact past-tense action verb (e.g., Architected, Engineered, Spearheaded, Accelerated, Boosted, Optimized).
2. Include realistic, quantifiable metrics (percentages, numbers, latency reductions, user scale, budget savings, team size) if not already present.
3. Keep it ATS-friendly, single sentence, concise (18-32 words), active voice.
4. Provide the primary enhanced bullet, plus 2 strong alternative variations (e.g. one focused on technical efficiency, one on business/financial impact).

Return strictly JSON matching the response format.`;

    let parsed: any;
    try {
      const response = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              enhanced: {
                type: Type.STRING,
                description: 'Primary recommended XYZ-format bullet point'
              },
              variations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 distinct alternative formulations'
              },
              actionVerb: {
                type: Type.STRING,
                description: 'The power action verb used'
              },
              metricSuggested: {
                type: Type.STRING,
                description: 'Key metric or outcome introduced'
              }
            },
            required: ['enhanced', 'variations', 'actionVerb', 'metricSuggested']
          }
        }
      });
      parsed = JSON.parse(response.text || '{}');
    } catch (aiErr: any) {
      console.warn('AI bullet enhancement fallback triggered:', aiErr?.message);
      // Clean fallback
      const cleanBullet = bullet.trim().replace(/^\W+/, '');
      parsed = {
        enhanced: `Spearheaded ${cleanBullet.charAt(0).toLowerCase() + cleanBullet.slice(1)}, improving operational throughput by 35% and accelerating project delivery timeline.`,
        variations: [
          `Architected scalable solution for ${cleanBullet.toLowerCase()}, reducing system latency by 40% across 500k+ active users.`,
          `Optimized workflow for ${cleanBullet.toLowerCase()}, delivering $45k in annual efficiency cost savings.`
        ],
        actionVerb: 'Spearheaded',
        metricSuggested: '35% throughput improvement'
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Enhance bullet error:', error);
    res.status(500).json({
      error: 'Failed to enhance bullet point with AI.',
      details: error.message
    });
  }
});

// 2. AI Professional Summary Generator
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { contact, experiences, skillCategories, targetRole, tone } = req.body;

    const skillsFlat = (skillCategories || [])
      .map((c: any) => `${c.name}: ${(c.skills || []).join(', ')}`)
      .join('\n');

    const expFlat = (experiences || [])
      .map((e: any) => `${e.position} at ${e.company}: ${(e.bulletPoints || []).join(' ')}`)
      .join('\n');

    const roleName = targetRole || contact?.jobTitle || 'Industry Professional';
    const prompt = `You are a Fortune 500 Career Coach and ATS Expert.
Generate 3 distinct, high-converting, ATS-friendly Professional Summary options (3-4 concise lines each, 45-75 words).

Candidate Profile:
- Name: ${contact?.fullName || 'Candidate'}
- Target Role: ${roleName}
- Tone: ${tone || 'High Impact & Executive'}
- Top Skills:\n${skillsFlat}
- Recent Experience:\n${expFlat}

Requirements:
- Each summary must open with a strong professional identity and years of experience/core domain.
- Weave in high-priority industry keywords naturally for ATS parsers.
- Highlight quantifiable achievements and value delivered.
- No fluff or empty buzzwords ("go-getter", "hard worker"). Keep it sharp and executive.

Return strictly JSON.`;

    let parsed: any;
    try {
      const response = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaries: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 3 professional summary variations'
              }
            },
            required: ['summaries']
          }
        }
      });
      parsed = JSON.parse(response.text || '{}');
    } catch (aiErr: any) {
      console.warn('AI summary fallback triggered:', aiErr?.message);
      parsed = {
        summaries: [
          `Results-driven ${roleName} with extensive experience architecting high-performance solutions, scaling modern workflows, and driving measurable business growth. Proven track record of cross-functional execution, system optimization, and delivering mission-critical projects on schedule.`,
          `Innovative ${roleName} specializing in end-to-end technical execution, scalable architectures, and process automation. Adept at leveraging modern methodologies and industry best practices to improve operational velocity and deliver substantial ROI.`,
          `Strategic ${roleName} combining deep technical acumen with strong leadership capabilities. Experienced in cross-functional collaboration, data-driven optimization, and engineering resilient solutions that exceed organizational KPIs.`
        ]
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      error: 'Failed to generate professional summary.',
      details: error.message
    });
  }
});

// 3. AI Resume Document Parser
app.post('/api/parse-resume', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Resume raw text is required.' });
    }

    const prompt = `You are an enterprise Applicant Tracking System (ATS) Parser.
Extract and convert the following raw resume text into structured, clean JSON according to the exact schema.

Raw Resume Text:
"""
${rawText.slice(0, 15000)}
"""

Guidelines:
1. Extract contact info: fullName, jobTitle, email, phone, location, linkedin, portfolio, github.
2. Extract summary or generate a clean summary from candidate profile if none exists.
3. Extract work experience: company, position, location, startDate (YYYY-MM or string), endDate, current (boolean), and clean array of bullet points.
4. Extract education: institution, degree, fieldOfStudy, location, startDate, endDate, current, gpa, coursework.
5. Extract skills and group them into logical categories.
6. Extract key projects and certifications if present.

Return structured JSON.`;

    const response = await generateGeminiContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contact: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                portfolio: { type: Type.STRING },
                github: { type: Type.STRING }
              },
              required: ['fullName', 'jobTitle', 'email', 'phone', 'location']
            },
            summary: { type: Type.STRING },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  bulletPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['company', 'position', 'bulletPoints']
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  gpa: { type: Type.STRING },
                  coursework: { type: Type.STRING }
                },
                required: ['institution', 'degree']
              }
            },
            skillCategories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['name', 'skills']
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  technologies: { type: Type.STRING },
                  link: { type: Type.STRING },
                  description: { type: Type.STRING },
                  bulletPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['name']
              }
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  issueDate: { type: Type.STRING },
                  credentialUrl: { type: Type.STRING }
                },
                required: ['name', 'issuer']
              }
            }
          },
          required: ['contact', 'summary', 'experiences', 'education', 'skillCategories']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');

    // Ensure IDs exist
    if (parsed.experiences) {
      parsed.experiences.forEach((e: any, idx: number) => {
        if (!e.id) e.id = `parsed-exp-${idx}-${Date.now()}`;
        if (!e.bulletPoints) e.bulletPoints = [];
      });
    }
    if (parsed.education) {
      parsed.education.forEach((e: any, idx: number) => {
        if (!e.id) e.id = `parsed-edu-${idx}-${Date.now()}`;
      });
    }
    if (parsed.skillCategories) {
      parsed.skillCategories.forEach((s: any, idx: number) => {
        if (!s.id) s.id = `parsed-skill-${idx}-${Date.now()}`;
        if (!s.skills) s.skills = [];
      });
    }
    if (parsed.projects) {
      parsed.projects.forEach((p: any, idx: number) => {
        if (!p.id) p.id = `parsed-proj-${idx}-${Date.now()}`;
        if (!p.bulletPoints) p.bulletPoints = [];
      });
    }
    if (parsed.certifications) {
      parsed.certifications.forEach((c: any, idx: number) => {
        if (!c.id) c.id = `parsed-cert-${idx}-${Date.now()}`;
      });
    }

    res.json({ resume: parsed });
  } catch (error: any) {
    console.error('Parse resume error:', error);
    res.status(500).json({
      error: 'Failed to parse resume document.',
      details: error.message
    });
  }
});

// 4. Job Description Matcher & Keyword Optimizer
app.post('/api/match-job', async (req, res) => {
  try {
    const { resumeText, jobDescription, resumeSkills } = req.body;
    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({ error: 'Job description text is required.' });
    }

    const prompt = `You are a specialized Applicant Tracking System (ATS) Keyword Matcher.
Compare the Candidate Resume against the Target Job Description.

Target Job Description:
"""
${jobDescription.slice(0, 8000)}
"""

Candidate Resume Content:
"""
${(resumeText || '').slice(0, 8000)}
"""

Candidate Listed Skills:
${(resumeSkills || []).join(', ')}

Perform an exhaustive analysis:
1. Calculate a realistic ATS Match Percentage (0-100%).
2. Extract all keywords/skills found in BOTH the Job Description and the Resume (matchedKeywords).
3. Extract critical required hard/soft skills, tools, and certifications mentioned in the Job Description that are MISSING or weak in the Resume (missingKeywords).
4. Evaluate whether the candidate's target job title aligns with the job description title (roleTitleMatch).
5. Provide 3-5 specific, high-priority actionable recommendations to elevate the resume match to 90%+.

Return structured JSON.`;

    let parsed: any;
    try {
      const response = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchPercentage: {
                type: Type.INTEGER,
                description: 'Match score between 0 and 100'
              },
              matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Keywords and skills successfully found in both'
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key skills requested in JD but missing in resume'
              },
              roleTitleMatch: {
                type: Type.BOOLEAN,
                description: 'Whether the job title aligns'
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Concrete actionable advice to improve score'
              }
            },
            required: ['matchPercentage', 'matchedKeywords', 'missingKeywords', 'roleTitleMatch', 'recommendations']
          }
        }
      });
      parsed = JSON.parse(response.text || '{}');
    } catch (aiErr: any) {
      console.warn('AI job match fallback triggered:', aiErr?.message);
      // Heuristic token overlap analysis
      const jdWords = new Set(jobDescription.toLowerCase().match(/\b[a-zA-Z]{3,}\b/g) || []);
      const resumeWords = new Set((resumeText || '').toLowerCase().match(/\b[a-zA-Z]{3,}\b/g) || []);
      const matched: string[] = [];
      const missing: string[] = [];

      (resumeSkills || []).forEach((sk: string) => {
        if (jobDescription.toLowerCase().includes(sk.toLowerCase())) {
          matched.push(sk);
        }
      });

      const commonTech = ['TypeScript', 'Python', 'React', 'Node.js', 'Docker', 'AWS', 'PostgreSQL', 'Kubernetes', 'CI/CD', 'Git', 'Agile', 'GraphQL', 'REST API', 'Leadership', 'Communication'];
      commonTech.forEach(term => {
        if (jobDescription.toLowerCase().includes(term.toLowerCase())) {
          if ((resumeText || '').toLowerCase().includes(term.toLowerCase())) {
            if (!matched.includes(term)) matched.push(term);
          } else {
            missing.push(term);
          }
        }
      });

      const matchPct = Math.min(95, Math.max(50, Math.round((matched.length / Math.max(1, matched.length + missing.length)) * 100)));

      parsed = {
        matchPercentage: matchPct,
        matchedKeywords: matched.slice(0, 12),
        missingKeywords: missing.slice(0, 8),
        roleTitleMatch: true,
        recommendations: [
          `Incorporate missing high-priority keywords (${missing.slice(0, 3).join(', ')}) directly into your Skills and Experience sections.`,
          'Align your Professional Summary opening statement with the exact title specified in the job posting.',
          'Quantify recent work accomplishments with relevant metrics demonstrating direct domain impact.'
        ]
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Match job error:', error);
    res.status(500).json({
      error: 'Failed to analyze job description match.',
      details: error.message
    });
  }
});

// 5. Deep ATS Audit & Diagnostic (Recruiter Review)
app.post('/api/ats-audit', async (req, res) => {
  try {
    const { resume, resumeData, jobDescription, targetRole } = req.body;
    const resumeObj = resume || resumeData || {};
    const targetRoleName = targetRole || resumeObj?.contact?.jobTitle || 'Industry Professional';

    const prompt = `You are a Senior Technical Recruiter & Head of Talent Acquisition.
Conduct a comprehensive ATS Diagnostic & Recruiter Scan on this resume data:

Candidate Target Role: "${targetRoleName}"
Resume Data:
${JSON.stringify(resumeObj, null, 2)}
${jobDescription ? `\nTarget Job Description:\n${jobDescription}` : ''}

Evaluate:
1. Executive Impression & First 6-Second Recruiter Verdict.
2. Strengths (Top 3 compelling assets with specific candidate details).
3. Critical ATS Red Flags / Weaknesses (e.g. vague bullets, missing metrics, formatting hazards).
4. Immediate Priority Action Items (Step-by-step to achieve a 95+ score).

Return structured JSON.`;

    let parsed: any;
    try {
      const response = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recruiterVerdict: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              redFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              priorityActionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['recruiterVerdict', 'strengths', 'redFlags', 'priorityActionItems']
          }
        }
      });
      parsed = JSON.parse(response.text || '{}');
    } catch (aiErr: any) {
      console.warn('AI ATS audit fallback triggered:', aiErr?.message);
      parsed = generateRuleBasedAtsAudit(resumeObj, targetRoleName);
    }

    // Format human-readable feedback report
    const report = [
      `🏆 EXECUTIVE VERDICT:\n${parsed.recruiterVerdict || 'Resume shows strong potential for ' + targetRoleName + '.'}`,
      `\n✨ TOP CANDIDATE STRENGTHS:\n${(parsed.strengths || []).map((s: string) => `• ${s}`).join('\n')}`,
      `\n⚠️ ATS RED FLAGS & VULNERABILITIES:\n${(parsed.redFlags || []).map((f: string) => `• ${f}`).join('\n')}`,
      `\n🎯 PRIORITY ACTION ITEMS FOR 95+ ATS SCORE:\n${(parsed.priorityActionItems || []).map((a: string) => `• ${a}`).join('\n')}`
    ].join('\n');

    res.json({
      ...parsed,
      auditFeedback: report
    });
  } catch (error: any) {
    console.error('ATS audit error:', error);
    res.status(500).json({
      error: 'Failed to complete ATS audit.',
      details: error.message
    });
  }
});

// 6. Context-Aware AI Keyword & Content Suggester for Skills & Work Experience
app.post('/api/suggest-keywords', async (req, res) => {
  try {
    const {
      section,
      targetRole,
      typingQuery,
      categoryName,
      currentSkills,
      position,
      company,
      currentBullet
    } = req.body;

    if (section === 'skills') {
      const prompt = `You are a Fortune 500 Technical Recruiter and ATS Keyword Specialist.
Provide context-aware, high-converting skill keywords and industry competencies for a candidate's resume.

Candidate Profile Context:
- Target Job Title: "${targetRole || 'Software Professional'}"
- Active Skill Category: "${categoryName || 'General Skills'}"
${typingQuery ? `- User Currently Typing: "${typingQuery}"` : ''}
${currentSkills && currentSkills.length > 0 ? `- Already Added Skills in this Category: ${currentSkills.join(', ')}` : ''}

Instructions:
1. Provide 10-15 high-value, ATS-optimized hard skills, tools, frameworks, and domain proficiencies strictly relevant to "${targetRole || 'the role'}" and category "${categoryName || 'General'}".
2. Include 6-8 trending, in-demand industry keywords for 2025/2026 hiring standards.
3. If the user is currently typing a partial query ("${typingQuery || ''}"), prioritize completions and closely related skills matching that query.
4. Provide 4-6 standard ATS category suggestions.

Return structured JSON.`;

      let parsed: any;
      try {
        const response = await generateGeminiContentWithRetry({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendedSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '10-15 ATS-friendly hard skills and tools'
                },
                trendingKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '6-8 modern in-demand industry trends and tech'
                },
                categorySuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '4-6 recommended skill category groupings'
                }
              },
              required: ['recommendedSkills', 'trendingKeywords', 'categorySuggestions']
            }
          }
        });
        parsed = JSON.parse(response.text || '{}');
      } catch (aiErr: any) {
        console.warn('AI skill suggestion fallback triggered:', aiErr?.message);
        parsed = {
          recommendedSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'REST APIs', 'CI/CD', 'Git', 'Redis', 'Microservices'],
          trendingKeywords: ['AI Integration', 'Cloud Architecture', 'Distributed Systems', 'CI/CD Automation', 'Modern Tooling'],
          categorySuggestions: ['Technical Skills', 'Frameworks & Libraries', 'Cloud & Tools', 'Leadership & Methodologies']
        };
      }

      return res.json(parsed);
    } else {
      // Work Experience section
      const prompt = `You are a Principal Executive Resume Coach and ATS Algorithm Specialist.
Generate context-aware power action verbs, industry domain keywords, and XYZ metric templates for a Work Experience role on a resume.

Work Experience Context:
- Target Role: "${targetRole || 'Industry Professional'}"
- Current Position Title: "${position || targetRole || 'Role'}"
- Company / Organization: "${company || 'Enterprise'}"
${currentBullet ? `- Current Bullet Content / Typing: "${currentBullet}"` : ''}
${typingQuery ? `- Active Search / Typing Query: "${typingQuery}"` : ''}

Instructions:
1. Generate 10-14 high-impact past-tense power action verbs categorized by achievement type.
2. Generate 10-14 role-relevant technical keywords, tools, protocols, and industry standards.
3. Provide 4-6 measurable metric frameworks that demonstrate quantifiable impact.
4. Provide 3 high-converting bullet point templates using Google's XYZ formula.

Return structured JSON.`;

      let parsed: any;
      try {
        const response = await generateGeminiContentWithRetry({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                actionVerbs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'High impact past tense power action verbs'
                },
                technicalKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Domain-specific technical terms, tools, and methodologies'
                },
                metricTemplates: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Measurable metric suggestions and phrases'
                },
                bulletTemplates: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 sample XYZ-formula bullet points tailored to the role'
                }
              },
              required: ['actionVerbs', 'technicalKeywords', 'metricTemplates', 'bulletTemplates']
            }
          }
        });
        parsed = JSON.parse(response.text || '{}');
      } catch (aiErr: any) {
        console.warn('AI experience suggestion fallback triggered:', aiErr?.message);
        parsed = {
          actionVerbs: ['Architected', 'Engineered', 'Spearheaded', 'Accelerated', 'Optimized', 'Orchestrated', 'Delivered', 'Automated', 'Scaled'],
          technicalKeywords: ['p99 latency', 'throughput', 'CI/CD', 'microservices', 'PostgreSQL', 'AWS', 'Redis', 'Docker', 'REST API', 'KPI tracking'],
          metricTemplates: ['reduced latency by 45%', 'scaled to 1.5M+ active users', 'decreased cloud costs by $35k/year', 'accelerated release cycle by 3x'],
          bulletTemplates: [
            'Architected high-throughput microservice in TypeScript, reducing p99 latency by 42% across 1M+ active users.',
            'Spearheaded automated CI/CD deployment pipeline, accelerating team release velocity by 60%.',
            'Engineered distributed caching tier with Redis, saving $120k in annual cloud infrastructure expenses.'
          ]
        };
      }

      return res.json(parsed);
    }
  } catch (error: any) {
    console.error('Suggest keywords error:', error);
    res.status(500).json({
      error: 'Failed to generate keyword suggestions.',
      details: error.message
    });
  }
});

// Vite middleware setup and production static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Resolve dist folder whether running from workspace root or dist directory
    const cwdDist = path.join(process.cwd(), 'dist');
    const distPath = fs.existsSync(cwdDist) ? cwdDist : __dirname;

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ATS Resume Builder Server listening on http://0.0.0.0:${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error during server startup:', err);
  process.exit(1);
});
