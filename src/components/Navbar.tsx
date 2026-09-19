import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Layers, 
  Printer, 
  BookOpen, 
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Settings,
  Menu,
  X,
  Play
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'upload' | 'review_questions' | 'cbt' | 'results' | 'print';
  onSelectTab: (tab: 'upload' | 'review_questions' | 'cbt' | 'results' | 'print') => void;
  hasQuestions: boolean;
  questionCount: number;
  hasExamResults: boolean;
  onResetAll: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  hasQuestions,
  questionCount,
  hasExamResults,
  onResetAll,
  onOpenSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleTabClick = (tab: 'upload' | 'review_questions' | 'cbt' | 'results' | 'print') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Navbar Top Row */}
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" 
            onClick={() => handleTabClick('upload')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200 shrink-0">
              <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
                  Quizify <span className="text-emerald-600">AI</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  HSC 🇧🇩
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-bengali truncate">
                ফটোগ্রাফি থেকে সরাসরি লাইভ CBT এক্সাম জেনারেটর
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (>= md) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              id="nav-tab-upload"
              type="button"
              onClick={() => handleTabClick('upload')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'upload'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span className="font-bengali">আপলোড</span>
            </button>

            {hasQuestions && (
              <button
                id="nav-tab-review"
                type="button"
                onClick={() => handleTabClick('review_questions')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'review_questions'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="font-bengali">প্রশ্নসমূহ ({questionCount})</span>
              </button>
            )}

            {hasQuestions && (
              <button
                id="nav-tab-cbt"
                type="button"
                onClick={() => handleTabClick('cbt')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
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
                type="button"
                onClick={() => handleTabClick('results')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'results'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bengali">ফলাফল</span>
              </button>
            )}

            {hasQuestions && (
              <button
                id="nav-tab-print"
                type="button"
                onClick={() => handleTabClick('print')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'print'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Printable Question Paper & OMR"
              >
                <Printer className="w-4 h-4" />
                <span className="font-bengali">প্রশ্নপত্র ভিউ</span>
              </button>
            )}

            {/* Settings & User Guide Button */}
            {onOpenSettings && (
              <button
                type="button"
                id="nav-settings-btn"
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors border border-transparent hover:border-emerald-200"
                title="সেটিংস ও ইউজার গাইড"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="font-bengali">গাইড ও সেটিংস</span>
              </button>
            )}

            {/* Reset All */}
            {hasQuestions && (
              <button
                id="nav-reset-btn"
                type="button"
                onClick={onResetAll}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                title="নতুন প্রশ্ন স্ক্যান / রিসেট"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </nav>

          {/* Mobile Right Controls: Guide & Hamburger (< md) */}
          <div className="flex md:hidden items-center gap-1">
            {onOpenSettings && (
              <button
                type="button"
                id="mobile-btn-guide-quick"
                onClick={onOpenSettings}
                className="p-2 text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-bold font-bengali"
                title="ইউজার গাইড ও সেটিংস"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>গাইড</span>
              </button>
            )}

            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="মোবাইল মেনু"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Bar (guarantees 100% visibility on all phones) */}
      <div className="md:hidden border-t border-slate-200/80 bg-slate-50/90 px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            type="button"
            onClick={() => handleTabClick('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all font-bengali ${
              currentTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>আপলোড</span>
          </button>

          {hasQuestions && (
            <button
              type="button"
              onClick={() => handleTabClick('review_questions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all font-bengali ${
                currentTab === 'review_questions'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>প্রশ্ন ({questionCount})</span>
            </button>
          )}

          {hasQuestions && (
            <button
              type="button"
              onClick={() => handleTabClick('cbt')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all font-bengali ${
                currentTab === 'cbt'
                  ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <Play className="w-3 h-3 fill-current text-emerald-700" />
              <span>CBT পরীক্ষা</span>
            </button>
          )}

          {hasExamResults && (
            <button
              type="button"
              onClick={() => handleTabClick('results')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all font-bengali ${
                currentTab === 'results'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ফলাফল</span>
            </button>
          )}

          {hasQuestions && (
            <button
              type="button"
              onClick={() => handleTabClick('print')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all font-bengali ${
                currentTab === 'print'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট ভিউ</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 font-bengali"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>সেটিংস</span>
            </button>
          )}

          {hasQuestions && (
            <button
              type="button"
              onClick={onResetAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 font-bengali"
              title="রিসেট"
            >
              <RefreshCw className="w-3 h-3" />
              <span>রিসেট</span>
            </button>
          )}
        </div>
      </div>

      {/* Full Expandable Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 shadow-xl space-y-2 font-bengali animate-in slide-in-from-top-2 duration-150">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            ন্যাভিগেশন ও ফিচারসমূহ
          </div>

          <button
            type="button"
            onClick={() => handleTabClick('upload')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-bold transition-colors ${
              currentTab === 'upload' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <div>প্রশ্ন আপলোড ও ক্যামেরা স্ক্যানার</div>
              <p className="text-xs text-slate-500 font-normal">টেস্ট পেপারের ছবি থেকে স্বয়ংক্রিয় প্রশ্ন রূপান্তর</p>
            </div>
          </button>

          {hasQuestions && (
            <button
              type="button"
              onClick={() => handleTabClick('review_questions')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                currentTab === 'review_questions' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div>এক্সট্রাক্টকৃত প্রশ্ন তালিকা ({questionCount} টি)</div>
                <p className="text-xs text-slate-500 font-normal">উত্তর দেখা বা গোপন করে সেলফ প্র্যাকটিস ও এডিট</p>
              </div>
            </button>
          )}

          {hasQuestions && (
            <button
              type="button"
              onClick={() => handleTabClick('cbt')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                currentTab === 'cbt' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div>লাইভ CBT পরীক্ষা মোড</div>
                <p className={`text-xs font-normal ${currentTab === 'cbt' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                  টাইমার, নেগেটিভ মার্কিং ও OMR বাবল সহ লাইভ এক্সাম
                </p>
              </div>
            </button>
          )}

          {hasExamResults && (
            <button
              type="button"
              onClick={() => handleTabClick('results')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                currentTab === 'results' ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div>পরীক্ষার ফলাফল ও পূর্ণাঙ্গ সমাধান</div>
                <p className="text-xs text-slate-500 font-normal">মার্কশিট, ভুল-সঠিক বিশ্লেষণ ও বিশদ ব্যাখ্যা</p>
              </div>
            </button>
          )}

          {hasQuestions && (
            <button
              type="button"
              onClick={() => handleTabClick('print')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                currentTab === 'print' ? 'bg-slate-100 text-slate-900 border border-slate-300' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div>প্রিন্ট ও PDF প্রশ্নপত্র ভিউ</div>
                <p className="text-xs text-slate-500 font-normal">অফলাইন পরীক্ষার জন্য প্রিন্ট উপযোগী পেপার ও OMR শিট</p>
              </div>
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-bold text-slate-700 hover:bg-slate-50 border border-slate-100"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div>ইউজার গাইড ও সেটিংস</div>
                <p className="text-xs text-slate-500 font-normal">ছবি তোলার নির্দেশিকা, মাল্টি-পেজ টিপস ও ডিফল্ট কনফিগ</p>
              </div>
            </button>
          )}

          {hasQuestions && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onResetAll();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm font-bold text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 mt-2"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <div>নতুন পরীক্ষা / রিসেট</div>
                <p className="text-xs text-rose-600 font-normal">সব ডাটা ক্লিয়ার করে নতুন টেস্ট পেপার আপলোড করুন</p>
              </div>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
