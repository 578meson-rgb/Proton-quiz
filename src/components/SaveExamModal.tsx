import React, { useState, useEffect } from 'react';
import { BookmarkCheck, X, Check, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { MCQQuestion, SubjectType, ExamSettings } from '../types';
import { saveExamSet, getSavedExamById } from '../utils/savedExamsStorage';

interface SaveExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: MCQQuestion[];
  subject: SubjectType;
  settings: ExamSettings;
  activeSavedId?: string | null;
  onSavedSuccess: (savedId: string, savedName: string) => void;
}

export const SaveExamModal: React.FC<SaveExamModalProps> = ({
  isOpen,
  onClose,
  questions,
  subject,
  settings,
  activeSavedId,
  onSavedSuccess,
}) => {
  const [examName, setExamName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [saveAsNew, setSaveAsNew] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      setSaveAsNew(false);

      if (activeSavedId) {
        const existing = getSavedExamById(activeSavedId);
        if (existing) {
          setExamName(existing.name);
          setDescription(existing.description || '');
          return;
        }
      }

      // Default suggested name
      const now = new Date();
      const dateStr = now.toLocaleDateString('bn-BD', {
        month: 'short',
        day: 'numeric',
      });
      const suggestedName = settings.title || `${subject} - কুইজ সেট (${dateStr})`;
      setExamName(suggestedName);
      setDescription('');
    }
  }, [isOpen, activeSavedId, settings.title, subject]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = examName.trim();
    if (!trimmed) {
      setError('দয়া করে কুইজ সেটের একটি নাম লিখুন।');
      return;
    }

    if (questions.length === 0) {
      setError('সংরক্ষণ করার মতো কোনো প্রশ্ন পাওয়া যায়নি।');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const targetId = activeSavedId && !saveAsNew ? activeSavedId : undefined;
      const saved = saveExamSet(
        {
          name: trimmed,
          subject,
          questions,
          settings: {
            ...settings,
            title: trimmed,
          },
          description: description.trim(),
        },
        targetId
      );

      setSuccessMsg('কুইজ সেটটি সফলভাবে সংরক্ষণ করা হয়েছে!');
      setTimeout(() => {
        setIsSaving(false);
        onSavedSuccess(saved.id, saved.name);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsSaving(false);
      setError(err?.message || 'সংরক্ষণে সমস্যা দেখা দিয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-bengali">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {activeSavedId && !saveAsNew ? 'কুইজ সেট আপডেট করুন' : 'কুইজ সেট সংরক্ষণ করুন'}
              </h3>
              <p className="text-xs text-emerald-100">
                ভবিষ্যতে পুনরায় পরীক্ষা দিতে কুইজটি সেভ করে রাখুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Quick Info Pill */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">বিষয়:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                {subject}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-600">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{questions.length} টি প্রশ্ন সংরক্ষিত হবে</span>
            </div>
          </div>

          {/* Quiz Name Input */}
          <div>
            <label htmlFor="quiz-name-input" className="block text-sm font-bold text-slate-800 mb-1.5">
              কুইজের নাম দিন <span className="text-rose-500">*</span>
            </label>
            <input
              id="quiz-name-input"
              type="text"
              value={examName}
              onChange={(e) => {
                setExamName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="যেমন: পদার্থবিজ্ঞান ১ম পত্র - গতিবিদ্যা মডেল টেস্ট"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 text-sm font-medium transition-all"
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1">
              একটি পরিচিত নাম দিন যাতে পরবর্তীতে সহজে খুঁজে পান।
            </p>
          </div>

          {/* Description/Notes Input */}
          <div>
            <label htmlFor="quiz-desc-input" className="block text-sm font-semibold text-slate-700 mb-1">
              বিবরণ বা ট্যাগ (ঐচ্ছিক)
            </label>
            <input
              id="quiz-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="যেমন: ঢাকা বোর্ড ২০২৩ ও বুয়েট ভর্তি পরীক্ষা"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 text-xs transition-all"
            />
          </div>

          {/* If already saved previously, option to save as new or overwrite */}
          {activeSavedId && (
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={saveAsNew}
                  onChange={(e) => setSaveAsNew(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-400 w-4 h-4"
                />
                <span>আগের সেটটি প্রতিস্থাপন না করে নতুন কুইজ সেট হিসেবে সংরক্ষণ করুন</span>
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            বাতিল
          </button>

          <button
            type="button"
            id="btn-confirm-save-quiz"
            onClick={handleSave}
            disabled={isSaving || !examName.trim()}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <BookmarkCheck className="w-4 h-4" />
            )}
            <span>{activeSavedId && !saveAsNew ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
