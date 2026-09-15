import { ResumeData } from '../types';

export function generatePlainTextResume(resume: ResumeData): string {
  const lines: string[] = [];

  // 1. Header
  lines.push(resume.contact.fullName.toUpperCase());
  if (resume.contact.jobTitle) {
    lines.push(resume.contact.jobTitle);
  }
  
  const contactLinks: string[] = [];
  if (resume.contact.email) contactLinks.push(`Email: ${resume.contact.email}`);
  if (resume.contact.phone) contactLinks.push(`Phone: ${resume.contact.phone}`);
  if (resume.contact.location) contactLinks.push(`Location: ${resume.contact.location}`);
  if (resume.contact.linkedin) contactLinks.push(`LinkedIn: ${resume.contact.linkedin}`);
  if (resume.contact.portfolio) contactLinks.push(`Portfolio: ${resume.contact.portfolio}`);
  if (resume.contact.github) contactLinks.push(`GitHub: ${resume.contact.github}`);

  if (contactLinks.length > 0) {
    lines.push(contactLinks.join(' | '));
  }
  lines.push('');
  lines.push('================================================================================');
  lines.push('');

  // 2. Sections based on theme.sectionsOrder or default order
  const order = resume.theme?.sectionsOrder || ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'];

  order.forEach(sectionId => {
    const secConfig = resume.sections?.find(s => s.id === sectionId);
    if (secConfig && !secConfig.visible) return;

    if (sectionId === 'summary' && resume.summary.trim()) {
      lines.push('PROFESSIONAL SUMMARY');
      lines.push('--------------------------------------------------------------------------------');
      lines.push(resume.summary.trim());
      lines.push('');
    }

    if (sectionId === 'experience' && resume.experiences.length > 0) {
      lines.push('WORK EXPERIENCE');
      lines.push('--------------------------------------------------------------------------------');
      resume.experiences.forEach((exp, idx) => {
        const dates = `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`;
        lines.push(`${exp.position} | ${exp.company} | ${exp.location || ''} (${dates})`);
        exp.bulletPoints.forEach(b => {
          if (b.trim()) {
            lines.push(`• ${b.trim()}`);
          }
        });
        if (idx < resume.experiences.length - 1) lines.push('');
      });
      lines.push('');
    }

    if (sectionId === 'skills' && resume.skillCategories.length > 0) {
      lines.push('SKILLS & COMPETENCIES');
      lines.push('--------------------------------------------------------------------------------');
      resume.skillCategories.forEach(cat => {
        if (cat.skills.length > 0) {
          lines.push(`${cat.name}: ${cat.skills.join(', ')}`);
        }
      });
      lines.push('');
    }

    if (sectionId === 'education' && resume.education.length > 0) {
      lines.push('EDUCATION');
      lines.push('--------------------------------------------------------------------------------');
      resume.education.forEach((edu, idx) => {
        const dates = `${edu.startDate || ''} - ${edu.current ? 'Present' : edu.endDate || ''}`;
        lines.push(`${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${dates})`);
        if (edu.location) lines.push(`Location: ${edu.location}`);
        if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
        if (edu.coursework) lines.push(`Relevant Coursework: ${edu.coursework}`);
        if (edu.honors) lines.push(`Honors: ${edu.honors}`);
        if (idx < resume.education.length - 1) lines.push('');
      });
      lines.push('');
    }

    if (sectionId === 'projects' && resume.projects.length > 0) {
      lines.push('PROJECTS');
      lines.push('--------------------------------------------------------------------------------');
      resume.projects.forEach((proj, idx) => {
        const techStr = proj.technologies ? ` [Technologies: ${proj.technologies}]` : '';
        const linkStr = proj.link ? ` (URL: ${proj.link})` : '';
        lines.push(`${proj.name}${techStr}${linkStr}`);
        if (proj.description) lines.push(proj.description);
        proj.bulletPoints.forEach(b => {
          if (b.trim()) lines.push(`• ${b.trim()}`);
        });
        if (idx < resume.projects.length - 1) lines.push('');
      });
      lines.push('');
    }

    if (sectionId === 'certifications' && resume.certifications.length > 0) {
      lines.push('CERTIFICATIONS');
      lines.push('--------------------------------------------------------------------------------');
      resume.certifications.forEach(cert => {
        const dateStr = cert.issueDate ? ` (${cert.issueDate})` : '';
        const credStr = cert.credentialUrl ? ` [URL: ${cert.credentialUrl}]` : '';
        lines.push(`• ${cert.name} - ${cert.issuer}${dateStr}${credStr}`);
      });
      lines.push('');
    }
  });

  return lines.join('\n');
}

export function downloadTxtResume(resume: ResumeData, filename: string = 'Resume.txt'): void {
  const text = generatePlainTextResume(resume);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

