import { ResumeData, CloudResumeItem } from '../types';
import { SOFTWARE_ENGINEER_SAMPLE } from '../data/sampleResumes';

const STORAGE_KEY_ACTIVE_RESUME = 'ats_active_resume_data_v1';
const STORAGE_KEY_CLOUD_RESUMES = 'ats_cloud_resumes_collection_v1';
const STORAGE_KEY_FIREBASE_CONFIG = 'ats_firebase_cloud_config_v1';

export interface FirebaseSyncConfig {
  apiKey?: string;
  projectId?: string;
  databaseURL?: string;
  autoSync: boolean;
}

export function loadCurrentResume(): ResumeData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_RESUME);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load active resume from localStorage', e);
  }
  return SOFTWARE_ENGINEER_SAMPLE;
}

export function saveCurrentResume(resume: ResumeData): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_RESUME, JSON.stringify(resume));
  } catch (e) {
    console.error('Failed to save active resume to localStorage', e);
  }
}

export function getSavedCloudResumes(): CloudResumeItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CLOUD_RESUMES);
    if (saved) {
      const items: CloudResumeItem[] = JSON.parse(saved);
      return items;
    }
  } catch (e) {
    console.error('Failed to parse saved cloud resumes', e);
  }

  // Default seed list with the starter resume
  const initialList: CloudResumeItem[] = [
    {
      id: 'resume-starter-1',
      title: 'Alex Morgan - Senior Full Stack 2026',
      targetRole: 'Senior Full Stack Software Engineer',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      score: 94,
      data: SOFTWARE_ENGINEER_SAMPLE
    }
  ];
  saveAllCloudResumes(initialList);
  return initialList;
}

export function saveAllCloudResumes(items: CloudResumeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLOUD_RESUMES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cloud resumes to localStorage', e);
  }
}

export function saveResumeVersion(title: string, resume: ResumeData, score: number, id?: string): CloudResumeItem {
  const all = getSavedCloudResumes();
  const existingIdx = id ? all.findIndex(r => r.id === id) : -1;

  const updatedItem: CloudResumeItem = {
    id: id || `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title || resume.contact.jobTitle || 'Untitled Resume',
    targetRole: resume.contact.jobTitle || 'General Application',
    lastUpdated: new Date().toISOString(),
    createdAt: existingIdx >= 0 ? all[existingIdx].createdAt : new Date().toISOString(),
    score,
    data: JSON.parse(JSON.stringify(resume))
  };

  if (existingIdx >= 0) {
    all[existingIdx] = updatedItem;
  } else {
    all.unshift(updatedItem);
  }

  saveAllCloudResumes(all);
  return updatedItem;
}

export function deleteCloudResume(id: string): CloudResumeItem[] {
  const all = getSavedCloudResumes().filter(r => r.id !== id);
  saveAllCloudResumes(all);
  return all;
}

export function duplicateCloudResume(id: string): CloudResumeItem | null {
  const all = getSavedCloudResumes();
  const target = all.find(r => r.id === id);
  if (!target) return null;

  const copy: CloudResumeItem = {
    ...target,
    id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: `${target.title} (Copy)`,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(target.data))
  };

  all.unshift(copy);
  saveAllCloudResumes(all);
  return copy;
}

export function getFirebaseConfig(): FirebaseSyncConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to read firebase config', e);
  }
  return { autoSync: false };
}

export function saveFirebaseConfig(config: FirebaseSyncConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save firebase config', e);
  }
}

// Aliases
export const loadActiveResume = loadCurrentResume;
export const saveActiveResume = saveCurrentResume;
export const loadCloudResumes = getSavedCloudResumes;
export const saveCloudResumes = saveAllCloudResumes;
export const saveCloudResumeItem = (title: string, targetRole: string, resume: ResumeData, score: number, id?: string) => {
  const all = getSavedCloudResumes();
  const existingIdx = id ? all.findIndex(r => r.id === id) : -1;
  const updatedItem: CloudResumeItem = {
    id: id || `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title || resume.contact.jobTitle || 'Untitled Resume',
    targetRole: targetRole || resume.contact.jobTitle || 'General Application',
    lastUpdated: new Date().toISOString(),
    createdAt: existingIdx >= 0 ? all[existingIdx].createdAt : new Date().toISOString(),
    score,
    data: JSON.parse(JSON.stringify(resume))
  };
  if (existingIdx >= 0) {
    all[existingIdx] = updatedItem;
  } else {
    all.unshift(updatedItem);
  }
  saveAllCloudResumes(all);
  return updatedItem;
};
export const deleteCloudResumeItem = deleteCloudResume;
export const duplicateCloudResumeItem = duplicateCloudResume;

