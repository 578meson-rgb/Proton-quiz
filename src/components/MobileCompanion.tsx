import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Eye, 
  EyeOff, 
  Play, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Lightbulb, 
  HelpCircle,
  Settings,
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { MCQQuestion } from '../types';

interface MobileCompanionProps {
  currentTab: string;
  questions: MCQQuestion[];
  showAllAnswers: boolean;
  onToggleAllAnswers: () => void;
  onStartExam?: () => void;
  onOpenGuide: () => void;
  onJumpToQuestion?: (index: number) => void;
}

export const MobileCompanion: React.FC<MobileCompanionProps> = ({
  currentTab,
  questions,
  showAllAnswers,
  onToggleAllAnswers,
  onStartExam,
  onOpenGuide,
  onJumpToQuestion,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTipIndex, setActiveTipIndex] = useState<number>(0);

  // Scroll visibility state:
  // Visible when at the top (scrollY < 60) or when scrolling up towards top;
  // Disappears when user scrolls down.
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show when user is at or near the top of the page (< 80px)
      if (currentScrollY <= 80) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 10) {
        // User is scrolling DOWN: disappear
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 15) {
        // User is scrolling UP: re-appear
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const tips = [
    {
      title: '৪০ সেকেন্ডের গোল্ডেন রুল',
      desc: 'HSC ও এডমিশন টেস্টে প্রতিটি MCQ এর জন্য ৪০ সেকেন্ড সময় বরাদ্দ রাখা হয়েছে। যে প্রশ্নে জটিল হিসেব আছে তা ফ্ল্যাগ করে স্কিপ করুন এবং বাকিগুলো আগে শেষ করুন।',
    },
    {
      title: 'চোখের আইকন দিয়ে সেলফ-টেস্ট',
      desc: 'কুইজ তৈরির পর চোখের চিহ্নে ক্লিক করে উত্তর লুকিয়ে রেখে নিজে উত্তর বের করার চেষ্টা করুন, এরপর আবার ক্লিক করে ব্যাখ্যা যাচাই করুন।',
    },
    {
      title: 'নেগেটিভ মার্কিং এড়ানোর কৌশল',
      desc: 'যদি ৪টি অপশনের মধ্যে নিশ্চিত ২টি অপশন বাদ দিতে পারেন, তবেই উত্তর দাগানো যুক্তিসঙ্গত; অন্যথায় না দাগানোই ভালো।',
    },
    {
      title: 'উদ্দীপক ও বহুপদী প্রশ্ন',
      desc: 'নিচের কোনটি সঠিক (i, ii ও iii) ধরনের প্রশ্নে অপশন এলিমিনেশন টেকনিক ব্যবহার করলে দ্রুততম সময়ে সঠিক উত্তরে পৌঁছানো যায়।',
    },
  ];

  return (
    <>
      {/* Floating Mascot / FAB Button on Mobile & Tablet:
          Smooth transition out when scrolling down, reappears when scrolling up or at top */}
      <div 
        className={`no-print fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 transition-all duration-300 transform ${
          isVisible 
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
            : 'opacity-0 translate-y-8 pointer-events-none scale-90'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-105 transition-all active:scale-95 border-2 border-white"
          title="মোবাইল পরীক্ষা সহযোগী খুলুন"
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white"></span>
          </div>
          <span className="text-xs font-bold font-bengali tracking-wide pr-1">
            সহযোগী
          </span>
        </button>
      </div>

      {/* Slide-up Bottom Sheet / Modal for Companion */}
      {isOpen && (
        <div 
          className="no-print fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle for mobile */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 sm:hidden shrink-0"></div>

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-base font-bengali">
                      মোবাইল পরীক্ষা সহযোগী
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      AI 🇧🇩
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bengali">
                    দ্রুত কন্ট্রোল, জাম্প ও স্টাডি হ্যাক্স
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-bengali text-slate-800 text-sm">
              {/* Question Quick Controls (If questions exist) */}
              {questions.length > 0 && currentTab === 'review_questions' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      মোট প্রশ্ন: {questions.length} টি
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleAllAnswers();
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        showAllAnswers
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-600 text-white shadow-xs'
                      }`}
                    >
                      {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAllAnswers ? 'সব উত্তর লুকান' : 'সব উত্তর দেখুন'}</span>
                    </button>
                  </div>

                  {/* Jump to question selector for mobile */}
                  {onJumpToQuestion && (
                    <div>
                      <p className="text-[11px] text-slate-500 mb-1.5">দ্রুত প্রশ্নে যান:</p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                        {questions.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              onJumpToQuestion(idx);
                              setIsOpen(false);
                            }}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 font-mono text-xs font-bold flex items-center justify-center transition-colors"
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {onStartExam && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onStartExam();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>পরীক্ষা শুরু করুন</span>
                    </button>
                  )}
                </div>
              )}

              {/* Study Tip Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 relative overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    {tips[activeTipIndex].title}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTipIndex((prev) => (prev > 0 ? prev - 1 : tips.length - 1))}
                      className="p-1 rounded-md text-amber-700 hover:bg-amber-100"
                      title="পূর্ববর্তী টিপ"
                    >
                      <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTipIndex((prev) => (prev < tips.length - 1 ? prev + 1 : 0))}
                      className="p-1 rounded-md text-amber-700 hover:bg-amber-100"
                      title="পরবর্তী টিপ"
                    >
                      <ChevronUp className="w-3.5 h-3.5 rotate-90" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {tips[activeTipIndex].desc}
                </p>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenGuide();
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>ইউজার গাইড</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenGuide();
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>পরীক্ষা সেটিংস</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 font-bengali">
              Quizify AI • সার্বক্ষণিক মোবাইল সহায়তা
            </div>
          </div>
        </div>
      )}
    </>
  );
};
