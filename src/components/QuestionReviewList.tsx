import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Plus, 
  Check, 
  Settings, 
  BookOpen, 
  Sparkles, 
  HelpCircle,
  Shuffle,
  ShieldAlert
} from 'lucide-react';
import { MCQQuestion, ExamSettings, SubjectType } from '../types';
import { MathRenderer } from './MathRenderer';

interface QuestionReviewListProps {
  questions: MCQQuestion[];
  subject: SubjectType;
  rawImage?: string;
  onStartExam: (settings: ExamSettings, filteredQuestions: MCQQuestion[]) => void;
  onUpdateQuestions: (updated: MCQQuestion[]) => void;
}

export const QuestionReviewList: React.FC<QuestionReviewListProps> = ({
  questions,
  subject,
  rawImage,
  onStartExam,
  onUpdateQuestions,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<MCQQuestion | null>(null);

  // Exam Configuration Settings
  const [examTitle, setExamTitle] = useState<string>(`${subject} - লাইভ মডেল টেস্ট`);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState<number>(45);
  const [useCustomDuration, setUseCustomDuration] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<number>(
    Math.max(1, Math.ceil((questions.length * 45) / 60))
  );
  const [negativeMarking, setNegativeMarking] = useState<number>(0.25);
  const [mode, setMode] = useState<'cbt_exam' | 'practice'>('cbt_exam');
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  const reviewQuestionsCount = questions.filter((q) => q.needsReview).length;

  const toBanglaNum = (num: number | string): string => {
    return num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
  };

  const totalCalculatedSeconds = useCustomDuration
    ? customMinutes * 60
    : questions.length * secondsPerQuestion;

  const formatBanglaDuration = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const parts = [];
    if (hours > 0) parts.push(`${toBanglaNum(hours)} ঘণ্টা`);
    if (minutes > 0) parts.push(`${toBanglaNum(minutes)} মিনিট`);
    if (seconds > 0 || parts.length === 0) parts.push(`${toBanglaNum(seconds)} সেকেন্ড`);
    return parts.join(' ');
  };

  const handleEditStart = (idx: number) => {
    setEditingIndex(idx);
    setEditedQuestion(JSON.parse(JSON.stringify(questions[idx])));
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editedQuestion) {
      const updated = [...questions];
      updated[editingIndex] = editedQuestion;
      onUpdateQuestions(updated);
      setEditingIndex(null);
      setEditedQuestion(null);
    }
  };

  const handleDeleteQuestion = (idx: number) => {
    if (confirm('আপনি কি এই প্রশ্নটি মুছে ফেলতে চান?')) {
      const updated = questions.filter((_, i) => i !== idx);
      onUpdateQuestions(updated);
      if (editingIndex === idx) {
        setEditingIndex(null);
        setEditedQuestion(null);
      }
    }
  };

  const handleLaunchCbt = () => {
    const totalSecs = totalCalculatedSeconds;
    const settings: ExamSettings = {
      title: examTitle,
      durationMinutes: Math.round((totalSecs / 60) * 10) / 10,
      durationSeconds: totalSecs,
      secondsPerQuestion: useCustomDuration ? Math.round(totalSecs / (questions.length || 1)) : secondsPerQuestion,
      negativeMarking,
      marksPerQuestion: 1.0,
      passPercentage: 40,
      shuffleQuestions,
      mode,
    };
    onStartExam(settings, questions);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner & Exam Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {subject}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-bengali">
                মোট প্রশ্ন: {questions.length} টি
              </span>
              {reviewQuestionsCount > 0 && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {reviewQuestionsCount} টি প্রশ্ন পুনর্নিরীক্ষণ প্রয়োজন
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-bengali">
              এক্সট্রাক্টকৃত প্রশ্ন ও CBT সেটআপ
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-bengali">
              পরীক্ষা শুরু করার পূর্বে প্রশ্নগুলি দেখে নিন অথবা প্রয়োজন অনুযায়ী পরিবর্তন করুন।
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            {rawImage && (
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 font-bengali"
              >
                <span>আসল ছবি দেখুন</span>
              </button>
            )}

            <button
              type="button"
              id="btn-start-cbt-main"
              onClick={handleLaunchCbt}
              className="flex-1 lg:flex-initial px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-base font-bengali"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>CBT পরীক্ষা শুরু করুন</span>
            </button>
          </div>
        </div>

        {/* Exam Configuration Parameters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-bengali">
              পরীক্ষার নাম
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bengali"
            />
          </div>

          {/* 45 Seconds Per MCQ Time Calculator */}
          <div className="sm:col-span-2 lg:col-span-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 font-bengali flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>সময় গণনা (প্রতি MCQ ৪৫ সেকেন্ড)</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bengali">
                মোট: {formatBanglaDuration(totalCalculatedSeconds)}
              </span>
            </div>

            {!useCustomDuration ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {[
                      { label: '৪৫ সে (স্ট্যান্ডার্ড)', val: 45 },
                      { label: '৩০ সে (কুইক)', val: 30 },
                      { label: '৬০ সে (১ মিনিট)', val: 60 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setSecondsPerQuestion(preset.val)}
                        className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${
                          secondsPerQuestion === preset.val
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomDuration(true);
                      setCustomMinutes(Math.max(1, Math.ceil(totalCalculatedSeconds / 60)));
                    }}
                    className="text-[11px] text-slate-500 hover:text-emerald-700 underline font-bengali"
                  >
                    কাস্টম মিনিট
                  </button>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs text-slate-700 font-bengali">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">
                      {toBanglaNum(questions.length)} টি প্রশ্ন × {toBanglaNum(secondsPerQuestion)} সেকেন্ড
                    </span>
                    <span className="text-slate-400">=</span>
                    <span className="font-extrabold text-emerald-700">
                      {formatBanglaDuration(totalCalculatedSeconds)}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-code text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {Math.floor(totalCalculatedSeconds / 60)}:
                    {(totalCalculatedSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-7 font-mono-code"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                  </div>
                  <span className="text-xs text-slate-600 font-bengali">মিনিট</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-bengali">
                    মোট: {toBanglaNum(customMinutes * 60)} সেকেন্ড ({toBanglaNum(Math.round((customMinutes * 60) / (questions.length || 1)))} সে/প্রশ্ন)
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseCustomDuration(false)}
                    className="text-emerald-600 hover:underline font-bengali"
                  >
                    ৪৫ সে/MCQ তে ফিরুন
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-bengali">
              নেগেটিভ মার্কিং
            </label>
            <select
              value={negativeMarking}
              onChange={(e) => setNegativeMarking(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bengali"
            >
              <option value="0.25">-0.25 (বিশ্ববিদ্যালয় ও মেডিকেল)</option>
              <option value="0.20">-0.20 (কিছু প্রকৌশল/গুচ্ছ)</option>
              <option value="0">0.00 (HSC বোর্ড স্ট্যান্ডার্ড)</option>
            </select>

            <div className="mt-2.5">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-bengali">
                পরীক্ষার ধরণ (Mode)
              </label>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setMode('cbt_exam')}
                  className={`flex-1 py-1.5 font-medium font-bengali transition-colors ${
                    mode === 'cbt_exam'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  রিয়েল CBT
                </button>
                <button
                  type="button"
                  onClick={() => setMode('practice')}
                  className={`flex-1 py-1.5 font-medium font-bengali transition-colors ${
                    mode === 'practice'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  অনুশীলন
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shuffle Option */}
        <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-100">
          <input
            type="checkbox"
            id="shuffle-check"
            checked={shuffleQuestions}
            onChange={(e) => setShuffleQuestions(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <label htmlFor="shuffle-check" className="text-xs text-slate-600 cursor-pointer font-bengali flex items-center gap-1.5">
            <Shuffle className="w-3.5 h-3.5 text-slate-400" />
            <span>প্রশ্নের ক্রম এলোমেলো করুন (Randomize question order)</span>
          </label>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isEditing = editingIndex === idx;

          if (isEditing && editedQuestion) {
            return (
              <div key={q.id} className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 font-bengali">
                    প্রশ্ন {idx + 1} সম্পাদন করুন
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-bengali"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold font-bengali"
                    >
                      সংরক্ষণ
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 font-bengali">
                      উদ্দীপক বা তথ্য (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={2}
                      value={editedQuestion.context || ''}
                      onChange={(e) => setEditedQuestion({ ...editedQuestion, context: e.target.value })}
                      className="w-full p-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      placeholder="উদ্দীপক থাকলে লিখুন..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 font-bengali">
                      মূল প্রশ্ন (LaTeX এর জন্য $ ব্যবহার করুন, যেমন $E=mc^2$)
                    </label>
                    <textarea
                      rows={2}
                      value={editedQuestion.question}
                      onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                      className="w-full p-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {editedQuestion.options.map((opt, optIdx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                          {opt.label}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...editedQuestion.options];
                            newOptions[optIdx].text = e.target.value;
                            setEditedQuestion({ ...editedQuestion, options: newOptions });
                          }}
                          className="flex-1 p-2 text-sm rounded-lg border border-slate-300"
                        />
                        <input
                          type="radio"
                          name={`correct-${editedQuestion.id}`}
                          checked={editedQuestion.correctOptionId === opt.id}
                          onChange={() => setEditedQuestion({ ...editedQuestion, correctOptionId: opt.id })}
                          title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
                          className="w-4 h-4 text-emerald-600"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 font-bengali">
                      ব্যাখ্যা ও সমাধান
                    </label>
                    <textarea
                      rows={2}
                      value={editedQuestion.explanation}
                      onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
                      className="w-full p-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all ${
                q.needsReview ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 shadow-2xs'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center font-mono-code shadow-xs">
                    {idx + 1}
                  </span>
                  {q.topic && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md font-bengali">
                      {q.topic}
                    </span>
                  )}
                  {q.sourceExam && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bengali border border-emerald-200">
                      {q.sourceExam}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleEditStart(idx)}
                    className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="প্রশ্ন এডিট করুন"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(idx)}
                    className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="প্রশ্ন মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Review Alert if confidence low or noise was present */}
              {q.needsReview && (
                <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-100/70 border border-amber-300/80 text-amber-900 text-xs flex items-center gap-2 font-bengali">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>পুনর্নিরীক্ষণ নোট:</strong> {q.reviewReason || 'পেন্সিল/টিক মার্ক ফিল্টারিং নিশ্চিত করতে উত্তরটি পরীক্ষা করুন।'}
                  </span>
                </div>
              )}

              {/* Context / উদ্দীপক */}
              {q.context && (
                <div className="mb-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 font-bengali">
                  <span className="font-bold text-slate-900 mr-1.5">উদ্দীপক:</span>
                  <MathRenderer content={q.context} />
                </div>
              )}

              {/* Question Text */}
              <div className="text-base font-semibold text-slate-900 mb-4 font-bengali">
                <MathRenderer content={q.question} />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {q.options.map((opt) => {
                  const isCorrect = opt.id === q.correctOptionId;
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all font-bengali ${
                        isCorrect
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <div className="flex-1">
                        <MathRenderer content={opt.text} />
                      </div>
                      {isCorrect && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          সঠিক উত্তর
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Dropdown / Preview */}
              {q.explanation && (
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 font-bengali">
                  <span className="font-bold text-slate-700 mr-1">ব্যাখ্যা:</span>
                  <MathRenderer content={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-4 mt-8 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm font-bengali">
            {questions.length} টি প্রশ্ন সম্পূর্ণ প্রস্তুত
          </h4>
          <p className="text-xs text-slate-400 font-bengali">
            সময়: {formatBanglaDuration(totalCalculatedSeconds)} (প্রতি প্রশ্ন {toBanglaNum(secondsPerQuestion)} সেকেন্ড) • নেগেটিভ: -{negativeMarking}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLaunchCbt}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-2 font-bengali shadow-md shadow-emerald-500/20"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>পরীক্ষা শুরু করুন</span>
        </button>
      </div>

      {/* Raw Image Modal */}
      {showImageModal && rawImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 font-bengali">আপলোডকৃত প্রশ্নপত্রের ছবি</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold px-3 py-1 bg-slate-100 rounded-lg"
              >
                বন্ধ করুন
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-100">
              <img src={rawImage} alt="Uploaded Original" className="max-w-full h-auto rounded-lg shadow-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
