import React from 'react';
  import { 
  Sparkles, 
  BrainCircuit, 
  Layers, 
  Printer, 
  BookOpen, 
  UploadCloud,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'upload' | 'review_questions' | 'cbt' | 'results' | 'print';
  onSelectTab: (tab: 'upload' | 'review_questions' | 'cbt' | 'results' | 'print') => void;
  hasQuestions: boolean;
  questionCount: number;
  hasExamResults: boolean;
  onResetAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  hasQuestions,
  questionCount,
  hasExamResults,
  onResetAll,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('upload')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Quizify <span className="text-emerald-600">AI</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  HSC & Admission 🇧🇩
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Gemini AI Active
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-bengali">
                ফটোগ্রাফি থেকে সরাসরি লাইভ সিবিটি এক্সাম জেনারেটর
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-tab-upload"
              onClick={() => onSelectTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'upload'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden md:inline font-bengali">স্ক্যানার ও প্রশ্ন</span>
              <span className="md:hidden">Upload</span>
            </button>

            {hasQuestions && (
              <button
                id="nav-tab-review"
                onClick={() => onSelectTab('review_questions')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'review_questions'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden md:inline font-bengali">প্রশ্নসমূহ ({questionCount})</span>
                <span className="md:hidden">Questions ({questionCount})</span>
              </button>
            )}

            {hasQuestions && (
              <button
                id="nav-tab-cbt"
                onClick={() => onSelectTab('cbt')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentTab === 'cbt'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-bengali">লাইভ CBT পরীক্ষা</span>
              </button>
            )}

            {hasExamResults && (
              <button
                id="nav-tab-results"
                onClick={() => onSelectTab('results')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'results'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline font-bengali">ফলাফল ও সমাধান</span>
                <span className="md:hidden">Results</span>
              </button>
            )}

            {hasQuestions && (
              <button
                id="nav-tab-print"
                onClick={() => onSelectTab('print')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'print'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Printable Question Paper & OMR"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden lg:inline font-bengali">প্রশ্নপত্র ভিউ</span>
              </button>
            )}

            {hasQuestions && (
              <button
                id="nav-reset-btn"
                onClick={onResetAll}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="নতুন ছবি আপলোড বা রিসেট করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
