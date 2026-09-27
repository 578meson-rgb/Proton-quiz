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
  Loader2,
  Bookmark,
  Check,
  Copy,
  Zap,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { MCQQuestion, ExamSettings, ExamSubmission, SubjectType } from '../types';
import { MathRenderer } from './MathRenderer';
import { SaveExamModal } from './SaveExamModal';
import { updateExamSubmissionHistory } from '../utils/savedExamsStorage';

interface ExamResultsProps {
  questions: MCQQuestion[];
  settings: ExamSettings;
  submission: ExamSubmission;
  onRetake: () => void;
  onNewExam: () => void;
  onOpenPrintView: () => void;
  activeSavedId?: string | null;
  onSavedSuccess?: (savedId: string, savedName: string) => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  questions,
  settings,
  submission,
  onRetake,
  onNewExam,
  onOpenPrintView,
  activeSavedId,
  onSavedSuccess,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(activeSavedId || null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Auto-record submission if already saved
  useEffect(() => {
    if (activeSavedId) {
      updateExamSubmissionHistory(activeSavedId, submission);
    }
  }, [activeSavedId, submission]);

  // AI Tutor Modal state
  const [tutorQuestion, setTutorQuestion] = useState<MCQQuestion | null>(null);
  const [tutorQuery, setTutorQuery] = useState<string>('');
  const [tutorLoading, setTutorLoading] = useState<boolean>(false);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [copiedTutor, setCopiedTutor] = useState<boolean>(false);
  const [isTutorBannerDismissed, setIsTutorBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('quizify_tutor_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

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

  const handleAskTutor = async (targetQuestion?: MCQQuestion, queryOverride?: string) => {
    const q = targetQuestion || tutorQuestion;
    if (!q) return;

    const queryToUse = queryOverride !== undefined ? queryOverride : tutorQuery;
    setTutorLoading(true);
    setTutorResponse(null);
    setCopiedTutor(false);

    try {
      const selectedOpt = q.options.find(
        (o) => o.id === submission.answers[q.id]
      );
      const correctOpt = q.options.find(
        (o) => o.id === q.correctOptionId
      );

      const res = await fetch('/api/tutor-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          options: q.options,
          selectedOption: selectedOpt ? `${selectedOpt.label}) ${selectedOpt.text}` : undefined,
          correctOption: correctOpt ? `${correctOpt.label}) ${correctOpt.text}` : undefined,
          userQuery: queryToUse,
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

  const openTutorForQuestion = (q: MCQQuestion, presetQuery?: string) => {
    setTutorQuestion(q);
    const userAnswer = submission.answers[q.id];
    const isWrong = userAnswer && userAnswer !== q.correctOptionId;
    
    const query = presetQuery || (
      isWrong
        ? 'আমার উত্তর ভুল হয়েছে। কেন ভুল হলো এবং ভর্তি পরীক্ষায় সঠিক উত্তরের শর্টকাট ট্রিক কী?'
        : 'এই প্রশ্নের মূল সূত্র, বিস্তারিত সমাধান ও ভর্তি পরীক্ষার শর্টকাট টেকনিক বুঝিয়ে বলুন।'
    );
    
    setTutorQuery(query);
    handleAskTutor(q, query);
  };

  const handleCopyExplanation = () => {
    if (!tutorResponse) return;
    try {
      navigator.clipboard.writeText(tutorResponse);
      setCopiedTutor(true);
      setTimeout(() => setCopiedTutor(false), 2000);
    } catch {
      // ignore
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

  const tutorPresetChips = [
    { label: '⚡ ভর্তি শর্টকাট ট্রিক', query: 'এই প্রশ্নের ভর্তি পরীক্ষার সুপার শর্টকাট বা দ্রুত সলভ করার ট্রিক কী?' },
    { label: '❌ আমার ভুল উত্তরের কারণ', query: 'আমার দেওয়া ভুল উত্তরের কারণ কী এবং সাধারণ শিক্ষার্থীরা এখানে কোথায় ভুল করে?' },
    { label: '📐 সূত্র ও স্টেপ-বাই-স্টেপ সমাধান', query: 'মূল সূত্র এবং বিস্তারিত স্টেপ-বাই-স্টেপ সমাধান সহজ বাংলায় বুঝিয়ে বলুন।' },
    { label: '💡 ক্যালকুলেটর ছাড়া টেকনিক', query: 'ক্যালকুলেটর ছাড়া হাতে হাতে দ্রুত কীভাবে ক্যালকুলেশন করব?' },
  ];

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

          {/* Save Exam Set Button */}
          <button
            type="button"
            id="btn-save-exam-results"
            onClick={() => setIsSaveModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm shadow-2xs transition-colors flex items-center gap-2"
            title="ভবিষ্যতে অনুশীলনের জন্য এই সেটটি সেভ করে রাখুন"
          >
            <Bookmark className={`w-4 h-4 ${currentSavedId ? 'fill-emerald-600' : ''}`} />
            <span>{currentSavedId ? 'সংরক্ষিত (আপডেট করুন)' : 'কুইজটি সংরক্ষণ করুন'}</span>
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

        {savedSuccessMsg && (
          <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in max-w-md mx-auto">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* AI Tutor Spotlight Banner */}
      {!isTutorBannerDismissed && (
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-lg relative overflow-hidden border border-emerald-500/20 animate-in fade-in duration-200">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Dismiss Cross Button */}
          <button
            type="button"
            onClick={() => {
              setIsTutorBannerDismissed(true);
              try {
                localStorage.setItem('quizify_tutor_banner_dismissed', 'true');
              } catch {
                // ignore
              }
            }}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
            title="ব্যানারটি বন্ধ করুন (Dismiss)"
            aria-label="ব্যানারটি বন্ধ করুন"
          >
            ✕
          </button>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    কোনো প্রশ্নে কনফিউশন বা শর্টকাট দরকার? AI টিউটর রয়েছে সার্বক্ষণিক!
                  </h3>
                  <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    লাইভ পার্সোনাল টিউটর
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  ভুল হওয়া প্রশ্নগুলো কেন ভুল হলো, কোন সূত্রে প্যাঁচ ছিল, কিংবা ভর্তি পরীক্ষায় মাত্র ১০ সেকেন্ডে উত্তর বের করার সুপার শর্টকাট ট্রিকস—প্রতিটি প্রশ্নের পাশে থাকা <span className="text-emerald-400 font-bold">"AI টিউটর"</span> বাটনে চাপ দিয়ে যেকোনো প্রশ্ন বুঝে নিন।
                </p>
              </div>
            </div>

            {submission.wrongCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFilterType('wrong');
                  const firstWrong = questions.find(
                    (q) => submission.answers[q.id] && submission.answers[q.id] !== q.correctOptionId
                  );
                  if (firstWrong) {
                    openTutorForQuestion(firstWrong);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>ভুল প্রশ্নগুলো AI টিউটরে বুঝে নিন ({submission.wrongCount}টি)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-200">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          প্রশ্নোত্তর ও পূর্ণাঙ্গ সমাধান ({filteredQuestions.length} টি)
        </h2>

        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            সব ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('correct')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            সঠিক ({submission.correctCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('wrong')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'wrong' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            ভুল ({submission.wrongCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('unanswered')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
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
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
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

                  {/* Prominent AI Tutor Button in Header */}
                  <button
                    type="button"
                    onClick={() => openTutorForQuestion(q)}
                    className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ml-1"
                    title="AI টিউটরের সাহায্য নিন"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI টিউটর</span>
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
                    className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>সমাধান ও সূত্রের সাধারণ ব্যাখ্যা</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Quizify AI পার্সোনাল টিউটর</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      প্রশ্ন নং {tutorQuestion.questionNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">বাংলায় স্টেপ-বাই-স্টেপ সমাধান, সূত্রের প্রমাণ ও ভর্তি শর্টকাট</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTutorQuestion(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Question Summary & Selected Option Status */}
            <div className="my-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 max-h-36 overflow-y-auto">
              <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>প্রশ্ন:</span>
                <span className="text-[11px] font-normal text-slate-500">
                  সঠিক উত্তর: <strong className="text-emerald-700">
                    {tutorQuestion.options.find(o => o.id === tutorQuestion.correctOptionId)?.label}) {tutorQuestion.options.find(o => o.id === tutorQuestion.correctOptionId)?.text}
                  </strong>
                </span>
              </div>
              <div className="font-semibold text-slate-800 mb-2">
                <MathRenderer content={tutorQuestion.question} />
              </div>
              {submission.answers[tutorQuestion.id] && (
                <div className="text-[11px] text-slate-600">
                  আপনার নির্বাচিত উত্তর ছিল:{' '}
                  <span className={submission.answers[tutorQuestion.id] === tutorQuestion.correctOptionId ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {tutorQuestion.options.find(o => o.id === submission.answers[tutorQuestion.id])?.label}) {tutorQuestion.options.find(o => o.id === submission.answers[tutorQuestion.id])?.text}
                  </span>
                </div>
              )}
            </div>

            {/* Quick 1-Tap Preset Action Chips */}
            <div className="mb-3">
              <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>এক ক্লিকে দ্রুত জানার বিষয় নির্বাচন করুন:</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tutorPresetChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTutorQuery(chip.query);
                      handleAskTutor(tutorQuestion, chip.query);
                    }}
                    disabled={tutorLoading}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Student Query Input */}
            <div className="mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tutorQuery}
                  onChange={(e) => setTutorQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !tutorLoading && tutorQuery.trim()) {
                      handleAskTutor(tutorQuestion, tutorQuery);
                    }
                  }}
                  placeholder="যেমন: এই অংকে কোনো ক্যালকুলেটর শর্টকাট আছে? বা সূত্রটা আবার বোঝান..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAskTutor(tutorQuestion, tutorQuery)}
                  disabled={tutorLoading}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {tutorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">জিজ্ঞাসা করুন</span>
                </button>
              </div>
            </div>

            {/* AI Explanation Result Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-emerald-50/40 to-slate-50/60 rounded-2xl border border-emerald-100/80 text-xs sm:text-sm text-slate-800 min-h-[160px] relative">
              {tutorLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <div className="relative mb-3">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <p className="font-bold text-slate-800 text-sm mb-1">AI টিউটর উত্তর তৈরি করছে...</p>
                  <p className="text-xs text-slate-500">ভর্তি শর্টকাট ও সহজ সমাধান প্রস্তুত হচ্ছে</p>
                </div>
              ) : tutorResponse ? (
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <p className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>টিউটরের পূর্ণাঙ্গ ব্যাখ্যা ও শর্টকাট গাইড:</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyExplanation}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiedTutor ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                      <span>{copiedTutor ? 'কপি হয়েছে!' : 'ব্যাখ্যা কপি করুন'}</span>
                    </button>
                  </div>

                  <div className="leading-relaxed space-y-2 text-slate-800">
                    <MathRenderer content={tutorResponse} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center">
                  <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs">
                    উপরের কোনো প্রিসেট বাটন চাপুন অথবা আপনার প্রশ্ন লিখে "জিজ্ঞাসা করুন" বাটনে ক্লিক করুন।
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Exam Modal */}
      <SaveExamModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        questions={questions}
        subject={questions[0]?.subject || 'Physics'}
        settings={settings}
        activeSavedId={currentSavedId}
        onSavedSuccess={(savedId, savedName) => {
          setCurrentSavedId(savedId);
          setSavedSuccessMsg(`"${savedName}" সেটটি সফলভাবে সংরক্ষণ করা হয়েছে!`);
          setTimeout(() => setSavedSuccessMsg(null), 4000);
          if (onSavedSuccess) {
            onSavedSuccess(savedId, savedName);
          }
        }}
      />
    </div>
  );
};
