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
  Eye,
  Plus,
  Trash2,
  Images,
  Clock
} from 'lucide-react';
import { SubjectType, MCQQuestion } from '../types';
import { SAMPLE_PACKS } from '../data/sampleQuestions';

interface UploadedImageItem {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
}

interface ImageUploaderProps {
  onExtractionSuccess: (questions: MCQQuestion[], subject: SubjectType, rawImage?: string) => void;
  onSelectSamplePack: (packId: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onExtractionSuccess,
  onSelectSamplePack,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);
  const [subjectHint, setSubjectHint] = useState<SubjectType | 'Auto-detect'>('Auto-detect');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Active timer during extraction so students see real-time progress
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  // Clipboard paste support (e.g. Ctrl+V screenshots)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'));
        if (files.length > 0) {
          processFiles(files);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadedImages]);

  const compressAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const fallbackWithFileReader = () => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      };

      try {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        const safetyTimer = setTimeout(() => {
          try { URL.revokeObjectURL(objectUrl); } catch {}
          fallbackWithFileReader();
        }, 3000);

        img.onload = () => {
          clearTimeout(safetyTimer);
          try {
            URL.revokeObjectURL(objectUrl);
            // 2000px max dimension: ensures small Bengali font, sub-indices, fractions & 2-column question sheets stay pin-sharp
            const MAX_DIM = 2000;
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

            // High clarity compression for full-page Bengali exam papers
            const compressed = canvas.toDataURL('image/jpeg', 0.88);
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

  const processFiles = async (files: File[]) => {
    const validImageFiles = files.filter((file) => {
      return (
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|heic|heif|bmp|gif)$/i.test(file.name)
      );
    });

    if (validImageFiles.length === 0) {
      setErrorMsg('অনুগ্রহ করে বৈধ ইমেজ ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      return;
    }

    setErrorMsg(null);

    // Limit to max 8 photos total to protect payload limits
    const allowedNewFiles = validImageFiles.slice(0, Math.max(0, 8 - uploadedImages.length));
    if (allowedNewFiles.length < validImageFiles.length) {
      setErrorMsg('একসাথে সর্বোচ্চ ৮টি পৃষ্ঠার ছবি আপলোড করতে পারবেন।');
    }

    try {
      const newItems: UploadedImageItem[] = [];
      for (const file of allowedNewFiles) {
        const compressedUrl = await compressAndResizeImage(file);
        if (compressedUrl) {
          newItems.push({
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            dataUrl: compressedUrl,
          });
        }
      }

      if (newItems.length > 0) {
        setUploadedImages((prev) => [...prev, ...newItems]);
        setSelectedPreviewIndex((prev) => (uploadedImages.length === 0 ? 0 : prev));
      }
    } catch (err) {
      console.error('Error processing uploaded files:', err);
      setErrorMsg('ছবি প্রসেসিংয়ে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
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
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== indexToRemove);
      if (selectedPreviewIndex >= updated.length) {
        setSelectedPreviewIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleStartExtraction = async () => {
    if (uploadedImages.length === 0) {
      setErrorMsg('প্রথমে অন্তত একটি প্রশ্নপত্রের ছবি আপলোড করুন অথবা ক্যামেরা দিয়ে ছবি তুলুন।');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCurrentStep(1);

    // Realistic step progression for full 25-40+ question extraction
    const stepTimer1 = setTimeout(() => setCurrentStep(2), 6000);
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 16000);
    const stepTimer3 = setTimeout(() => setCurrentStep(4), 30000);

    try {
      const response = await fetch('/api/extract-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagesBase64: uploadedImages.map((img) => img.dataUrl),
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
            serverErrorText = 'ছবির ফাইলের মোট সাইজ অতিরিক্ত বড় ছিল। কম সংখ্যক ছবি দিয়ে চেষ্টা করুন।';
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
        throw new Error('ছবিগুলোতে কোনো বিজ্ঞান প্রশ্ন সনাক্ত করা যায়নি। অনুগ্রহ করে পরিষ্কার আলোর ছবি আপলোড করুন অথবা নিচের ডেমো সেট দিয়ে পরীক্ষা শুরু করুন।');
      }

      const primaryImageSrc = uploadedImages[0]?.dataUrl;
      onExtractionSuccess(data.questions, data.detectedSubject || 'Physics', primaryImageSrc);
    } catch (err: any) {
      console.error('Extraction error:', err);
      let rawMsg = err?.message || 'সার্ভার সংযোগে ত্রুটি হয়েছে।';

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

  const activeImage = uploadedImages[selectedPreviewIndex] || uploadedImages[0];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-10">
      {/* Hero Header */}
      <div className="text-center mb-5 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
          <span>বিজ্ঞান বিষয়সমূহের স্মার্ট MCQ এক্সট্রাক্টর ও CBT ইঞ্জিন</span>
        </div>
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-bengali leading-snug sm:leading-tight">
          একাধিক পৃষ্ঠার ছবি তুলুন, সরাসরি দিন <span className="text-emerald-600">লাইভ CBT পরীক্ষা</span>
        </h1>
        <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-sm lg:text-base text-slate-600 max-w-xl mx-auto font-bengali leading-relaxed px-1">
          পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান প্রশ্নপত্রের সকল প্রশ্ন নিখুঁতভাবে স্ক্যান করে স্বয়ংক্রিয় কুইজ তৈরি করুন।
        </p>

        {/* Feature Badges */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs text-slate-600">
          <div className="flex items-center gap-1 bg-white px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-slate-200 shadow-2xs">
            <Images className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bengali">একাধিক ছবি আপলোড</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-slate-200 shadow-2xs">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bengali">সবগুলো প্রশ্ন এক্সট্র্যাক্ট</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bengali">শুধুমাত্র সায়েন্স বিষয়সমূহ</span>
          </div>
        </div>
      </div>

      {/* Main Upload / Drag & Drop Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
        {/* Science Subjects Filter Bar */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700">
            <BookMarked className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bengali">বিজ্ঞান বিষয় ফিল্টার:</span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {[
              { id: 'Auto-detect', label: 'অটো-ডিটেক্ট' },
              { id: 'Physics', label: 'পদার্থবিজ্ঞান' },
              { id: 'Chemistry', label: 'রসায়ন' },
              { id: 'Higher Math', label: 'উচ্চতর গণিত' },
              { id: 'Biology', label: 'জীববিজ্ঞান' },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubjectHint(sub.id as any)}
                className={`text-[11px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors font-bengali ${
                  subjectHint === sub.id
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp, image/*"
          multiple
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

        {/* Upload Dropzone when no images uploaded yet */}
        {uploadedImages.length === 0 ? (
          <div
            id="dropzone-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-bengali">
              প্রশ্নপত্রের এক বা একাধিক ছবি ড্র্যাগ করুন অথবা ক্লিক করে আপলোড করুন
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-bengali max-w-md mx-auto">
              JPG, PNG, WebP • একবারে একাধিক পৃষ্ঠার ছবি বা মোবাইল ক্যামেরা দিয়ে তোলা ফটো নির্বাচন করুন
            </p>

            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                id="btn-upload-file"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>একাধিক ছবি সিলেক্ট করুন</span>
              </button>

              <button
                type="button"
                id="btn-camera-capture"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>ক্যামেরা দিয়ে ছবি তুলুন</span>
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Image Preview & Extraction Controls */
          <div className="space-y-5">
            {/* Gallery Thumbnail Strip for Multi-Photo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800 font-bengali">
                  আপলোডকৃত পৃষ্ঠা ({uploadedImages.length}/৮):
                </span>
                <span className="text-[11px] text-slate-500 font-bengali">
                  সবগুলো পৃষ্ঠার প্রশ্ন একসাথে এক্সট্রাক্ট করা হবে
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || uploadedImages.length >= 8}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 rounded-md border border-emerald-200 transition-colors flex items-center gap-1 font-bengali"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>আরও ছবি যুক্ত করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImages([]);
                    setSelectedPreviewIndex(0);
                    setErrorMsg(null);
                  }}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors flex items-center gap-1 font-bengali"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>সব মুছুন</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {uploadedImages.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedPreviewIndex(idx)}
                  className={`relative shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedPreviewIndex === idx
                      ? 'border-emerald-600 shadow-sm ring-2 ring-emerald-400/40 scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.dataUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[10px] text-white font-bold py-0.5 text-center font-bengali">
                    পৃষ্ঠা {idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    title="এই ছবিটি বাদ দিন"
                    className="absolute top-1 right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-xs"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add More Thumbnail Tile */}
              {uploadedImages.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 w-20 h-24 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors text-xs font-bengali"
                >
                  <Plus className="w-5 h-5 mb-1" />
                  <span>যোগ করুন</span>
                </button>
              )}
            </div>

            {/* Focused Image View */}
            {activeImage && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-[400px] flex items-center justify-center p-2">
                <img
                  src={activeImage.dataUrl}
                  alt={`Selected Page ${selectedPreviewIndex + 1}`}
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-xs"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs px-2.5 py-1 rounded-md font-bengali shadow-xs backdrop-blur-xs">
                  পৃষ্ঠা {selectedPreviewIndex + 1} অবলোকন করা হচ্ছে
                </div>
              </div>
            )}

            {/* Action Button & Extraction Pipeline Status */}
            {!isLoading ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-sm text-slate-600 font-bengali">
                  নির্বাচিত বিষয়: <span className="font-semibold text-slate-800">{subjectHint}</span>
                  {` • মোট পৃষ্ঠা: ${uploadedImages.length} টি`}
                </div>

                <button
                  type="button"
                  id="btn-start-extraction"
                  onClick={handleStartExtraction}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-base font-bengali"
                >
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>সবগুলো প্রশ্ন এক্সট্র্যাক্ট করুন ({uploadedImages.length} পৃষ্ঠা)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Animated Pipeline Progress */
              <div className="py-6 px-4 sm:px-6 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <div className="text-center mb-5">
                  <div className="inline-block animate-spin w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
                  
                  {/* Zero-Skipping Patient Extraction Notice */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-full text-xs font-semibold shadow-2xs mb-2.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>সময়: {elapsedSeconds} সেকেন্ড • কোনো প্রশ্ন বাদ না দিয়ে সকল প্রশ্ন এক্সট্র্যাক্ট করা হচ্ছে</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 font-bengali">
                    Quizify AI {uploadedImages.length} টি পৃষ্ঠার সকল বিজ্ঞান প্রশ্ন বিশ্লেষণ করছে...
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-bengali max-w-lg mx-auto mt-1 leading-relaxed">
                    AI তাড়াহুড়ো না করে প্রশ্নপত্রের প্রতিটি কলাম ও পৃষ্ঠার সকল প্রশ্ন (২৫-৪০+ টি) নির্ভুলভাবে বের করছে। এতে কিছুটা সময় লাগতে পারে, দয়া করে অপেক্ষা করুন।
                  </p>
                </div>

                {/* Step Indicators */}
                <div className="space-y-2.5 max-w-md mx-auto text-xs sm:text-sm">
                  {[
                    { step: 1, label: '১. আপলোডকৃত সব পৃষ্ঠার বাংলা হরফ ও কলাম বিশ্লেষণ' },
                    { step: 2, label: '২. শিক্ষার্থীর পেন্সিলের দাগ, ওয়াটারমার্ক ও অপ্রয়োজনীয় অংশ বাদ দেওয়া' },
                    { step: 3, label: '৩. গণিত, পদার্থ ও রসায়নের LaTeX সমীকরণ ও বিজ্ঞান সূত্র সমাধান' },
                    { step: 4, label: '৪. সকল প্রশ্ন (একটিও বাদ না দিয়ে) নিয়ে লাইভ CBT কুইজ প্রস্তুত' },
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

              {uploadedImages.length > 0 && (
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
              বোর্ড ও ভর্তি পরীক্ষার আসল বিজ্ঞান প্রশ্ন দিয়ে তাৎক্ষণিকভাবে CBT পরখ করুন
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200">
            {SAMPLE_PACKS.length} টি প্রস্তুতকৃত সায়েন্স সেট
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
                  <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
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

