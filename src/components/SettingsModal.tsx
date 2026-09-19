import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Settings as SettingsIcon, 
  Camera, 
  Layers, 
  Eye, 
  EyeOff, 
  Clock, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  Smartphone,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSecondsPerQuestion?: number;
  onUpdateDefaultSeconds?: (secs: number) => void;
  defaultNegativeMarking?: number;
  onUpdateDefaultNegative?: (val: number) => void;
  defaultHideAnswers?: boolean;
  onUpdateDefaultHideAnswers?: (hide: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultSecondsPerQuestion = 40,
  onUpdateDefaultSeconds,
  defaultNegativeMarking = 0.25,
  onUpdateDefaultNegative,
  defaultHideAnswers = true,
  onUpdateDefaultHideAnswers,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'settings'>('guide');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              {activeTab === 'guide' ? <BookOpen className="w-5 h-5" /> : <SettingsIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-bengali">
                {activeTab === 'guide' ? 'Quizify AI ইউজার গাইড' : 'অ্যাপ সেটিংস'}
              </h3>
              <p className="text-xs text-slate-500 font-bengali">
                {activeTab === 'guide' ? 'সহজে প্রশ্ন স্ক্যান ও পূর্ণাঙ্গ CBT পরীক্ষার নির্দেশিকা' : 'আপনার পরীক্ষার পছন্দসমূহ কাস্টমাইজ করুন'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all font-bengali ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ইউজার গাইড (User Guide)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all font-bengali ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>পরীক্ষার সেটিংস (Settings)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-bengali text-slate-700">
          {activeTab === 'guide' ? (
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
                  ১
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    সঠিক ছবি তোলার নিয়ম (ফটোগ্রাফি টিপস)
                  </h4>
                  <ul className="text-xs text-emerald-900 mt-1.5 space-y-1 list-disc list-inside leading-relaxed">
                    <li>প্রশ্নপত্রের ওপর মোবাইল ক্যামেরাটি সোজা রেখে ছবি তুলুন যাতে লেখাগুলো বাঁকা না থাকে।</li>
                    <li>পর্যাপ্ত আলোতে ছবি তুলুন যেন ছোট বাংলা ফন্ট ও গাণিতিক পাওয়ার/সাবস্ক্রিপ্ট স্পষ্ট দেখা যায়।</li>
                    <li><strong>পেন্সিলের টিক বা গোল দাগ নিয়ে চিন্তা নেই:</strong> পূর্বের শিক্ষার্থীর পেন্সিলের দাগ থাকলেও AI বিজ্ঞান সূত্র দিয়ে নিজে সঠিক উত্তর সমাধান করে নেয়।</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
                  ২
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-700" />
                    একাধিক ছবি আপলোড (মাল্টি-পেজ টেস্ট পেপার)
                  </h4>
                  <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                    একটি টেস্ট পেপারের একাধিক পৃষ্ঠা থাকলে <strong>+ আরও ছবি যোগ করুন</strong> বাটনে চাপ দিয়ে একসাথে সর্বোচ্চ ৮টি পৃষ্ঠার ছবি আপলোড করতে পারেন। AI কোনো প্রশ্ন বাদ না দিয়ে সব কটি পৃষ্ঠার ৩০-৫০টি প্রশ্ন এক সাথে এক্সট্র্যাক্ট করে একটি কুইজে সাজিয়ে দেবে।
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
                  ৩
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-700" />
                    চোখের আইকন দিয়ে উত্তর লুকানো ও সেলফ প্র্যাকটিস
                  </h4>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    প্রশ্নপত্র এক্সট্র্যাক্ট হওয়ার পর ডিফল্টভাবে সব উত্তর <strong>হাইড (লুকানো)</strong> থাকে যাতে আপনি নিজে নিজে চিন্তা করতে পারেন। যেকোনো প্রশ্নের পাশে থাকা <strong>চোখের মতো চিহ্নে</strong> ক্লিক করলে তাৎক্ষণিক সঠিক উত্তর ও ব্যাখ্যা দেখতে পারবেন। এছাড়াও উপরে <strong>সব উত্তর দেখুন / লুকান</strong> বাটনে ক্লিক করে এক ট্যাপেই সব উত্তর কন্ট্রোল করতে পারেন।
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
                  ৪
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-700" />
                    রিয়েল CBT মোড বনাম প্র্যাকটিস মোড
                  </h4>
                  <ul className="text-xs text-purple-900 mt-1.5 space-y-1 list-disc list-inside leading-relaxed">
                    <li><strong>রিয়েল CBT মোড:</strong> মেডিকেল বা বুয়েটের মতো রিয়েল টাইমার ও -০.২৫ নেগেটিভ মার্কিং সহ পরীক্ষা হবে। পরীক্ষা শেষে পূর্ণাঙ্গ মেরিট স্কোর ও পার্সেন্টাইল রিপোর্ট পাওয়া যাবে।</li>
                    <li><strong>অনুশীলন মোড (Practice Mode):</strong> প্রতিটি প্রশ্নের উত্তর দেওয়ার সাথে সাথেই সঠিক উত্তর ও ব্যাখ্যা দেখা যাবে।</li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-100 border border-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
                  ৫
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-slate-700" />
                    অফলাইন প্রিন্ট ও ওএমআর (OMR) শিট
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    উপরে থাকা <strong>প্রশ্নপত্র ভিউ</strong> বাটনে ক্লিক করে বোর্ড পরীক্ষার মতো দুই কলামের প্রশ্নপত্র এবং ওএমআর বাবল শিট তৈরি করে সরাসরি প্রিন্ট করতে পারেন অথবা PDF হিসেবে সংরক্ষণ করতে পারেন।
                  </p>
                </div>
              </div>

              {/* Mobile Friendly Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Quizify AI পুরোপুরি মোবাইল ফ্রেন্ডলি। মোবাইলে স্ক্রিনের নিচে থাকা <strong>পরীক্ষা সহযোগী</strong> আইকন ব্যবহার করে সব শর্টকাট সহজে ব্যবহার করুন।</span>
              </div>
            </div>
          ) : (
            /* Settings Tab */
            <div className="space-y-6">
              {/* Default Time Per Question */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  প্রতি প্রশ্নে ডিফল্ট বরাদ্দকৃত সময়
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  পরীক্ষার জন্য স্বাভাবিকভাবে প্রতি প্রশ্নে কত সেকেন্ড সময় বরাদ্দ রাখবেন
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 40, 45, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => onUpdateDefaultSeconds?.(sec)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                        defaultSecondsPerQuestion === sec
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sec} সে {sec === 40 && '(স্ট্যান্ডার্ড)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Negative Marking */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  ডিফল্ট নেগেটিভ মার্কিং
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  ভুল উত্তরের জন্য নম্বর কর্তন নীতি
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0.25, label: '-০.২৫ (মেডিকেল/ভার্সিটি)' },
                    { val: 0.20, label: '-০.২০ (প্রকৌশল/গুচ্ছ)' },
                    { val: 0.00, label: '০.০০ (HSC বোর্ড)' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => onUpdateDefaultNegative?.(item.val)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                        defaultNegativeMarking === item.val
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Hide Answer Behavior */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  কুইজ তৈরির পর উত্তরের ডিফল্ট অবস্থা
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  প্রশ্ন স্ক্যান শেষে প্রশ্নপত্রে কি উত্তর দেখা যাবে নাকি গোপন থাকবে
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateDefaultHideAnswers?.(true)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      defaultHideAnswers
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>উত্তর লুকানো থাকবে (অনুরোধকৃত)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateDefaultHideAnswers?.(false)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      !defaultHideAnswers
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>উত্তর উন্মুক্ত থাকবে</span>
                  </button>
                </div>
              </div>

              {/* System info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Quizify AI v2.2 (Bangladeshi Curriculum Edition)</p>
                <p>LaTeX Math Engine: KaTeX 0.18 • AI Vision: Gemini 2.5 Flash</p>
                <p>সব সেটিংস আপনার ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors font-bengali"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
