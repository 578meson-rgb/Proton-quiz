import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  HelpCircle,
  Shield,
  Send,
  Sparkles
} from 'lucide-react';
import { MCQQuestion, ExamSettings, ExamSubmission } from '../types';
import { MathRenderer } from './MathRenderer';

interface CbtExamRoomProps {
  questions: MCQQuestion[];
  settings: ExamSettings;
  onSubmitExam: (submission: ExamSubmission) => void;
  onExitExam: () => void;
}

export const CbtExamRoom: React.FC<CbtExamRoomProps> = ({
  questions,
  settings,
  onSubmitExam,
  onExitExam,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [flagged, setFlagged] = useState<Record<string, boolean>>({}); // questionId -> isFlagged
  const [visited, setVisited] = useState<Record<string, boolean>>({ [questions[0]?.id]: true });
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({}); // questionId -> seconds

  // Timer: seconds left
  const totalSeconds = settings.durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Practice mode state: show answer for current question
  const [showPracticeAnswer, setShowPracticeAnswer] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const currentQ = questions[currentIndex];

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });

      // Track time spent on active question
      if (currentQ) {
        setTimeSpent((prev) => ({
          ...prev,
          [currentQ.id]: (prev[currentQ.id] || 0) + 1,
        }));
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQ]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitModalOpen) return;

      // Number keys 1-4 for options
      if (['1', '2', '3', '4'].includes(e.key) && currentQ) {
        const optIndex = parseInt(e.key, 10) - 1;
        if (currentQ.options[optIndex]) {
          handleSelectOption(currentQ.options[optIndex].id);
        }
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
        handlePrev();
      } else if (e.key.toLowerCase() === 'f') {
        handleToggleFlag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, answers, isSubmitModalOpen]);

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleClearOption = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      setShowPracticeAnswer(false);
      setVisited((prev) => ({ ...prev, [questions[index].id]: true }));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      jumpToQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      jumpToQuestion(currentIndex - 1);
    }
  };

  const handleFinalSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Compute results
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    questions.forEach((q) => {
      const selected = answers[q.id];
      if (!selected) {
        unansweredCount++;
      } else if (selected === q.correctOptionId) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const netScore = Math.max(
      0,
      correctCount * settings.marksPerQuestion - wrongCount * settings.negativeMarking
    );
    const totalMarks = questions.length * settings.marksPerQuestion;
    const accuracy =
      correctCount + wrongCount > 0 ? (correctCount / (correctCount + wrongCount)) * 100 : 0;

    const submission: ExamSubmission = {
      answers,
      flagged,
      timeSpentPerQuestion: timeSpent,
      totalTimeSpent: totalSeconds - secondsLeft,
      score: Number(netScore.toFixed(2)),
      totalMarks,
      correctCount,
      wrongCount,
      unansweredCount,
      accuracy: Number(accuracy.toFixed(1)),
      submittedAt: new Date().toISOString(),
    };

    onSubmitExam(submission);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;
  const isTimeLow = secondsLeft <= 180; // 3 mins or less

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-bengali">
      {/* Real CBT Top Navigation Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 font-mono-code text-sm">
              CBT
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-1">
                {settings.title}
              </h2>
              <p className="text-xs text-slate-400">
                মান: +{settings.marksPerQuestion} • নেগেটিভ: -{settings.negativeMarking}
              </p>
            </div>
          </div>

          {/* Center Timer Display */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono-code font-bold text-sm sm:text-base border transition-all ${
                isTimeLow
                  ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-emerald-400'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsLeft)}</span>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:flex p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="ফুলস্ক্রিন টগল"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Submit Exam Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cbt-submit-top"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>পরীক্ষা জমা দিন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main CBT Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Question Area (8 columns on large screens) */}
        <section className="lg:col-span-8 flex flex-col justify-between">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-8">
            {/* Question Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded-lg">
                  প্রশ্ন {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  {currentQ.subject}
                </span>
                {currentQ.sourceExam && (
                  <span className="hidden sm:inline text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    {currentQ.sourceExam}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-cbt-flag"
                  onClick={handleToggleFlag}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    flagged[currentQ.id]
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="পরবর্তীতে দেখার জন্য ফ্ল্যাগ করুন"
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-purple-600' : ''}`} />
                  <span>{flagged[currentQ.id] ? 'ফ্ল্যাগ করা হয়েছে' : 'ফ্ল্যাগ করুন'}</span>
                </button>
              </div>
            </div>

            {/* Stimulus / Context (উদ্দীপক) if present */}
            {currentQ.context && (
              <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1 text-xs uppercase tracking-wider text-emerald-800">
                  উদ্দীপক বা তথ্য:
                </span>
                <MathRenderer content={currentQ.context} />
              </div>
            )}

            {/* Question Text */}
            <div className="text-base sm:text-lg font-bold text-slate-900 mb-6 leading-relaxed">
              <MathRenderer content={currentQ.question} />
            </div>

            {/* Multiple Choice Options (ক, খ, গ, ঘ) */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt.id;
                const isPracticeCorrect =
                  settings.mode === 'practice' &&
                  showPracticeAnswer &&
                  opt.id === currentQ.correctOptionId;
                const isPracticeWrong =
                  settings.mode === 'practice' &&
                  showPracticeAnswer &&
                  isSelected &&
                  opt.id !== currentQ.correctOptionId;

                return (
                  <label
                    key={opt.id}
                    id={`opt-btn-${opt.id}`}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-slate-950 shadow-xs'
                        : isPracticeCorrect
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-950'
                        : isPracticeWrong
                        ? 'border-rose-500 bg-rose-50 text-rose-950'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                    }`}
                  >
                    {/* Circle / Badge with ক, খ, গ, ঘ */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </div>

                    <div className="flex-1 text-sm sm:text-base">
                      <MathRenderer content={opt.text} />
                    </div>

                    <span className="text-xs text-slate-400 font-mono-code hidden sm:inline">
                      [{idx + 1}]
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Practice Mode Instant Feedback */}
            {settings.mode === 'practice' && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                {!showPracticeAnswer ? (
                  <button
                    type="button"
                    onClick={() => setShowPracticeAnswer(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>উত্তর ও ব্যাখ্যা দেখুন</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm">
                    <p className="font-bold text-emerald-900 mb-1">সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা:</p>
                    <MathRenderer content={currentQ.explanation} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-cbt-prev"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পূর্ববর্তী (P)</span>
              </button>

              <button
                type="button"
                id="btn-cbt-clear"
                onClick={handleClearOption}
                disabled={!answers[currentQ.id]}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium transition-colors"
              >
                রিসপন্স ক্লিয়ার
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-cbt-next"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>পরবর্তী (N)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right / Question Navigation Palette (4 columns on large screens) */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>প্রশ্ন প্যালেট (Question Palette)</span>
              <span className="text-xs font-normal text-slate-500">মোট: {questions.length}</span>
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-6 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600"></span>
                <span>উত্তর দেওয়া ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                <span>উত্তর বাকি ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-600"></span>
                <span>ফ্ল্যাগ করা ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300"></span>
                <span>অদেখা</span>
              </div>
            </div>

            {/* Question Quick Jump Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = Boolean(flagged[q.id]);
                const isVisited = Boolean(visited[q.id]);

                let bgClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isFlagged) {
                  bgClass = 'bg-purple-600 text-white font-bold';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold';
                } else if (isVisited) {
                  bgClass = 'bg-amber-100 text-amber-900 border border-amber-300';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all font-mono-code relative ${bgClass} ${
                      isCurrent ? 'ring-3 ring-slate-900 ring-offset-2 scale-105' : ''
                    }`}
                    title={`প্রশ্ন ${idx + 1}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 border border-white"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats & Final Submit Box */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl mb-4 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>সম্পূর্ণ উত্তর:</span>
                <span className="font-bold text-emerald-700">{answeredCount} টি</span>
              </div>
              <div className="flex justify-between">
                <span>অনুত্তরিত:</span>
                <span className="font-bold text-amber-700">{unansweredCount} টি</span>
              </div>
              <div className="flex justify-between">
                <span>অবশিষ্ট সময়:</span>
                <span className="font-bold font-mono-code text-slate-900">{formatTime(secondsLeft)}</span>
              </div>
            </div>

            <button
              type="button"
              id="btn-cbt-submit-side"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>পরীক্ষা শেষ করুন</span>
            </button>
          </div>
        </aside>
      </main>

      {/* Submission Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-center text-slate-900 mb-2">
              আপনি কি পরীক্ষা জমা দিতে চান?
            </h3>
            <p className="text-xs text-center text-slate-500 mb-6">
              একবার জমা দিলে আর কোনো উত্তর পরিবর্তন করা যাবে না।
            </p>

            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl mb-6">
              <div className="p-2">
                <p className="text-xs text-slate-500">উত্তর দিয়েছেন</p>
                <p className="text-lg font-extrabold text-emerald-600 font-mono-code">{answeredCount}</p>
              </div>
              <div className="p-2 border-x border-slate-200">
                <p className="text-xs text-slate-500">উত্তর বাকি</p>
                <p className="text-lg font-extrabold text-amber-600 font-mono-code">{unansweredCount}</p>
              </div>
              <div className="p-2">
                <p className="text-xs text-slate-500">ফ্ল্যাগ করা</p>
                <p className="text-lg font-extrabold text-purple-600 font-mono-code">{flaggedCount}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 text-sm transition-colors"
              >
                পরীক্ষায় ফিরে যান
              </button>
              <button
                type="button"
                id="btn-confirm-submit-cbt"
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-colors"
              >
                জমা দিন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
