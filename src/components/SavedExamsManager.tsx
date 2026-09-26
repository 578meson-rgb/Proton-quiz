import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Edit3, 
  Play, 
  Layers, 
  Printer, 
  Search, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Upload, 
  Award,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { SavedExamSet, SubjectType } from '../types';
import { 
  getSavedExams, 
  deleteSavedExam, 
  renameSavedExam, 
  exportExamsAsJSON, 
  importExamsFromJSON 
} from '../utils/savedExamsStorage';

interface SavedExamsManagerProps {
  onLoadExamForCbt: (exam: SavedExamSet) => void;
  onLoadExamForReview: (exam: SavedExamSet) => void;
  onLoadExamForPrint: (exam: SavedExamSet) => void;
  onGoToUpload: () => void;
}

export const SavedExamsManager: React.FC<SavedExamsManagerProps> = ({
  onLoadExamForCbt,
  onLoadExamForReview,
  onLoadExamForPrint,
  onGoToUpload,
}) => {
  const [exams, setExams] = useState<SavedExamSet[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  
  // Delete modal state
  const [deletingExam, setDeletingExam] = useState<SavedExamSet | null>(null);
  
  // Rename modal state
  const [renamingExam, setRenamingExam] = useState<SavedExamSet | null>(null);
  const [newNameInput, setNewNameInput] = useState<string>('');
  const [renameError, setRenameError] = useState<string | null>(null);

  // Import feedback
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const refreshExams = () => {
    setExams(getSavedExams());
  };

  useEffect(() => {
    refreshExams();

    const handleUpdate = () => refreshExams();
    window.addEventListener('quizify_saved_exams_updated', handleUpdate);
    return () => window.removeEventListener('quizify_saved_exams_updated', handleUpdate);
  }, []);

  const handleDeleteConfirm = () => {
    if (deletingExam) {
      deleteSavedExam(deletingExam.id);
      setDeletingExam(null);
      refreshExams();
    }
  };

  const handleStartRename = (exam: SavedExamSet) => {
    setRenamingExam(exam);
    setNewNameInput(exam.name);
    setRenameError(null);
  };

  const handleConfirmRename = () => {
    if (!renamingExam) return;
    const trimmed = newNameInput.trim();
    if (!trimmed) {
      setRenameError('কুইজের নাম ফাঁকা রাখা যাবে না।');
      return;
    }
    renameSavedExam(renamingExam.id, trimmed);
    setRenamingExam(null);
    refreshExams();
  };

  const handleExport = () => {
    const dataStr = exportExamsAsJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quizify_saved_exams_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importExamsFromJSON(content);
        if (result.error) {
          setImportStatus(`ইমপোর্ট ব্যর্থ: ${result.error}`);
        } else {
          setImportStatus(`${result.successCount} টি কুইজ সেট সফলভাবে ইমপোর্ট হয়েছে!`);
          refreshExams();
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSubject = selectedSubject === 'All' || exam.subject === selectedSubject;
    const qLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !qLower ||
      exam.name.toLowerCase().includes(qLower) ||
      (exam.description && exam.description.toLowerCase().includes(qLower)) ||
      exam.subject.toLowerCase().includes(qLower);
    return matchesSubject && matchesSearch;
  });

  const getSubjectBadgeColor = (sub: SubjectType | string) => {
    switch (sub) {
      case 'Physics':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Chemistry':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Higher Math':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Biology':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDateBn = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-bengali">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Bookmark className="w-5 h-5 fill-current" />
              </span>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                সংরক্ষিত কুইজ লাইব্রেরি
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              আমার সংরক্ষিত কুইজ ও পরীক্ষার সেট
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              পূর্বে তৈরি করা কুইজগুলি এখানে সংরক্ষিত আছে। যেকোনো সময় পরীক্ষা দিন, প্রশ্ন দেখুন বা অপ্রয়োজনীয় সেট মুছে ফেলুন।
            </p>
          </div>

          {/* Quick Actions (Export, Import, New) */}
          <div className="flex flex-wrap items-center gap-2">
            {exams.length > 0 && (
              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="ব্যাকআপ হিসেবে কুইজগুলো JSON ফাইলে এক্সপোর্ট করুন"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ব্যাকআপ ডাউনলোড</span>
              </button>
            )}

            <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>ইমপোর্ট</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onGoToUpload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কুইজ তৈরি করুন</span>
            </button>
          </div>
        </div>

        {/* Import notification if any */}
        {importStatus && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Search & Subject Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কুইজের নাম বা বিষয় দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', 'Physics', 'Chemistry', 'Higher Math', 'Biology'].map((sub) => {
              const count = sub === 'All' 
                ? exams.length 
                : exams.filter((e) => e.subject === sub).length;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                    selectedSubject === sub
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub === 'All' ? 'সকল বিষয়' : sub} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Saved Exams */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const hasSubmission = Boolean(exam.lastSubmission);
            const scorePct = hasSubmission
              ? Math.round((exam.lastSubmission!.score / (exam.lastSubmission!.totalMarks || 1)) * 100)
              : 0;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Subject Badge + Question Count */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getSubjectBadgeColor(exam.subject)}`}>
                      {exam.subject}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {exam.questions.length} টি প্রশ্ন
                    </span>
                  </div>

                  {/* Exam Title & Edit Icon */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                      {exam.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleStartRename(exam)}
                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                      title="নাম পরিবর্তন করুন"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description if present */}
                  {exam.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  {/* Metadata (Date saved, last score) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>সংরক্ষণ: {formatDateBn(exam.createdAt)}</span>
                    </div>

                    {hasSubmission && (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50/70 px-2 py-1 rounded-lg">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          সর্বশেষ প্রাপ্ত নম্বর: {exam.lastSubmission!.score} / {exam.lastSubmission!.totalMarks} ({scorePct}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Start CBT Exam */}
                    <button
                      type="button"
                      onClick={() => onLoadExamForCbt(exam)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                      title="লাইভ CBT পরীক্ষা দিন"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>পরীক্ষা দিন</span>
                    </button>

                    {/* View Questions & Solutions */}
                    <button
                      type="button"
                      onClick={() => onLoadExamForReview(exam)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="প্রশ্ন ও সমাধান দেখুন"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      <span>প্রশ্নসমূহ</span>
                    </button>

                    {/* Printable Paper */}
                    <button
                      type="button"
                      onClick={() => onLoadExamForPrint(exam)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
                      title="প্রশ্নপত্র ও OMR প্রিন্ট ভিউ"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeletingExam(exam)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="এই কুইজ সেটটি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {searchQuery ? 'কোনো কুইজ পাওয়া যায়নি' : 'এখনও কোনো কুইজ সংরক্ষিত নেই'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            {searchQuery
              ? `"${searchQuery}" এর সাথে মিলে এমন কোনো কুইজ পাওয়া যায়নি। অনুসন্ধান পরিবর্তন করুন।`
              : 'আপনি যখন কোনো প্রশ্নপত্র ছবি থেকে এক্সট্র্যাক্ট করবেন, "সংরক্ষণ করুন" বাটনে ক্লিক করে কুইজের নাম দিয়ে সেভ করে রাখতে পারেন। এতে পরবর্তীতে পুনরায় প্রশ্ন তৈরি করার প্রয়োজন হবে না!'}
          </p>

          <button
            type="button"
            onClick={onGoToUpload}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-sm shadow-emerald-200 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>নতুন প্রশ্ন আপলোড করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-bengali">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">কুইজ সেটটি মুছে ফেলবেন?</h3>
                <p className="text-xs text-slate-500">এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়।</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5">
              আপনি নিশ্চিতভাবে <strong>&quot;{deletingExam.name}&quot;</strong> ({deletingExam.questions.length} টি প্রশ্ন) মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingExam(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                id="btn-confirm-delete-exam"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renamingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-bengali">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">কুইজ সেটের নাম পরিবর্তন করুন</h3>
            <p className="text-xs text-slate-500 mb-4">
              এই কুইজ সেটের জন্য একটি নতুন নাম লিখুন।
            </p>

            <input
              type="text"
              value={newNameInput}
              onChange={(e) => {
                setNewNameInput(e.target.value);
                if (renameError) setRenameError(null);
              }}
              placeholder="কুইজের নাম লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-medium text-slate-900 mb-2"
              autoFocus
            />

            {renameError && (
              <p className="text-xs text-rose-600 mb-3">{renameError}</p>
            )}

            <div className="flex items-center justify-end gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => setRenamingExam(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmRename}
                disabled={!newNameInput.trim()}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
