export type SubjectType = 
  | 'Physics' 
  | 'Chemistry' 
  | 'Higher Math' 
  | 'Biology';

export interface MCQOption {
  id: string;
  label: string; // 'ক' | 'খ' | 'গ' | 'ঘ' or 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface MCQQuestion {
  id: string;
  questionNumber: number;
  subject: SubjectType;
  topic?: string;
  context?: string; // উদ্দীপক / Scenario / Roman numerals (i, ii, iii)
  question: string; // The core question text including LaTeX like $\vec{E}$, $\int_0^1 x dx$, $\text{H}_2\text{SO}_4$
  options: MCQOption[];
  correctOptionId: string; // Matches option.id or option.label
  explanation: string; // Bengali detailed solution
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  sourceExam?: string; // e.g. "Dhaka Board 2023", "BUET 2022", "Medical 2023"
  needsReview: boolean;
  reviewReason?: string; // e.g. "Pencil tick mark was partially obscuring option গ", "Low image resolution"
}

export interface ExamSettings {
  title: string;
  durationMinutes: number;
  durationSeconds?: number; // Exact total duration in seconds (e.g. questions.length * 45s)
  secondsPerQuestion?: number; // Allocated seconds per MCQ (default 45s)
  negativeMarking: number; // e.g., 0.25 for admission, 0 for HSC Board
  marksPerQuestion: number;
  passPercentage: number;
  shuffleQuestions: boolean;
  mode: 'cbt_exam' | 'practice';
}

export interface ExamSubmission {
  answers: Record<string, string>; // questionId -> optionId or label
  flagged: Record<string, boolean>; // questionId -> isFlagged
  timeSpentPerQuestion: Record<string, number>; // seconds
  totalTimeSpent: number; // seconds
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracy: number;
  submittedAt: string;
}

export interface ExtractionResult {
  questions: MCQQuestion[];
  detectedSubject: SubjectType;
  totalQuestions: number;
  rawFeedback?: string;
}
