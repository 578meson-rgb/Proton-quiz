import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  BookMarked,
  Eraser,
  Eye
} from 'lucide-react';
import { SubjectType, MCQQuestion } from '../types';
import { SAMPLE_PACKS } from '../data/sampleQuestions';

interface ImageUploaderProps {
  onExtractionSuccess: (questions: MCQQuestion[], subject: SubjectType, rawImage?: string) => void;
  onSelectSamplePack: (packId: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onExtractionSuccess,
  onSelectSamplePack,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subjectHint, setSubjectHint] = useState<string>('Auto-detect');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste support (e.g. Ctrl+V screenshots)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          processFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const compressAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Helper for FileReader fallback if ObjectURL or Image fails
      const fallbackWithFileReader = () => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      };

      try {
        // Fast Object URL decoding avoids allocating massive base64 strings in memory
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        // Safety timer: fallback after 2.5s
        const safetyTimer = setTimeout(() => {
          try { URL.revokeObjectURL(objectUrl); } catch {}
          fallbackWithFileReader();
        }, 2500);

        img.onload = () => {
          clearTimeout(safetyTimer);
          try {
            URL.revokeObjectURL(objectUrl);
            // 1400px max dimension: preserves crisp Bengali script & complex math without bloating payload
            const MAX_DIM = 1400;
            let width = img.width;
            let height = img.height;

            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              fallbackWithFileReader();
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to ~150KB JPEG for sub-second network transfer and instant AI vision recognition
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressed);
          } catch {
            fallbackWithFileReader();
          }
        };

        img.onerror = () => {
          clearTimeout(safetyTimer);
          try { URL.revokeObjectURL(objectUrl); } catch {}
          fallbackWithFileReader();
        };

        img.src = objectUrl;
      } catch {
        fallbackWithFileReader();
      }
    });
  };

  const processFile = async (file: File) => {
    // Some mobile cameras produce empty file.type or image/heic
    const isImage =
      file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|heic|heif|bmp|gif)$/i.test(file.name);

    if (!isImage) {
      setErrorMsg('অনুগ্রহ করে একটি বৈধ ইমেজ ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);

    try {
      const optimized = await compressAndResizeImage(file);
      setPreviewUrl(optimized);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartExtraction = async () => {
    if (!previewUrl) {
      setErrorMsg('প্রথমে একটি প্রশ্নপত্রের ছবি আপলোড করুন অথবা ক্যামেরা দিয়ে ছবি তুলুন।');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCurrentStep(1);

    // Simulated progress steps for smooth user feedback
    const stepTimer1 = setTimeout(() => setCurrentStep(2), 1200);
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 2600);
    const stepTimer3 = setTimeout(() => setCurrentStep(4), 4200);

    try {
      const response = await fetch('/api/extract-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
          mimeType: 'image/jpeg',
          subjectHint: subjectHint === 'Auto-detect' ? undefined : subjectHint,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!response.ok) {
        let serverErrorText = '';
        try {
          const errorData = await response.json();
          serverErrorText = errorData.error || errorData.message || '';
        } catch {
          if (response.status === 413) {
            serverErrorText = 'ছবির ফাইল সাইজ অতিরিক্ত বড় ছিল।';
          } else if (response.status === 502 || response.status === 503 || response.status === 504) {
            serverErrorText = 'AI সার্ভারে সাময়িক বিলম্ব হয়েছে। নিচে সরাসরি প্রশ্নপত্র লোড করে এখনই পরীক্ষা দিন।';
          } else {
            serverErrorText = 'সার্ভার সংযোগে সাময়িক বিলম্ব হয়েছে।';
          }
        }
        throw new Error(serverErrorText || 'MCQ এক্সট্রাকশন সম্পন্ন করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
      }

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('ছবিটিতে কোনো প্রশ্ন সনাক্ত করা যায়নি। অনুগ্রহ করে স্পষ্ট আলোর ছবি আপলোড করুন অথবা নিচের ডেমো সেট দিয়ে পরীক্ষা শুরু করুন।');
      }

      onExtractionSuccess(data.questions, data.detectedSubject || 'Physics', previewUrl);
    } catch (err: any) {
      console.error('Extraction error:', err);
      let rawMsg = err?.message || 'সার্ভার সংযোগে ত্রুটি হয়েছে।';
      
      // Parse nested JSON if present
      try {
        const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.error?.message) {
            rawMsg = parsed.error.message;
          } else if (parsed.error) {
            rawMsg = parsed.error;
          }
        }
      } catch {
        // Ignored
      }

      if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
        rawMsg = 'AI সার্ভারে সাময়িক উচ্চ ট্রাফিকের চাপ রয়েছে। আপনি সরাসরি নিচের বাটন দিয়ে প্রমিত পরীক্ষা শুরু করতে পারেন।';
      }

      setErrorMsg(rawMsg);
    } finally {
      setIsLoading(false);
      setCurrentStep(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-10">
      {/* Hero Header - Scaled & Streamlined for Mobile */}
      <div className="text-center mb-5 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
          <span>স্মার্ট বাংলাদেশি MCQ এক্সট্রাক্টর ও CBT ইঞ্জিন</span>
        </div>
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-bengali leading-snug sm:leading-tight">
          প্রশ্নপত্রের ছবি তুলুন, সরাসরি দিন <span className="text-emerald-600">লাইভ CBT পরীক্ষা</span>
        </h1>
        <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-sm lg:text-base text-slate-600 max-w-xl mx-auto font-bengali leading-relaxed px-1">
          হাতে লেখা নোট, টিক মার্ক বা কাটাকুটি বাদ দিয়ে অবিকল বাংলা হরফ ও গাণিতিক সমীকরণ বজায় রেখে তৈরি করুন স্বয়ংক্রিয় কুইজ।
        </p>

        {/* Compact Feature Badges */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs text-slate-600">
          <div className="flex items-center gap-1 bg-white px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-slate-200 shadow-2xs">
            <Eraser className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bengali">রাফ হিসাব ফিল্টার</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-slate-200 shadow-2xs">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bengali">LaTeX ও সমীকরণ অক্ষত</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bengali">নেগেটিভ মার্কিং CBT</span>
          </div>
        </div>
      </div>

      {/* Main Upload / Drag & Drop Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
        {/* Subject Filter Bar */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700">
            <BookMarked className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bengali">বিষয় নির্বাচন (ঐচ্ছিক):</span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {[
              { id: 'Auto-detect', label: 'অটো-ডিটেক্ট' },
              { id: 'Physics', label: 'পদার্থবিজ্ঞান' },
              { id: 'Chemistry', label: 'রসায়ন' },
              { id: 'Higher Math', label: 'উচ্চতর গণিত' },
              { id: 'Biology', label: 'জীববিজ্ঞান' },
              { id: 'Admission', label: 'ভর্তি পরীক্ষা' },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubjectHint(sub.id)}
                className={`text-[11px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors font-bengali ${
                  subjectHint === sub.id
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Dropzone */}
        {!previewUrl ? (
          <div
            id="dropzone-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 sm:p-8 lg:p-10 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-bengali">
              প্রশ্নপত্রের ছবি ড্র্যাগ করুন অথবা ক্লিক করে আপলোড করুন
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-bengali max-w-sm mx-auto">
              JPG, PNG, WebP • মোবাইল ক্যামেরা বা স্ক্রিনশট পেস্ট (Ctrl+V) সমর্থিত
            </p>

            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                id="btn-upload-file"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>ফাইল সিলেক্ট করুন</span>
              </button>

              <button
                type="button"
                id="btn-camera-capture"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>ক্যামেরা দিয়ে ছবি তুলুন</span>
              </button>
            </div>
          </div>
        ) : (
          /* Image Preview & Extraction Controls */
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-[420px] flex items-center justify-center p-2">
              <img
                src={previewUrl}
                alt="Uploaded Bangladeshi Exam Sheet"
                className="max-h-[400px] w-auto object-contain rounded-lg shadow-xs"
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setErrorMsg(null);
                }}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-xs transition-all font-bengali"
              >
                ছবি পরিবর্তন করুন
              </button>
            </div>

            {/* Action Button & Extraction Pipeline Status */}
            {!isLoading ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-sm text-slate-600 font-bengali">
                  নির্বাচিত বিষয়: <span className="font-semibold text-slate-800">{subjectHint}</span>
                  {selectedFile && ` • আকার: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                </div>

                <button
                  type="button"
                  id="btn-start-extraction"
                  onClick={handleStartExtraction}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-base font-bengali"
                >
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>MCQ এক্সট্রাক্ট করুন ও CBT শুরু করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Animated Pipeline Progress */
              <div className="py-6 px-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="text-center mb-5">
                  <div className="inline-block animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
                  <h4 className="text-base font-bold text-slate-900 font-bengali">
                    Quizify AI প্রশ্নপত্র বিশ্লেষণ করছে...
                  </h4>
                  <p className="text-xs text-slate-500 font-bengali">
                    উচ্চতর নিখুঁততার জন্য বাংলা টেক্সট ও LaTeX সমীকরণ নির্ভুলভাবে রূপান্তর করা হচ্ছে
                  </p>
                </div>

                {/* Step Indicators */}
                <div className="space-y-2.5 max-w-md mx-auto text-xs sm:text-sm">
                  {[
                    { step: 1, label: '১. বাংলা হরফ ও উদ্দীপক বিশ্লেষণ করা হচ্ছে' },
                    { step: 2, label: '২. শিক্ষার্থীর রাফ নোট, পেন্সিলের দাগ ও ওয়াটারমার্ক অপসারণ' },
                    { step: 3, label: '৩. পদার্থ ও গণিতের LaTeX সমীকরণ ও একক সংরক্ষণ' },
                    { step: 4, label: '৪. স্ট্যান্ডার্ড CBT ডেটাবেজ ও নির্ভুল উত্তরপত্র তৈরি' },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-bengali ${
                        currentStep > item.step
                          ? 'bg-white text-emerald-700 font-medium shadow-2xs'
                          : currentStep === item.step
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : 'text-slate-400'
                      }`}
                    >
                      {currentStep > item.step ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : currentStep === item.step ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      )}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Alert with Actionable Recovery */}
        {errorMsg && (
          <div className="mt-5 p-4 sm:p-5 rounded-xl bg-amber-50/90 border border-amber-200 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold font-bengali text-slate-900">এক্সট্রাকশনে সাময়িক বিঘ্ন ঘটেছে</p>
                <p className="font-bengali text-slate-700 text-xs sm:text-sm mt-0.5">{errorMsg}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
              {/* Instant Start CBT Exam - student is never blocked! */}
              <button
                type="button"
                id="btn-error-instant-cbt"
                onClick={() => {
                  const targetPack = subjectHint === 'Higher Math'
                    ? 'hsc-student-upload-mock'
                    : subjectHint === 'Chemistry'
                    ? 'chem-organic-reactions'
                    : subjectHint === 'Biology'
                    ? 'bio-genetics-botany'
                    : 'physics-circuits-magnetism';
                  onSelectSamplePack(targetPack);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-xs font-bengali"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>তাৎক্ষণিক CBT টেস্ট শুরু করুন</span>
              </button>

              {previewUrl && (
                <button
                  type="button"
                  id="btn-error-retry"
                  onClick={handleStartExtraction}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 font-bengali"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>পুনরায় চেষ্টা করুন</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Built-in Sample Exam Question Packs for Instant Testing */}
      <div className="mt-6 sm:mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 font-bengali">
              অথবা সরাসরি ডেমো প্রশ্নপত্র দিয়ে টেস্ট করুন:
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-bengali">
              বোর্ড ও ভর্তি পরীক্ষার আসল প্রশ্ন দিয়ে তাৎক্ষণিকভাবে CBT পরখ করুন
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200">
            {SAMPLE_PACKS.length} টি প্রস্তুতকৃত সেট
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_PACKS.map((pack) => (
            <div
              key={pack.id}
              id={`sample-card-${pack.id}`}
              onClick={() => onSelectSamplePack(pack.id)}
              className="group bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all p-4 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                    {pack.subject}
                  </span>
                  <span className="text-emerald-600 font-medium">
                    {pack.questionCount} টি MCQ
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm font-bengali">
                  {pack.nameBn}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-bengali">
                  {pack.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 font-bengali">
                <span>সিবিটি লোড করুন</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
