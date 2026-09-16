import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  RotateCcw, 
  Printer, 
  HelpCircle, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Send,
  Loader2
} from 'lucide-react';
import { MCQQuestion, ExamSettings, ExamSubmission } from '../types';
import { MathRenderer } from './MathRenderer';

interface ExamResultsProps {
  questions: MCQQuestion[];
  settings: ExamSettings;
  submission: ExamSubmission;
  onRetake: () => void;
  onNewExam: () => void;
  onOpenPrintView: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  questions,
  settings,
  submission,
  onRetake,
  onNewExam,
  onOpenPrintView,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  // AI Tutor Modal state
  const [tutorQuestion, setTutorQuestion] = useState<MCQQuestion | null>(null);
  const [tutorQuery, setTutorQuery] = useState<string>('');
  const [tutorLoading, setTutorLoading] = useState<boolean>(false);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
      });
    } catch {
      // ignore in environments without canvas support
    }
  }, []);

  const totalPossible = questions.length * settings.marksPerQuestion;
  const percentage = totalPossible > 0 ? (submission.score / totalPossible) * 100 : 0;
  const isPassed = percentage >= settings.passPercentage;

  const toggleExplanation = (qId: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleAskTutor = async () => {
    if (!tutorQuestion) return;
    setTutorLoading(true);
    setTutorResponse(null);

    try {
      const selectedOpt = tutorQuestion.options.find(
        (o) => o.id === submission.answers[tutorQuestion.id]
      );
      const correctOpt = tutorQuestion.options.find(
        (o) => o.id === tutorQuestion.correctOptionId
      );

      const res = await fetch('/api/tutor-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: tutorQuestion.question,
          options: tutorQuestion.options,
          selectedOption: selectedOpt ? `${selectedOpt.label}) ${selectedOpt.text}` : undefined,
          correctOption: correctOpt ? `${correctOpt.label}) ${correctOpt.text}` : undefined,
          userQuery: tutorQuery,
        }),
      });

      if (!res.ok) throw new Error('AI টিউটর রেসপন্স প্রদান করতে পারেনি।');
      const data = await res.json();
      setTutorResponse(data.explanation || 'কোনো ব্যাখ্যা পাওয়া যায়নি।');
    } catch (err: any) {
      setTutorResponse(`ত্রুটি: ${err.message || 'সার্ভার সমস্যা হয়েছে।'}`);
    } finally {
      setTutorLoading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins} মিনিট ${s} সেকেন্ড`;
  };

  const filteredQuestions = questions.filter((q) => {
    const userAnswer = submission.answers[q.id];
    if (filterType === 'correct') return userAnswer === q.correctOptionId;
    if (filterType === 'wrong') return userAnswer && userAnswer !== q.correctOptionId;
    if (filterType === 'unanswered') return !userAnswer;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-bengali">
      {/* Score Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 mb-8 text-center relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 mb-2">
          <span>{settings.title}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
          আপনার মোট প্রাপ্ত নম্বর: <span className="text-emerald-600 font-mono-code">{submission.score}</span> / {totalPossible}
        </h1>

        <p className="text-sm text-slate-500 max-w-lg mx-auto mb-8">
          {isPassed
            ? 'অভিনন্দন! আপনার প্রস্তুতি চমৎকার হয়েছে। নিয়মিত এমন মডেল টেস্ট অনুশীলনে কাঙ্ক্ষিত ফলাফল নিশ্চিত হবে।'
            : 'অনুশীলন অব্যাহত রাখুন! ভুল হওয়া প্রশ্নগুলোর ব্যাখ্যা ও সূত্রাবলী ভালোভাবে দেখে নিন।'}
        </p>

        {/* 4 Pillars of Performance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-8">
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>সঠিক উত্তর</span>
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono-code">
              {submission.correctCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-800 font-semibold mb-1">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>ভুল উত্তর</span>
            </div>
            <p className="text-2xl font-black text-rose-700 font-mono-code">
              {submission.wrongCount}
            </p>
            {settings.negativeMarking > 0 && (
              <p className="text-[11px] text-rose-500 mt-0.5">
                (-{(submission.wrongCount * settings.negativeMarking).toFixed(2)})
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 font-semibold mb-1">
              <MinusCircle className="w-4 h-4 text-amber-600" />
              <span>অনুত্তরিত</span>
            </div>
            <p className="text-2xl font-black text-amber-700 font-mono-code">
              {submission.unansweredCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-700 font-semibold mb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>মোট ব্যয়িত সময়</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mt-2">
              {formatSeconds(submission.totalTimeSpent)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              বরাদ্দ: {formatSeconds(settings.durationSeconds || Math.round(settings.durationMinutes * 60))}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>আবার পরীক্ষা দিন</span>
          </button>

          <button
            type="button"
            onClick={onOpenPrintView}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>প্রশ্ন ও সমাধান প্রিন্ট/PDF</span>
          </button>

          <button
            type="button"
            onClick={onNewExam}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            নতুন ছবি আপলোড করুন
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          প্রশ্নোত্তর ও পূর্ণাঙ্গ সমাধান ({filteredQuestions.length} টি)
        </h2>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            সব ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('correct')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            সঠিক ({submission.correctCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('wrong')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'wrong' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            ভুল ({submission.wrongCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('unanswered')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'unanswered' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            বাদ পড়া ({submission.unansweredCount})
          </button>
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const userAnswer = submission.answers[q.id];
          const isCorrect = userAnswer === q.correctOptionId;
          const isUnanswered = !userAnswer;
          const isExpanded = expandedExplanations[q.id] ?? true; // expanded by default in results

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all ${
                isCorrect
                  ? 'border-emerald-200 shadow-2xs'
                  : isUnanswered
                  ? 'border-slate-200'
                  : 'border-rose-200 shadow-2xs'
              }`}
            >
              {/* Question Header Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-mono-code">
                    {q.questionNumber || idx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {q.subject}
                  </span>
                  {q.topic && (
                    <span className="text-xs text-slate-500">
                      • {q.topic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>সঠিক উত্তর (+{settings.marksPerQuestion})</span>
                    </span>
                  ) : isUnanswered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <MinusCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>অনুত্তরিত (0)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>ভুল (-{settings.negativeMarking})</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setTutorQuestion(q);
                      setTutorQuery('');
                      setTutorResponse(null);
                    }}
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ml-1"
                    title="AI মেন্টরকে প্রশ্ন করুন"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">AI মেন্টর</span>
                  </button>
                </div>
              </div>

              {/* Context if present */}
              {q.context && (
                <div className="mb-3 p-3 rounded-xl bg-slate-50 text-slate-700 text-sm border border-slate-200">
                  <span className="font-bold text-slate-900 mr-1.5">উদ্দীপক:</span>
                  <MathRenderer content={q.context} />
                </div>
              )}

              {/* Question Text */}
              <div className="text-base font-bold text-slate-900 mb-4">
                <MathRenderer content={q.question} />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {q.options.map((opt) => {
                  const isUserChosen = userAnswer === opt.id;
                  const isThisCorrect = opt.id === q.correctOptionId;

                  let cardStyle = 'border-slate-200 bg-white text-slate-700';
                  let badgeStyle = 'bg-slate-100 text-slate-600';

                  if (isThisCorrect) {
                    cardStyle = 'border-emerald-400 bg-emerald-50/80 text-emerald-950 font-semibold';
                    badgeStyle = 'bg-emerald-600 text-white';
                  } else if (isUserChosen && !isThisCorrect) {
                    cardStyle = 'border-rose-300 bg-rose-50/80 text-rose-950 line-through';
                    badgeStyle = 'bg-rose-600 text-white';
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${cardStyle}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                        {opt.label}
                      </div>
                      <div className="flex-1">
                        <MathRenderer content={opt.text} />
                      </div>
                      {isThisCorrect && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          সঠিক
                        </span>
                      )}
                      {isUserChosen && !isThisCorrect && (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          আপনার উত্তর
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Accordion */}
              {q.explanation && (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleExplanation(q.id)}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                  >
                    <span>সমাধান ও সূত্রের ব্যাখ্যা</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <MathRenderer content={q.explanation} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Tutor Modal */}
      {tutorQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Quizify AI মেন্টর</h3>
                  <p className="text-xs text-slate-500">বাংলায় কনসেপ্ট ক্লিয়ার ও শর্টকাট টেকনিক</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTutorQuestion(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Question Summary */}
            <div className="my-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 max-h-32 overflow-y-auto">
              <span className="font-bold text-slate-900 block mb-1">প্রশ্ন:</span>
              <MathRenderer content={tutorQuestion.question} />
            </div>

            {/* Custom Student Query */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                আপনার কোনো নির্দিষ্ট প্রশ্ন থাকলে লিখুন:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tutorQuery}
                  onChange={(e) => setTutorQuery(e.target.value)}
                  placeholder="যেমন: এই সূত্রের শর্টকাট নিয়ম কি? বা খ কেন ভুল?"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAskTutor}
                  disabled={tutorLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {tutorLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>জানতে চাই</span>
                </button>
              </div>
            </div>

            {/* AI Explanation Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs sm:text-sm text-slate-800">
              {tutorLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                  <p>আপনার জন্য সহজ ভাষায় ব্যাখ্যা তৈরি করা হচ্ছে...</p>
                </div>
              ) : tutorResponse ? (
                <div className="space-y-2">
                  <p className="font-bold text-emerald-900 mb-2">মেন্টরের ব্যাখ্যা ও টিপস:</p>
                  <MathRenderer content={tutorResponse} />
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6">
                  উপরের "জানতে চাই" বাটনে ক্লিক করলে AI শিক্ষক বিস্তারিত স্টেপ-বাই-স্টেপ সমাধান বুঝিয়ে দেবেন।
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
