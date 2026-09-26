import { SavedExamSet, MCQQuestion, ExamSettings, SubjectType, ExamSubmission } from '../types';

const STORAGE_KEY = 'quizify_ai_saved_exams_v1';

export const getSavedExams = (): SavedExamSet[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load saved exams from localStorage:', err);
    return [];
  }
};

export const getSavedExamById = (id: string): SavedExamSet | null => {
  const exams = getSavedExams();
  return exams.find((e) => e.id === id) || null;
};

export const saveExamSet = (
  examData: {
    name: string;
    subject: SubjectType;
    questions: MCQQuestion[];
    settings: ExamSettings;
    lastSubmission?: ExamSubmission | null;
    description?: string;
  },
  existingId?: string
): SavedExamSet => {
  const exams = getSavedExams();
  const now = new Date().toISOString();

  let targetExam: SavedExamSet;

  if (existingId) {
    const existingIndex = exams.findIndex((e) => e.id === existingId);
    if (existingIndex >= 0) {
      targetExam = {
        ...exams[existingIndex],
        name: examData.name.trim() || exams[existingIndex].name,
        subject: examData.subject || exams[existingIndex].subject,
        questions: examData.questions,
        settings: examData.settings,
        lastSubmission: examData.lastSubmission !== undefined ? examData.lastSubmission : exams[existingIndex].lastSubmission,
        description: examData.description !== undefined ? examData.description : exams[existingIndex].description,
        updatedAt: now,
      };
      exams[existingIndex] = targetExam;
    } else {
      targetExam = {
        id: existingId,
        name: examData.name.trim() || 'আমার কুইজ সেট',
        subject: examData.subject,
        createdAt: now,
        updatedAt: now,
        questions: examData.questions,
        settings: examData.settings,
        lastSubmission: examData.lastSubmission || null,
        description: examData.description || '',
      };
      exams.unshift(targetExam);
    }
  } else {
    targetExam = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: examData.name.trim() || 'আমার কুইজ সেট',
      subject: examData.subject,
      createdAt: now,
      updatedAt: now,
      questions: examData.questions,
      settings: examData.settings,
      lastSubmission: examData.lastSubmission || null,
      description: examData.description || '',
    };
    exams.unshift(targetExam);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
    window.dispatchEvent(new CustomEvent('quizify_saved_exams_updated'));
  } catch (err) {
    console.error('Failed to save exams to localStorage:', err);
    throw new Error('ব্রাউজার মেমোরিতে কুইজ সংরক্ষণ করা সম্ভব হয়নি।');
  }

  return targetExam;
};

export const deleteSavedExam = (id: string): boolean => {
  try {
    const exams = getSavedExams();
    const filtered = exams.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('quizify_saved_exams_updated'));
    return true;
  } catch (err) {
    console.error('Failed to delete saved exam:', err);
    return false;
  }
};

export const renameSavedExam = (id: string, newName: string): boolean => {
  try {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    const exams = getSavedExams();
    const target = exams.find((e) => e.id === id);
    if (!target) return false;
    target.name = trimmed;
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
    window.dispatchEvent(new CustomEvent('quizify_saved_exams_updated'));
    return true;
  } catch (err) {
    console.error('Failed to rename exam:', err);
    return false;
  }
};

export const updateExamSubmissionHistory = (id: string, submission: ExamSubmission): boolean => {
  try {
    const exams = getSavedExams();
    const target = exams.find((e) => e.id === id);
    if (!target) return false;
    target.lastSubmission = submission;
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
    window.dispatchEvent(new CustomEvent('quizify_saved_exams_updated'));
    return true;
  } catch (err) {
    console.error('Failed to update submission in saved exam:', err);
    return false;
  }
};

export const exportExamsAsJSON = (): string => {
  const exams = getSavedExams();
  return JSON.stringify(exams, null, 2);
};

export const importExamsFromJSON = (jsonString: string): { successCount: number; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { successCount: 0, error: 'অবৈধ ফাইল ফরম্যাট: JSON অ্যারে প্রয়োজন।' };
    }
    const current = getSavedExams();
    let added = 0;

    for (const item of parsed) {
      if (item && item.name && Array.isArray(item.questions) && item.questions.length > 0) {
        const newExam: SavedExamSet = {
          id: `quiz_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: item.name,
          subject: item.subject || 'Physics',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          questions: item.questions,
          settings: item.settings || {
            title: item.name,
            durationMinutes: 15,
            durationSeconds: 15 * 60,
            secondsPerQuestion: 40,
            negativeMarking: 0.25,
            marksPerQuestion: 1.0,
            passPercentage: 40,
            shuffleQuestions: false,
            mode: 'cbt_exam',
          },
          lastSubmission: item.lastSubmission || null,
          description: item.description || '',
        };
        current.unshift(newExam);
        added++;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('quizify_saved_exams_updated'));
    return { successCount: added };
  } catch (err: any) {
    return { successCount: 0, error: err.message || 'JSON পার্স করতে ব্যর্থ হয়েছে।' };
  }
};
