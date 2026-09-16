import React, { useState } from 'react';
import { Printer, ArrowLeft, Eye, EyeOff, FileDown } from 'lucide-react';
import { MCQQuestion, ExamSettings } from '../types';
import { MathRenderer } from './MathRenderer';

interface PrintableQuestionPaperProps {
  questions: MCQQuestion[];
  settings: ExamSettings;
  onBack: () => void;
}

export const PrintableQuestionPaper: React.FC<PrintableQuestionPaperProps> = ({
  questions,
  settings,
  onBack,
}) => {
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [showOmr, setShowOmr] = useState<boolean>(true);

  // Bengali numerals
  const toBanglaNum = (num: number): string => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
      .toString()
      .split('')
      .map((d) => banglaDigits[parseInt(d, 10)] ?? d)
      .join('');
  };

  const formatExamDuration = () => {
    const totalSecs = settings.durationSeconds || Math.round(settings.durationMinutes * 60);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    if (m > 0 && s > 0) {
      return `${toBanglaNum(m)} মিনিট ${toBanglaNum(s)} সেকেন্ড`;
    } else if (m > 0) {
      return `${toBanglaNum(m)} মিনিট`;
    } else {
      return `${toBanglaNum(s)} সেকেন্ড`;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-bengali">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              showAnswers
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAnswers ? 'উত্তর ও সমাধান লুকান' : 'উত্তর ও সমাধান দেখান'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOmr(!showOmr)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              showOmr
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            {showOmr ? 'OMR শিট অন্তর্ভুক্ত' : 'OMR শিট ছাড়া'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / PDF সেভ করুন</span>
          </button>
        </div>
      </div>

      {/* The Printable Examination Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Authentic Exam Header */}
        <div className="text-center pb-6 mb-6 border-b-2 border-slate-900">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-wide">
            {settings.title}
          </h1>
          <p className="text-sm font-bold text-slate-800 mt-1">
            বিষয়: {questions[0]?.subject || 'সাধারণ বিজ্ঞান'} (বহুনির্বাচনি অভীক্ষা)
          </p>

          <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-800 mt-3 px-2">
            <span>সময়: {formatExamDuration()} (প্রতি প্রশ্ন {toBanglaNum(settings.secondsPerQuestion || 45)} সেকেন্ড)</span>
            <span className="font-bold">বিষয় কোড: ১৭৪</span>
            <span>পূর্ণমান: {toBanglaNum(questions.length)}</span>
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-left text-xs text-slate-700 leading-relaxed print:bg-transparent">
            <strong>বিশেষ দ্রষ্টব্য:</strong> সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত সংশ্লিষ্ট বৃত্তটি কালো কালির বল পয়েন্ট কলম দ্বারা ভরাট করো। প্রতিটি প্রশ্নের মান ১।
            {settings.negativeMarking > 0 && ` প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যাবে।`}
          </div>
        </div>

        {/* Questions in 2 Columns (or 1 on small screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm text-slate-900">
          {questions.map((q, idx) => (
            <div key={q.id} className="break-inside-avoid pb-3 border-b border-slate-200">
              {/* Stem / Context if present */}
              {q.context && (
                <div className="mb-1.5 text-xs text-slate-700 italic">
                  <strong>উদ্দীপক:</strong> <MathRenderer content={q.context} />
                </div>
              )}

              {/* Question Text */}
              <div className="font-bold text-slate-950 mb-2">
                <span className="mr-1">{toBanglaNum(idx + 1)}.</span>
                <MathRenderer content={q.question} />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {q.options.map((opt) => {
                  const isCorrect = opt.id === q.correctOptionId;
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-start gap-1.5 ${
                        showAnswers && isCorrect ? 'font-black text-emerald-800 underline' : 'text-slate-800'
                      }`}
                    >
                      <span className="font-bold">({opt.label})</span>
                      <div>
                        <MathRenderer content={opt.text} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Solution in Solution Sheet Mode */}
              {showAnswers && q.explanation && (
                <div className="mt-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded text-xs text-emerald-950 print:bg-transparent">
                  <span className="font-bold">উত্তর: {q.options.find((o) => o.id === q.correctOptionId)?.label}</span>
                  <p className="mt-0.5"><MathRenderer content={q.explanation} /></p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Authentic OMR Sheet Section at Bottom */}
        {showOmr && (
          <div className="mt-12 pt-6 border-t-2 border-slate-800 break-before-page">
            <div className="text-center mb-4">
              <h2 className="text-base font-bold text-slate-900">
                বহুনির্বাচনি উত্তরপত্র (OMR SHEET)
              </h2>
              <p className="text-xs text-slate-500">
                বৃত্তগুলি কালো বলপয়েন্ট কলম দিয়ে সম্পূর্ণ ভরাট করুন
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex items-center gap-2 p-1.5 border border-slate-200 rounded-lg">
                  <span className="w-5 font-bold text-slate-700 text-right">
                    {toBanglaNum(idx + 1)}
                  </span>
                  <div className="flex gap-1.5">
                    {['ক', 'খ', 'গ', 'ঘ'].map((label) => (
                      <span
                        key={label}
                        className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
