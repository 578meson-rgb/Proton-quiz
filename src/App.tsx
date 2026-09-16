import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { QuestionReviewList } from './components/QuestionReviewList';
import { CbtExamRoom } from './components/CbtExamRoom';
import { ExamResults } from './components/ExamResults';
import { PrintableQuestionPaper } from './components/PrintableQuestionPaper';
import { MCQQuestion, SubjectType, ExamSettings, ExamSubmission } from './types';
import { SAMPLE_PACKS } from './data/sampleQuestions';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'upload' | 'review_questions' | 'cbt' | 'results' | 'print'>('upload');
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [subject, setSubject] = useState<SubjectType>('Physics');
  const [rawImage, setRawImage] = useState<string | undefined>(undefined);
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    title: 'HSC & Admission CBT Model Test',
    durationMinutes: 15,
    durationSeconds: 15 * 60,
    secondsPerQuestion: 45,
    negativeMarking: 0.25,
    marksPerQuestion: 1.0,
    passPercentage: 40,
    shuffleQuestions: false,
    mode: 'cbt_exam',
  });
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);

  // When image OCR extraction succeeds
  const handleExtractionSuccess = (
    extractedQuestions: MCQQuestion[],
    detectedSubject: SubjectType,
    imageSrc?: string
  ) => {
    const totalSecs = extractedQuestions.length * 45;
    setQuestions(extractedQuestions);
    setSubject(detectedSubject);
    setRawImage(imageSrc);
    setExamSettings((prev) => ({
      ...prev,
      title: `${detectedSubject} - লাইভ CBT মডেল টেস্ট`,
      secondsPerQuestion: 45,
      durationSeconds: totalSecs,
      durationMinutes: Math.round((totalSecs / 60) * 10) / 10,
    }));
    setCurrentTab('review_questions');
  };

  // When user clicks a built-in demo question pack
  const handleSelectSamplePack = (packId: string) => {
    const pack = SAMPLE_PACKS.find((p) => p.id === packId);
    if (!pack) return;

    const totalSecs = pack.questions.length * 45;
    setQuestions(pack.questions);
    setSubject(pack.subject);
    setRawImage(undefined);
    setExamSettings((prev) => ({
      ...prev,
      title: `${pack.nameBn} (মডেল টেস্ট)`,
      secondsPerQuestion: 45,
      durationSeconds: totalSecs,
      durationMinutes: Math.round((totalSecs / 60) * 10) / 10,
    }));
    setCurrentTab('review_questions');
  };

  // When user clicks "Start CBT Exam" from the review screen
  const handleStartExam = (settings: ExamSettings, finalQuestions: MCQQuestion[]) => {
    let orderedQuestions = [...finalQuestions];
    if (settings.shuffleQuestions) {
      orderedQuestions = orderedQuestions.sort(() => Math.random() - 0.5);
    }
    setQuestions(orderedQuestions);
    setExamSettings(settings);
    setCurrentTab('cbt');
  };

  // When user finishes & submits the CBT exam
  const handleSubmitExam = (finalSubmission: ExamSubmission) => {
    setSubmission(finalSubmission);
    setCurrentTab('results');
  };

  // Retake exam
  const handleRetake = () => {
    if (examSettings.shuffleQuestions) {
      setQuestions((prev) => [...prev].sort(() => Math.random() - 0.5));
    }
    setSubmission(null);
    setCurrentTab('cbt');
  };

  // Reset all to clean state
  const handleResetAll = () => {
    if (confirm('আপনি কি নতুন ছবি আপলোড বা শুরু করতে চান? বর্তমান প্রশ্ন এবং ফলাফল রিসেট হবে।')) {
      setQuestions([]);
      setSubmission(null);
      setRawImage(undefined);
      setCurrentTab('upload');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-bengali selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header / Navigation */}
      {currentTab !== 'cbt' && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          hasQuestions={questions.length > 0}
          questionCount={questions.length}
          hasExamResults={Boolean(submission)}
          onResetAll={handleResetAll}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'upload' && (
          <ImageUploader
            onExtractionSuccess={handleExtractionSuccess}
            onSelectSamplePack={handleSelectSamplePack}
          />
        )}

        {currentTab === 'review_questions' && questions.length > 0 && (
          <QuestionReviewList
            questions={questions}
            subject={subject}
            rawImage={rawImage}
            onStartExam={handleStartExam}
            onUpdateQuestions={setQuestions}
          />
        )}

        {currentTab === 'cbt' && questions.length > 0 && (
          <CbtExamRoom
            questions={questions}
            settings={examSettings}
            onSubmitExam={handleSubmitExam}
            onExitExam={() => setCurrentTab('review_questions')}
          />
        )}

        {currentTab === 'results' && submission && (
          <ExamResults
            questions={questions}
            settings={examSettings}
            submission={submission}
            onRetake={handleRetake}
            onNewExam={handleResetAll}
            onOpenPrintView={() => setCurrentTab('print')}
          />
        )}

        {currentTab === 'print' && questions.length > 0 && (
          <PrintableQuestionPaper
            questions={questions}
            settings={examSettings}
            onBack={() => setCurrentTab(submission ? 'results' : 'review_questions')}
          />
        )}
      </main>

      {/* Footer (Hidden during CBT and print) */}
      {currentTab !== 'cbt' && (
        <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Quizify AI 🇧🇩 • বাংলাদেশি শিক্ষার্থীদের জন্য নির্ভুল প্রশ্নপত্র ও সিবিটি সিস্টেম
            </p>
            <p className="text-slate-400">
              HSC পদার্থ • রসায়ন • উচ্চতর গণিত • জীববিজ্ঞান • বুয়েট ও মেডিকেল ভর্তি প্রশ্নব্যাংক
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
