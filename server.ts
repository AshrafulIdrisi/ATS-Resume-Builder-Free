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

    const ai = getGeminiClient();
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    const parsed = JSON.parse(response.text || '{}');
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
    const ai = getGeminiClient();

    const skillsFlat = (skillCategories || [])
      .map((c: any) => `${c.name}: ${(c.skills || []).join(', ')}`)
      .join('\n');

    const expFlat = (experiences || [])
      .map((e: any) => `${e.position} at ${e.company}: ${(e.bulletPoints || []).join(' ')}`)
      .join('\n');

    const prompt = `You are a Fortune 500 Career Coach and ATS Expert.
Generate 3 distinct, high-converting, ATS-friendly Professional Summary options (3-4 concise lines each, 45-75 words).

Candidate Profile:
- Name: ${contact?.fullName || 'Candidate'}
- Target Role: ${targetRole || contact?.jobTitle || 'Industry Professional'}
- Tone: ${tone || 'High Impact & Executive'}
- Top Skills:\n${skillsFlat}
- Recent Experience:\n${expFlat}

Requirements:
- Each summary must open with a strong professional identity and years of experience/core domain.
- Weave in high-priority industry keywords naturally for ATS parsers.
- Highlight quantifiable achievements and value delivered.
- No fluff or empty buzzwords ("go-getter", "hard worker"). Keep it sharp and executive.

Return strictly JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      error: 'Failed to generate professional summary.',
      details: error.message
    });
  }
});

// 3. AI Resume Document Parser (Converts raw parsed text from PDF/DOCX/TXT into structured ResumeData)
app.post('/api/parse-resume', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Resume raw text is required.' });
    }

    const ai = getGeminiClient();
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
5. Extract skills and group them into logical categories (e.g., Programming Languages, Frameworks & Libraries, Cloud & Tools, Soft Skills).
6. Extract key projects and certifications if present.

Return structured JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    const ai = getGeminiClient();
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Match job error:', error);
    res.status(500).json({
      error: 'Failed to analyze job description match.',
      details: error.message
    });
  }
});

// 5. Deep ATS Audit & Diagnostic
app.post('/api/ats-audit', async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are a Senior Recruiter & Head of Talent Acquisition.
Conduct a comprehensive ATS Diagnostic & Recruiter Scan on this resume data:

Resume Data:
${JSON.stringify(resume, null, 2)}
${jobDescription ? `\nTarget Job:\n${jobDescription}` : ''}

Evaluate:
1. Executive Impression & First 6-Second Recruiter Verdict.
2. Strengths (Top 3 compelling assets).
3. Critical ATS Red Flags / Weaknesses (e.g. vague bullets, missing metrics, formatting hazards).
4. Immediate Priority Action Items (Step-by-step to achieve a 95+ score).

Return structured JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
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
      currentBullet,
      allExperiences
    } = req.body;

    const ai = getGeminiClient();

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
2. Include 6-8 trending, in-demand industry keywords for 2025/2026 hiring standards (e.g., modern cloud architectures, modern AI/ML tooling, CI/CD, scalable distributed systems, product discovery methodologies).
3. If the user is currently typing a partial query ("${typingQuery || ''}"), prioritize completions and closely related skills matching that query.
4. Provide 4-6 standard ATS category suggestions that top candidates in this discipline use.
5. Do NOT include generic fluff words (e.g., "fast learner", "hard worker", "team player"). Focus on quantifiable hard skills, tools, libraries, certifications, and technical domains.

Return structured JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
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

      const parsed = JSON.parse(response.text || '{}');
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
1. Generate 10-14 high-impact past-tense power action verbs categorized by achievement type (Engineering, Leadership, Optimization, Architecture, Scale).
2. Generate 10-14 role-relevant technical keywords, tools, protocols, and industry standards that ATS parsers look for in this position.
3. Provide 4-6 measurable metric frameworks that demonstrate quantifiable impact (e.g. latency reductions, revenue ARR lift, cost reductions, throughput, user scaling, conversion lift).
4. Provide 3 high-converting bullet point templates using Google's XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]".

Return structured JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
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

      const parsed = JSON.parse(response.text || '{}');
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
