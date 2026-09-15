import React, { useState } from 'react';
import { 
  Cloud, 
  X, 
  Trash2, 
  Copy, 
  Download, 
  FileText, 
  Check, 
  Settings, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { CloudResumeItem, ResumeData } from '../types';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  FirebaseSyncConfig 
} from '../utils/cloudStorage';

interface CloudResumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumes: CloudResumeItem[];
  activeResumeId?: string;
  onSelectResume: (resume: CloudResumeItem) => void;
  onSaveCurrentVersion: (title: string) => void;
  onDeleteResume: (id: string) => void;
  onDuplicateResume: (id: string) => void;
  currentResume: ResumeData;
  currentScore: number;
}

export function CloudResumesModal({
  isOpen,
  onClose,
  resumes,
  activeResumeId,
  onSelectResume,
  onSaveCurrentVersion,
  onDeleteResume,
  onDuplicateResume,
  currentResume,
  currentScore
}: CloudResumesModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'save' | 'firebase'>('list');
  const [newTitle, setNewTitle] = useState(currentResume.contact.jobTitle || 'Senior Full Stack 2026');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [fbConfig, setFbConfig] = useState<FirebaseSyncConfig>(getFirebaseConfig());

  if (!isOpen) return null;

  const handleSave = () => {
    if (!newTitle.trim()) return;
    onSaveCurrentVersion(newTitle.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab('list');
    }, 900);
  };

  const handleDownloadJson = (resumeItem: CloudResumeItem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeItem.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${resumeItem.title.replace(/[^a-z0-9]/gi, '_')}_resume.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveFirebaseConfig = () => {
    saveFirebaseConfig(fbConfig);
    alert('Cloud Sync configuration saved successfully.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cloud Resumes & Versions</h2>
              <p className="text-xs text-slate-500">Manage multiple tailored resumes, revisions, and cloud backups</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 px-4 pt-2 gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'list'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Resumes ({resumes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('save')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'save'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            + Save Current Version
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'firebase'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cloud DB Settings
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* 1. List Tab */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {resumes.map((item) => {
                const isCurrent = activeResumeId === item.id;
                const formattedDate = new Date(item.lastUpdated).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition flex flex-wrap items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                          {isCurrent && (
                            <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                              Active in Editor
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Role: {item.targetRole} • Updated: {formattedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        (item.score || 90) >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        (item.score || 80) >= 80 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Score {item.score || 90}
                      </span>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectResume(item);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                        >
                          Load
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDuplicateResume(item.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Duplicate Version"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadJson(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Export JSON Backup"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {resumes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteResume(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Version"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Save New Version Tab */}
          {activeTab === 'save' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">Snapshot Current Resume</h3>
                <p className="text-xs text-slate-600">
                  Save your active editor state with score {currentScore}/100 as a separate version (e.g. "Google - Software Engineer L5", "Fintech PM").
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Version Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack - AWS & Microservices"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!newTitle.trim()}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Saved to Cloud!</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" />
                        <span>Save Version</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Firebase & Cloud Sync Tab */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Cloud Database & Multi-Device Sync</span>
                </div>
                <p className="text-xs text-slate-600">
                  Resumes are persisted in local cloud storage by default. You can also configure a Firebase Firestore or Realtime Database project for seamless cross-device synchronization.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Firebase Project ID</label>
                    <input
                      type="text"
                      value={fbConfig.projectId || ''}
                      onChange={e => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                      placeholder="my-ats-resumes-prod"
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Database / Firestore URL</label>
                    <input
                      type="text"
                      value={fbConfig.databaseURL || ''}
                      onChange={e => setFbConfig({ ...fbConfig, databaseURL: e.target.value })}
                      placeholder="https://my-ats-resumes-default-rtdb.firebaseio.com"
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="auto-sync-cb"
                      checked={fbConfig.autoSync}
                      onChange={e => setFbConfig({ ...fbConfig, autoSync: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <label htmlFor="auto-sync-cb" className="text-xs text-slate-700 font-medium">
                      Enable real-time background sync on changes
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveFirebaseConfig}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
                  >
                    Save Cloud Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
