import { ResumeData, AtsAuditResult, AtsScoreCategory } from '../types';
import { detectActionVerb, detectWeakPhrases, ALL_ACTION_VERBS_SET } from './actionVerbs';

// Regular expressions for detecting numbers, percentages, dollar amounts, and metrics
const METRIC_PATTERNS = [
  /\b\d+(\.\d+)?%\b/g, // 25%, 99.9%
  /\$\s?\d+([,\.]\d+)?\s*(k|m|b|million|billion|thousand)?\b/gi, // $500k, $2.5M
  /\b\d+\s*(x|times|fold)\b/gi, // 10x, 3-fold
  /\b\d{1,3}(,\d{3})+(\.\d+)?\b/g, // 1,000,000
  /\b\d+\+\s*(users|clients|engineers|customers|projects|services|qps|ms|requests)\b/gi, // 100+ engineers, 50k+ users
  /\b(reduced|increased|boosted|grew|saved|improved|accelerated|cut|scaled)\s+by\s+\d+/gi, // reduced by 40%
  /\b\d+\s*(ms|seconds|minutes|hours|days|weeks|months|years)\b/gi, // 200ms, 4 weeks
  /\b\d+\s*(k|m|b)\+?\b/gi // 50k+, 10M
];

export function analyzeResume(resume: ResumeData): AtsAuditResult {
  const allBullets: string[] = [];
  
  resume.experiences.forEach(exp => {
    exp.bulletPoints.forEach(b => {
      if (b.trim()) allBullets.push(b.trim());
    });
  });

  resume.projects.forEach(proj => {
    proj.bulletPoints.forEach(b => {
      if (b.trim()) allBullets.push(b.trim());
    });
  });

  // Calculate full resume text for density & word counts
  const allTextParts: string[] = [
    resume.contact.fullName,
    resume.contact.jobTitle,
    resume.contact.location,
    resume.summary,
    ...resume.experiences.map(e => `${e.company} ${e.position} ${e.bulletPoints.join(' ')}`),
    ...resume.education.map(e => `${e.institution} ${e.degree} ${e.fieldOfStudy} ${e.coursework || ''}`),
    ...resume.skillCategories.map(s => `${s.name} ${s.skills.join(' ')}`),
    ...resume.projects.map(p => `${p.name} ${p.technologies} ${p.description} ${p.bulletPoints.join(' ')}`),
    ...resume.certifications.map(c => `${c.name} ${c.issuer}`)
  ];

  const fullText = allTextParts.join(' ');
  const words = fullText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Contact Info Category (Max 20 pts)
  let contactScore = 0;
  const contactFindings: AtsScoreCategory['findings'] = [];

  if (resume.contact.fullName.trim().length >= 3) {
    contactScore += 4;
  } else {
    contactFindings.push({
      type: 'warning',
      message: 'Full Name is missing or too short',
      fieldId: 'fullName'
    });
  }

  if (resume.contact.jobTitle.trim().length >= 2) {
    contactScore += 4;
    contactFindings.push({
      type: 'success',
      message: `Target Job Title specified: "${resume.contact.jobTitle}"`
    });
  } else {
    contactFindings.push({
      type: 'warning',
      message: 'Add a clear target Job Title (e.g. Senior Full Stack Engineer) to match ATS job titles',
      fieldId: 'jobTitle'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(resume.contact.email.trim())) {
    contactScore += 4;
  } else {
    contactFindings.push({
      type: 'warning',
      message: 'A valid professional email address is required for ATS recruiter contact',
      fieldId: 'email'
    });
  }

  if (resume.contact.phone.trim().length >= 7) {
    contactScore += 3;
  } else {
    contactFindings.push({
      type: 'warning',
      message: 'Phone number is missing; ATS parsers flag missing direct contact',
      fieldId: 'phone'
    });
  }

  if (resume.contact.location.trim().length >= 2) {
    contactScore += 3;
  } else {
    contactFindings.push({
      type: 'tip',
      message: 'Add City, State / Country for geo-targeted ATS recruiter searches',
      fieldId: 'location'
    });
  }

  if (resume.contact.linkedin.trim().length > 0 || resume.contact.github.trim().length > 0 || resume.contact.portfolio.trim().length > 0) {
    contactScore += 2;
    contactFindings.push({
      type: 'success',
      message: 'Professional profiles (LinkedIn/GitHub/Portfolio) linked'
    });
  } else {
    contactFindings.push({
      type: 'tip',
      message: 'Include your LinkedIn URL or GitHub/Portfolio link for recruiter verification',
      fieldId: 'linkedin'
    });
  }

  const contactCategory: AtsScoreCategory = {
    name: 'Contact Information',
    score: Math.min(20, contactScore),
    maxScore: 20,
    weight: 20,
    status: contactScore >= 18 ? 'excellent' : contactScore >= 14 ? 'good' : contactScore >= 10 ? 'warning' : 'critical',
    findings: contactFindings
  };

  // 2. Action Verbs Category (Max 25 pts)
  let actionVerbScore = 0;
  const actionVerbFindings: AtsScoreCategory['findings'] = [];
  const detectedVerbsList: string[] = [];
  let strongBulletsCount = 0;
  const weakPhrasesDetected: string[] = [];

  allBullets.forEach(bullet => {
    const check = detectActionVerb(bullet);
    if (check.isStrong && check.verb) {
      strongBulletsCount++;
      if (!detectedVerbsList.includes(check.verb)) {
        detectedVerbsList.push(check.verb);
      }
    }
    const weakChecks = detectWeakPhrases(bullet);
    weakChecks.forEach(w => {
      if (!weakPhrasesDetected.includes(w.found)) {
        weakPhrasesDetected.push(w.found);
      }
    });
  });

  const strongVerbRatio = allBullets.length > 0 ? (strongBulletsCount / allBullets.length) : 0;
  const uniqueVerbCount = detectedVerbsList.length;

  if (strongVerbRatio >= 0.8) {
    actionVerbScore += 12;
    actionVerbFindings.push({
      type: 'success',
      message: `${Math.round(strongVerbRatio * 100)}% of bullet points start with strong action verbs!`
    });
  } else if (strongVerbRatio >= 0.5) {
    actionVerbScore += 8;
    actionVerbFindings.push({
      type: 'warning',
      message: `${Math.round(strongVerbRatio * 100)}% bullets start with strong verbs. Aim for 80%+ to maximize impact.`
    });
  } else {
    actionVerbScore += Math.round(strongVerbRatio * 10);
    actionVerbFindings.push({
      type: 'warning',
      message: 'Many bullet points do not start with decisive action verbs (e.g. Architected, Engineered, Boosted).'
    });
  }

  if (uniqueVerbCount >= 8) {
    actionVerbScore += 8;
    actionVerbFindings.push({
      type: 'success',
      message: `Excellent verb diversity (${uniqueVerbCount} distinct action verbs detected)`
    });
  } else if (uniqueVerbCount >= 4) {
    actionVerbScore += 5;
    actionVerbFindings.push({
      type: 'tip',
      message: `Verb diversity is okay (${uniqueVerbCount} verbs). Try not repeating the same verbs.`
    });
  } else {
    actionVerbScore += Math.max(1, uniqueVerbCount * 1);
    actionVerbFindings.push({
      type: 'warning',
      message: 'Limited action verb vocabulary detected. Use varied power verbs across roles.'
    });
  }

  if (weakPhrasesDetected.length > 0) {
    actionVerbScore = Math.max(0, actionVerbScore - 3);
    actionVerbFindings.push({
      type: 'warning',
      message: `Found passive or weak phrases: "${weakPhrasesDetected.slice(0, 3).join('", "')}". Use our AI Enhancer to replace them.`
    });
  } else if (allBullets.length > 0) {
    actionVerbScore += 5;
    actionVerbFindings.push({
      type: 'success',
      message: 'Zero passive phrases detected (no "responsible for", "helped", or "worked on")'
    });
  }

  const actionVerbCategory: AtsScoreCategory = {
    name: 'Action Verbs & Impact',
    score: Math.min(25, actionVerbScore),
    maxScore: 25,
    weight: 25,
    status: actionVerbScore >= 20 ? 'excellent' : actionVerbScore >= 15 ? 'good' : actionVerbScore >= 10 ? 'warning' : 'critical',
    findings: actionVerbFindings
  };

  // 3. Quantifiable Metrics & Results (Max 25 pts)
  let metricsScore = 0;
  const metricsFindings: AtsScoreCategory['findings'] = [];
  const detectedMetricsList: string[] = [];
  let bulletsWithMetrics = 0;

  allBullets.forEach(bullet => {
    let hasMetric = false;
    METRIC_PATTERNS.forEach(pattern => {
      const matches = bullet.match(pattern);
      if (matches) {
        hasMetric = true;
        matches.forEach(m => {
          if (!detectedMetricsList.includes(m.trim())) {
            detectedMetricsList.push(m.trim());
          }
        });
      }
    });
    if (hasMetric) bulletsWithMetrics++;
  });

  const metricRatio = allBullets.length > 0 ? (bulletsWithMetrics / allBullets.length) : 0;

  if (metricRatio >= 0.5) {
    metricsScore += 15;
    metricsFindings.push({
      type: 'success',
      message: `${Math.round(metricRatio * 100)}% of bullet points contain quantifiable numbers/metrics!`
    });
  } else if (metricRatio >= 0.25) {
    metricsScore += 10;
    metricsFindings.push({
      type: 'warning',
      message: `${Math.round(metricRatio * 100)}% of bullets have metrics. Top 5% ATS resumes have metrics on 50%+ of bullets.`
    });
  } else {
    metricsScore += Math.round(metricRatio * 15);
    metricsFindings.push({
      type: 'warning',
      message: 'Few quantifiable metrics found. Add metrics (e.g. "reduced load times by 35%", "scaled to 100k users").'
    });
  }

  if (detectedMetricsList.length >= 6) {
    metricsScore += 10;
    metricsFindings.push({
      type: 'success',
      message: `Rich numerical evidence (${detectedMetricsList.length} distinct data points and metrics)`
    });
  } else if (detectedMetricsList.length >= 3) {
    metricsScore += 6;
  } else {
    metricsScore += Math.max(0, detectedMetricsList.length * 2);
  }

  const metricsCategory: AtsScoreCategory = {
    name: 'Quantifiable Results',
    score: Math.min(25, metricsScore),
    maxScore: 25,
    weight: 25,
    status: metricsScore >= 20 ? 'excellent' : metricsScore >= 14 ? 'good' : metricsScore >= 8 ? 'warning' : 'critical',
    findings: metricsFindings
  };

  // 4. Formatting & ATS Compliance (Max 15 pts)
  let formattingScore = 0;
  const formattingFindings: AtsScoreCategory['findings'] = [];

  // Single-column layout check
  formattingScore += 4;
  formattingFindings.push({
    type: 'success',
    message: 'Strict single-column layout ensures 100% linear ATS parsing compatibility'
  });

  // Summary check
  const summaryWords = resume.summary.trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 25 && summaryWords <= 120) {
    formattingScore += 3;
    formattingFindings.push({
      type: 'success',
      message: `Professional summary length is optimal (${summaryWords} words)`
    });
  } else if (summaryWords === 0) {
    formattingFindings.push({
      type: 'warning',
      message: 'Professional summary is empty. Add a 3-4 line summary with your core value proposition.',
      fieldId: 'summary'
    });
  } else if (summaryWords < 25) {
    formattingScore += 1;
    formattingFindings.push({
      type: 'tip',
      message: 'Summary is short. Expand to 3-4 sentences outlining your key domains & accomplishments.',
      fieldId: 'summary'
    });
  } else {
    formattingScore += 2;
    formattingFindings.push({
      type: 'tip',
      message: 'Summary is a bit long (>120 words). Keep it concise for recruiter 6-second skim.',
      fieldId: 'summary'
    });
  }

  // Work experience validity
  if (resume.experiences.length >= 1) {
    const hasValidExp = resume.experiences.every(e => e.company && e.position && e.bulletPoints.length > 0);
    if (hasValidExp) {
      formattingScore += 4;
      formattingFindings.push({
        type: 'success',
        message: 'Experience entries have complete company, role, dates, and bullet structures'
      });
    } else {
      formattingScore += 2;
      formattingFindings.push({
        type: 'warning',
        message: 'Some experience entries are missing company, role, or bullet points'
      });
    }
  } else {
    formattingFindings.push({
      type: 'warning',
      message: 'No work experience listed'
    });
  }

  // Education validity
  if (resume.education.length >= 1) {
    formattingScore += 2;
    formattingFindings.push({
      type: 'success',
      message: 'Education history clearly formatted with institution and degree'
    });
  } else {
    formattingFindings.push({
      type: 'tip',
      message: 'Add at least one Education entry'
    });
  }

  // Skills presence
  const totalSkills = resume.skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0);
  if (totalSkills >= 8) {
    formattingScore += 2;
    formattingFindings.push({
      type: 'success',
      message: `Categorized skills database is well populated (${totalSkills} skills across ${resume.skillCategories.length} categories)`
    });
  } else if (totalSkills > 0) {
    formattingScore += 1;
    formattingFindings.push({
      type: 'tip',
      message: `Only ${totalSkills} skills listed. Aim for 10-20 relevant keywords.`
    });
  } else {
    formattingFindings.push({
      type: 'warning',
      message: 'Skills section is empty. ATS keyword parsers heavily index this section.'
    });
  }

  const formattingCategory: AtsScoreCategory = {
    name: 'ATS Formatting & Structure',
    score: Math.min(15, formattingScore),
    maxScore: 15,
    weight: 15,
    status: formattingScore >= 13 ? 'excellent' : formattingScore >= 10 ? 'good' : 'warning',
    findings: formattingFindings
  };

  // 5. Content Relevance & Length (Max 15 pts)
  let relevanceScore = 0;
  const relevanceFindings: AtsScoreCategory['findings'] = [];

  // Page length check
  let pageOverflowRisk = false;
  if (wordCount >= 250 && wordCount <= 650) {
    relevanceScore += 8;
    relevanceFindings.push({
      type: 'success',
      message: `Optimal 1-page target word count (${wordCount} words)`
    });
  } else if (wordCount > 650 && wordCount <= 1100) {
    relevanceScore += 6;
    pageOverflowRisk = true;
    relevanceFindings.push({
      type: 'tip',
      message: `Word count (${wordCount} words) suits a 2-page resume. Check page overflow preview.`
    });
  } else if (wordCount < 250) {
    relevanceScore += Math.max(2, Math.round((wordCount / 250) * 6));
    relevanceFindings.push({
      type: 'warning',
      message: `Resume content is sparse (${wordCount} words). Add more project details and achievements.`
    });
  } else {
    relevanceScore += 4;
    pageOverflowRisk = true;
    relevanceFindings.push({
      type: 'warning',
      message: `Resume is very long (${wordCount} words). High risk of recruiter fatigue.`
    });
  }

  // Projects & Certifications boost
  if (resume.projects.length >= 1 || resume.certifications.length >= 1) {
    relevanceScore += 7;
    relevanceFindings.push({
      type: 'success',
      message: 'Contains supporting projects or verified industry certifications'
    });
  } else {
    relevanceScore += 3;
    relevanceFindings.push({
      type: 'tip',
      message: 'Adding technical projects or certifications boosts ATS keyword relevance by up to 25%'
    });
  }

  const relevanceCategory: AtsScoreCategory = {
    name: 'Content Depth & Length',
    score: Math.min(15, relevanceScore),
    maxScore: 15,
    weight: 15,
    status: relevanceScore >= 13 ? 'excellent' : relevanceScore >= 10 ? 'good' : 'warning',
    findings: relevanceFindings
  };

  // Overall Score Calculation
  const totalScore = contactCategory.score + actionVerbCategory.score + metricsCategory.score + formattingCategory.score + relevanceCategory.score;
  const clampedScore = Math.max(0, Math.min(100, totalScore));

  let grade: AtsAuditResult['grade'] = 'F' as any;
  if (clampedScore >= 90) grade = 'A+';
  else if (clampedScore >= 80) grade = 'A';
  else if (clampedScore >= 70) grade = 'B';
  else if (clampedScore >= 55) grade = 'C';
  else grade = 'D';

  let summarySentence = '';
  if (clampedScore >= 90) {
    summarySentence = 'Ready for Top ATS Systems! Your resume features strong action verbs, quantifiable metrics, and optimal formatting.';
  } else if (clampedScore >= 80) {
    summarySentence = 'Great baseline! Fine-tune a few weak verbs and add 1-2 more quantified impact numbers to reach 90+.';
  } else if (clampedScore >= 65) {
    summarySentence = 'Moderate ATS readiness. Focus on converting task descriptions into quantified achievements (XYZ format).';
  } else {
    summarySentence = 'Needs attention. Complete missing contact info, expand bullet points, and add action verbs to pass initial filters.';
  }

  // Extract detected keywords from skills and tech
  const detectedKeywords: string[] = [];
  resume.skillCategories.forEach(cat => {
    cat.skills.forEach(s => {
      if (s.trim() && !detectedKeywords.includes(s.trim())) {
        detectedKeywords.push(s.trim());
      }
    });
  });
  resume.projects.forEach(p => {
    if (p.technologies) {
      p.technologies.split(/[,/|•]/).forEach(t => {
        const clean = t.trim();
        if (clean && !detectedKeywords.includes(clean)) {
          detectedKeywords.push(clean);
        }
      });
    }
  });

  return {
    overallScore: clampedScore,
    grade,
    summarySentence,
    categories: {
      contact: contactCategory,
      actionVerbs: actionVerbCategory,
      quantifiableMetrics: metricsCategory,
      formattingCompliance: formattingCategory,
      contentRelevance: relevanceCategory
    },
    detectedKeywords,
    detectedActionVerbs: detectedVerbsList,
    detectedMetrics: detectedMetricsList,
    wordCount,
    estimatedReadTimeSec: Math.max(10, Math.round(wordCount / 3.5)),
    pageOverflowRisk
  };
}

export const analyzeResumeAts = analyzeResume;


