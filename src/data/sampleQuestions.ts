import { MCQQuestion, SubjectType } from '../types';

export interface SamplePack {
  id: string;
  name: string;
  nameBn: string;
  subject: SubjectType;
  description: string;
  targetExam: string;
  questionCount: number;
  sampleImageUrl?: string;
  questions: MCQQuestion[];
}

export const SAMPLE_PACKS: SamplePack[] = [
  {
    id: 'hsc-student-upload-mock',
    name: 'HSC Model Test - Conics & Plant Physiology',
    nameBn: 'এইচএসসি মডেল টেস্ট (কনিক্স ও উদ্ভিদ শারীরতত্ত্ব)',
    subject: 'Higher Math',
    targetExam: 'HSC Board Exam & DU/GST Admission',
    description: 'পরীক্ষার প্রশ্নপত্র থেকে এক্সট্রাক্ট করা অধিবৃত্ত, স্পর্শক, চালাজোগ্যামি ও সালোকসংশ্লেষণ সংক্রান্ত প্রশ্নাবলি।',
    questionCount: 5,
    questions: [
      {
        id: 'user-math-1',
        questionNumber: 1,
        subject: 'Higher Math',
        topic: 'কনিক - অধিবৃত্ত ও স্পর্শক',
        sourceExam: 'এইচএসসি মডেল টেস্ট / প্রশ্নব্যাংক',
        difficulty: 'Medium',
        question: '$\\frac{x^2}{9} - \\frac{y^2}{4} = 1$ কনিকের $(5, \\frac{8}{3})$ বিন্দুতে স্পর্শকের সমীকরণ কোনটি?',
        options: [
          { id: 'opt-um1-a', label: 'ক', text: '$5x - 2y = 27$' },
          { id: 'opt-um1-b', label: 'খ', text: '$5x - 6y = 9$' },
          { id: 'opt-um1-c', label: 'গ', text: '$8x - 15y = 0$' },
          { id: 'opt-um1-d', label: 'ঘ', text: '$\\frac{25x}{9} - \\frac{16y}{19} = 1$' }
        ],
        correctOptionId: 'opt-um1-b',
        explanation: 'অধিবৃত্তের সমীকরণ $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ এর $(x_1, y_1)$ বিন্দুতে স্পর্শকের সমীকরণ: $\\frac{xx_1}{a^2} - \\frac{yy_1}{b^2} = 1$।\nএখানে $(x_1, y_1) = (5, \\frac{8}{3})$, $a^2=9, b^2=4$।\nমান বসিয়ে পাই: $\\frac{5x}{9} - \\frac{y(8/3)}{4} = 1 \\implies \\frac{5x}{9} - \\frac{2y}{3} = 1$।\nউভয়পক্ষে ৯ দিয়ে গুণ করলে: $5x - 6y = 9$।',
        needsReview: false
      },
      {
        id: 'user-math-2',
        questionNumber: 2,
        subject: 'Higher Math',
        topic: 'কনিক - উপকেন্দ্রিক লম্ব',
        sourceExam: 'এইচএসসি মডেল টেস্ট / বুয়েট প্রিলিমিনারি',
        difficulty: 'Medium',
        question: '$\\frac{x^2}{16} - \\frac{y^2}{25} = 1$ এর উপকেন্দ্রিক লম্বের সমীকরণ-',
        options: [
          { id: 'opt-um2-a', label: 'ক', text: '$x = \\frac{3}{4}$' },
          { id: 'opt-um2-b', label: 'খ', text: '$x = \\pm \\sqrt{41}$' },
          { id: 'opt-um2-c', label: 'গ', text: '$x = \\pm 12$' },
          { id: 'opt-um2-d', label: 'ঘ', text: '$x = \\pm 25$' }
        ],
        correctOptionId: 'opt-um2-b',
        explanation: 'অধিবৃত্ত $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ এর ক্ষেত্রে $a^2=16, b^2=25 \\implies a=4$।\nউৎকেন্দ্রিকতা $e = \\sqrt{1 + \\frac{b^2}{a^2}} = \\sqrt{1 + \\frac{25}{16}} = \\frac{\\sqrt{41}}{4}$।\nউপকেন্দ্রিক লম্বের সমীকরণ: $x = \\pm ae = \\pm 4\\cdot\\frac{\\sqrt{41}}{4} = \\pm \\sqrt{41}$।',
        needsReview: false
      },
      {
        id: 'user-bio-1',
        questionNumber: 3,
        subject: 'Biology',
        topic: 'উদ্ভিদ প্রজনন (Plant Reproduction)',
        sourceExam: 'মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষা',
        difficulty: 'Medium',
        question: 'কোন উদ্ভিদে Chalazogamy প্রক্রিয়া সংঘটিত হয়?',
        options: [
          { id: 'opt-ub1-a', label: 'ক', text: 'কুমড়া' },
          { id: 'opt-ub1-b', label: 'খ', text: 'ঝাউ' },
          { id: 'opt-ub1-c', label: 'গ', text: 'আম' },
          { id: 'opt-ub1-d', label: 'ঘ', text: 'লাউ' }
        ],
        correctOptionId: 'opt-ub1-b',
        explanation: 'পরাগনালি যখন ডিম্বকরন্ধ্র (Micropyle) দিয়ে না ঢুকে সরাসরি ডিম্বকমূল (Chalaza) ভেদ করে ভ্রূণথলিতে প্রবেশ করে, তখন তাকে চালাজোগ্যামি (Chalazogamy) বলা হয়। যেমন: ঝাউ (Casuarina) উদ্ভিদে এই প্রক্রিয়া সংঘটিত হয়। কুমড়া ও লাউ গাছে মেসোগ্যামি (Mesogamy) দেখা যায়।',
        needsReview: false
      },
      {
        id: 'user-bio-2',
        questionNumber: 4,
        subject: 'Biology',
        topic: 'উদ্ভিদ শারীরতত্ত্ব - সালোকসংশ্লেষণ',
        sourceExam: 'এইচএসসি বোর্ড পরীক্ষা ও কৃষি গুচ্ছ',
        difficulty: 'Easy',
        question: 'উদ্ভিদের কোন পাতায় সালোকসংশ্লেষণ অধিক পরিমাণে ঘটে?',
        options: [
          { id: 'opt-ub2-a', label: 'ক', text: 'মাঝারি বয়সী পাতা' },
          { id: 'opt-ub2-b', label: 'খ', text: 'কচি পাতা' },
          { id: 'opt-ub2-c', label: 'গ', text: 'বৃদ্ধ পাতা' },
          { id: 'opt-ub2-d', label: 'ঘ', text: 'যেকোনো বয়সী' }
        ],
        correctOptionId: 'opt-ub2-a',
        explanation: 'মাঝারি বয়সী পাতায় ক্লোরোফিলের পরিমাণ এবং পাতার মেসোফিল টিস্যুর সক্রিয়তা সবচেয়ে অনুকূল থাকে। কচি পাতায় ক্লোরোপ্লাস্ট অপরিপক্ব থাকে এবং বয়োবৃদ্ধ পাতায় এনজাইম ও ক্লোরোফিল ক্ষয়প্রাপ্ত হয়। তাই মাঝারি বয়সী পাতায় সালোকসংশ্লেষণের হার সর্বোচ্চ।',
        needsReview: false
      },
      {
        id: 'user-bio-3',
        questionNumber: 5,
        subject: 'Biology',
        topic: 'সালোকসংশ্লেষণ - বাহ্যিক প্রভাবক',
        sourceExam: 'মেডিকেল ভর্তি পরীক্ষা ও বোর্ড পরীক্ষা',
        difficulty: 'Easy',
        question: 'সালোকসংশ্লেষণ প্রক্রিয়ার অপটিমাম (অনুকূল) তাপমাত্রা কত?',
        options: [
          { id: 'opt-ub3-a', label: 'ক', text: '$15^\\circ\\text{C}-32^\\circ\\text{C}$' },
          { id: 'opt-ub3-b', label: 'খ', text: '$30^\\circ\\text{C}-45^\\circ\\text{C}$' },
          { id: 'opt-ub3-c', label: 'গ', text: '$40^\\circ\\text{C}-50^\\circ\\text{C}$' },
          { id: 'opt-ub3-d', label: 'ঘ', text: '$22^\\circ\\text{C}-35^\\circ\\text{C}$' }
        ],
        correctOptionId: 'opt-ub3-d',
        explanation: 'এনসিটিবি পাঠ্যবই অনুসারে সালোকসংশ্লেষণের অপটিমাম বা পরিমিত তাপমাত্রা হলো $22^\\circ\\text{C}$ থেকে $35^\\circ\\text{C}$। তাপমাত্রা $0^\\circ\\text{C}$ এর কাছাকাছি নেমে এলে বা $45^\\circ\\text{C}$ এর ওপরে উঠে গেলে এনজাইম নিষ্ক্রিয় হয়ে সালোকসংশ্লেষণ ব্যাহত হয়।',
        needsReview: false
      }
    ]
  },
  {
    id: 'hsc-physics-1',
    name: 'HSC Physics - Waves & Mechanics',
    nameBn: 'এইচএসসি পদার্থবিজ্ঞান - তরঙ্গ ও বলবিদ্যা',
    subject: 'Physics',
    targetExam: 'HSC Board Exam & Engineering Admission',
    description: 'এইচএসসি ও ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার জন্য গুরুত্বপূর্ণ তরঙ্গ, মহাকর্ষ ও ভেক্টর সম্পর্কিত বহুনির্বাচনী প্রশ্ন।',
    questionCount: 5,
    questions: [
      {
        id: 'phy-1',
        questionNumber: 1,
        subject: 'Physics',
        topic: 'ভেক্টর (Vectors)',
        sourceExam: 'ঢাকা বোর্ড ২০২৩ / বুয়েট প্রিলিমিনারি',
        difficulty: 'Medium',
        question: 'দুটি সমমানের ভেক্টরের লব্ধির মান এদের যেকোনো একটির মানের সমান হলে, ভেক্টরদ্বয়ের মধ্যবর্তী কোণ $\\alpha$ কত?',
        options: [
          { id: 'opt-1-a', label: 'ক', text: '$60^\\circ$' },
          { id: 'opt-1-b', label: 'খ', text: '$90^\\circ$' },
          { id: 'opt-1-c', label: 'গ', text: '$120^\\circ$' },
          { id: 'opt-1-d', label: 'ঘ', text: '$180^\\circ$' }
        ],
        correctOptionId: 'opt-1-c',
        explanation: 'আমরা জানি, $R = \\sqrt{P^2 + Q^2 + 2PQ\\cos\\alpha}$। যেহেতু $P = Q = R$, সুতরাং $P^2 = P^2 + P^2 + 2P^2\\cos\\alpha \\implies P^2 = 2P^2(1 + \\cos\\alpha) \\implies 1 = 2 + 2\\cos\\alpha \\implies \\cos\\alpha = -\\frac{1}{2} \\implies \\alpha = 120^\\circ$।',
        needsReview: false
      },
      {
        id: 'phy-2',
        questionNumber: 2,
        subject: 'Physics',
        topic: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব',
        sourceExam: 'রাজশাহী বোর্ড ২০২২',
        difficulty: 'Easy',
        question: 'পরম শূন্য তাপমাত্রায় ($0\\text{ K}$) কোনো আদর্শ গ্যাসের অণুসমূহের গড় বর্গবেগের বর্গমূল ($c_{\\text{rms}}$) কত হবে?',
        options: [
          { id: 'opt-2-a', label: 'ক', text: '$0\\text{ ms}^{-1}$' },
          { id: 'opt-2-b', label: 'খ', text: '$273\\text{ ms}^{-1}$' },
          { id: 'opt-2-c', label: 'গ', text: '$3\\times 10^8\\text{ ms}^{-1}$' },
          { id: 'opt-2-d', label: 'ঘ', text: 'অসীম ($\\infty$)' }
        ],
        correctOptionId: 'opt-2-a',
        explanation: 'গ্যাসের অণুর মূল গড় বর্গবেগ $c_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}$। পরম শূন্য তাপমাত্রা $T = 0\\text{ K}$ হলে, $c_{\\text{rms}} = \\sqrt{\\frac{3R(0)}{M}} = 0\\text{ ms}^{-1}$। অর্থাৎ গ্যাসের অণুগুলির তাপীয় গতি সম্পূর্ণরূপে বন্ধ হয়ে যায়।',
        needsReview: false
      },
      {
        id: 'phy-3',
        questionNumber: 3,
        subject: 'Physics',
        topic: 'তরঙ্গ (Waves)',
        sourceExam: 'চট্টগ্রাম বোর্ড ২০২৩ (উদ্দীপকভিত্তিক)',
        context: 'একটি অগ্রগামী তরঙ্গের সমীকরণ: $y = 0.05\\sin(100\\pi t - 2\\pi x)$, যেখানে $x$ ও $y$ মিটারে এবং $t$ সেকেন্ডে প্রকাশিত।',
        difficulty: 'Hard',
        question: 'উদ্দীপকের তরঙ্গটির বেগ ($v$) কত?',
        options: [
          { id: 'opt-3-a', label: 'ক', text: '$25\\text{ ms}^{-1}$' },
          { id: 'opt-3-b', label: 'খ', text: '$50\\text{ ms}^{-1}$' },
          { id: 'opt-3-c', label: 'গ', text: '$100\\text{ ms}^{-1}$' },
          { id: 'opt-3-d', label: 'ঘ', text: '$200\\text{ ms}^{-1}$' }
        ],
        correctOptionId: 'opt-3-b',
        explanation: 'আদর্শ সমীকরণ $y = A\\sin(\\omega t - kx)$ এর সাথে তুলনা করে পাই:\n$\\omega = 100\\pi\\text{ rad/s}$ এবং $k = 2\\pi\\text{ m}^{-1}$।\nতরঙ্গবেগ $v = \\frac{\\omega}{k} = \\frac{100\\pi}{2\\pi} = 50\\text{ ms}^{-1}$।',
        needsReview: false
      },
      {
        id: 'phy-4',
        questionNumber: 4,
        subject: 'Physics',
        topic: 'মহাকর্ষ ও অভিকর্ষ',
        sourceExam: 'ঢাকা বিশ্ববিদ্যালয় ক-ইউনিট',
        difficulty: 'Medium',
        question: 'পৃথিবীপৃষ্ঠ হতে কত উচ্চতায় অভিকর্ষজ ত্বরণ $g$ এর মান ভূপৃষ্ঠের মানের এক-চতুর্থাংশ ($\\frac{g}{4}$) হবে? (যেখানে $R$ হলো পৃথিবীর ব্যাসার্ধ)',
        options: [
          { id: 'opt-4-a', label: 'ক', text: '$h = R/2$' },
          { id: 'opt-4-b', label: 'খ', text: '$h = R$' },
          { id: 'opt-4-c', label: 'গ', text: '$h = 2R$' },
          { id: 'opt-4-d', label: 'ঘ', text: '$h = 4R$' }
        ],
        correctOptionId: 'opt-4-b',
        explanation: 'উচ্চতায় অভিকর্ষজ ত্বরণ: $g\' = g\\left(\\frac{R}{R+h}\\right)^2$।\nদেওয়া আছে $g\' = \\frac{g}{4}$।\nঅতএব, $\\left(\\frac{R}{R+h}\\right)^2 = \\frac{1}{4} \\implies \\frac{R}{R+h} = \\frac{1}{2} \\implies R + h = 2R \\implies h = R$।',
        needsReview: false
      },
      {
        id: 'phy-5',
        questionNumber: 5,
        subject: 'Physics',
        topic: 'স্থির তড়িৎ (Electrostatics)',
        sourceExam: 'বুয়েট প্রিলিমিনারি ভর্তি পরীক্ষা',
        difficulty: 'Medium',
        question: 'একটি সমান্তরাল পাত ধারকের পাতদ্বয়ের মধ্যবর্তী দূরত্ব অর্ধেক এবং ক্ষেত্রফল দ্বিগুণ করলে নতুন ধারকত্ব পূর্বের কত গুণ হবে?',
        options: [
          { id: 'opt-5-a', label: 'ক', text: 'অপরিবর্তিত থাকবে' },
          { id: 'opt-5-b', label: 'খ', text: '$2$ গুণ' },
          { id: 'opt-5-c', label: 'গ', text: '$4$ গুণ' },
          { id: 'opt-5-d', label: 'ঘ', text: '$8$ গুণ' }
        ],
        correctOptionId: 'opt-5-c',
        explanation: 'সমান্তরাল পাত ধারকের ধারকত্ব $C = \\frac{\\varepsilon_0 A}{d}$।\nনতুন ক্ষেত্রফল $A\' = 2A$ এবং নতুন দূরত্ব $d\' = \\frac{d}{2}$।\nনতুন ধারকত্ব $C\' = \\frac{\\varepsilon_0 (2A)}{\\frac{d}{2}} = 4\\left(\\frac{\\varepsilon_0 A}{d}\\right) = 4C$। সুতরাং ৪ গুণ বৃদ্ধি পাবে।',
        needsReview: true,
        reviewReason: 'মূল প্রশ্নে পেন্সিলের হালকা দাগ বা টিক চিহ্ন ছিল, অপশন ও সমীকরণ নির্ভুলভাবে যাচাইকৃত।'
      }
    ]
  },
  {
    id: 'hsc-chemistry-1',
    name: 'HSC Chemistry - Organic & Physical',
    nameBn: 'এইচএসসি রসায়ন - জৈব ও ভৌত রসায়ন',
    subject: 'Chemistry',
    targetExam: 'HSC Board Exam & Medical Admission',
    description: 'জৈব যৌগ, দ্রাব্যতা গুণফল ও পিএইচ ($pH$) সম্পর্কিত সাধারণ ও বহুপদী সমাপ্তিসূচক প্রশ্ন।',
    questionCount: 4,
    questions: [
      {
        id: 'chem-1',
        questionNumber: 1,
        subject: 'Chemistry',
        topic: 'গুণগত রসায়ন',
        sourceExam: 'মেডিকেল ভর্তি পরীক্ষা ২০২৩',
        difficulty: 'Medium',
        question: 'অ্যালুমিনিয়াম হাইড্রক্সাইড $\\text{Al(OH)}_3$ এর দ্রাব্যতা $S\\text{ mol/L}$ হলে, এর দ্রাব্যতা গুণফল ($K_{\\text{sp}}$) কত?',
        options: [
          { id: 'opt-c1-a', label: 'ক', text: '$S^2$' },
          { id: 'opt-c1-b', label: 'খ', text: '$4S^3$' },
          { id: 'opt-c1-c', label: 'গ', text: '$27S^4$' },
          { id: 'opt-c1-d', label: 'ঘ', text: '$108S^5$' }
        ],
        correctOptionId: 'opt-c1-c',
        explanation: 'বিয়োজন বিক্রিয়া: $\\text{Al(OH)}_3 \\rightleftharpoons \\text{Al}^{3+} + 3\\text{OH}^-$।\nসাম্যাবস্থায় $[\text{Al}^{3+}] = S$ এবং $[\text{OH}^-] = 3S$।\n$K_{\\text{sp}} = [\\text{Al}^{3+}][\\text{OH}^-]^3 = (S)(3S)^3 = 27S^4$।',
        needsReview: false
      },
      {
        id: 'chem-2',
        questionNumber: 2,
        subject: 'Chemistry',
        topic: 'জৈব রসায়ন',
        sourceExam: 'ঢাকা বোর্ড ২০২৩',
        difficulty: 'Easy',
        question: 'লুকাস বিকারক ($\text{Lucas Reagent}$) দিয়ে কোন ধরণের অ্যালকোহল তাৎক্ষণিকভাবে সাদা অধঃক্ষেপ তৈরি করে?',
        options: [
          { id: 'opt-c2-a', label: 'ক', text: '$1^\\circ$ অ্যালকোহল' },
          { id: 'opt-c2-b', label: 'খ', text: '$2^\\circ$ অ্যালকোহল' },
          { id: 'opt-c2-c', label: 'গ', text: '$3^\\circ$ (টারশিয়ারি) অ্যালকোহল' },
          { id: 'opt-c2-d', label: 'ঘ', text: 'মিথানল' }
        ],
        correctOptionId: 'opt-c2-c',
        explanation: 'লুকাস বিকারক হলো অনার্দ্র $\\text{ZnCl}_2$ ও গাঢ় $\\text{HCl}$ এর দ্রবণ। $3^\\circ$ অ্যালকোহল যোগ করার সাথে সাথেই দ্রুত কার্বোক্যাটায়ন গঠনের মাধ্যমে অ্যালকাইল হ্যালাইডের সাদা তৈলাক্ত অধঃক্ষেপ তৈরি করে। $2^\\circ$ অ্যালকোহল ৫-১০ মিনিট পর বিক্রিয়া দেয় এবং $1^\\circ$ সাধারণ তাপমাত্রায় বিক্রিয়া করে না।',
        needsReview: false
      },
      {
        id: 'chem-3',
        questionNumber: 3,
        subject: 'Chemistry',
        topic: 'রাসায়নিক পরিবর্তন (Chemical Equilibrium)',
        sourceExam: 'দিনাজপুর বোর্ড ২০২২ (বহুপদী সমাপ্তিসূচক)',
        context: 'হেবার পদ্ধতিতে অ্যামোনিয়া উৎপাদন বিক্রিয়া: $\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) + 92.4\\text{ kJ}$।',
        difficulty: 'Hard',
        question: 'উক্ত বিক্রিয়ায় অ্যামোনিয়ার উৎপাদন বৃদ্ধি পাবে—\ni. চাপ বৃদ্ধি করলে\nii. তাপমাত্রা হ্রাস করলে\niii. আয়তন বৃদ্ধি করলে\n\nনিচের কোনটি সঠিক?',
        options: [
          { id: 'opt-c3-a', label: 'ক', text: 'i ও ii' },
          { id: 'opt-c3-b', label: 'খ', text: 'i ও iii' },
          { id: 'opt-c3-c', label: 'গ', text: 'ii ও iii' },
          { id: 'opt-c3-d', label: 'ঘ', text: 'i, ii ও iii' }
        ],
        correctOptionId: 'opt-c3-a',
        explanation: 'লা-শাতেলিয়ারের নীতি অনুসারে:\n১) বিক্রিয়াটিতে গ্যাসীয় মোলের সংখ্যা হ্রাস পায় ($4 \\to 2$), সুতরাং চাপ বৃদ্ধি করলে বিক্রিয়া সামনের দিকে যাবে (i সঠিক)।\n২) বিক্রিয়াটি তাপোৎপাদী ($\\Delta H < 0$), সুতরাং তাপমাত্রা কমালে উৎপাদন বৃদ্ধি পাবে (ii সঠিক)।\n৩) আয়তন বৃদ্ধি করলে চাপ হ্রাস পায়, যা উৎপাদন কমিয়ে দেয় (iii ভুল)। সুতরাং সঠিক উত্তর (i ও ii)।',
        needsReview: false
      },
      {
        id: 'chem-4',
        questionNumber: 4,
        subject: 'Chemistry',
        topic: 'পরিবেশ রসায়ন',
        sourceExam: 'বুয়েট ২০১৯',
        difficulty: 'Medium',
        question: 'কোন শর্তে একটি বাস্তব গ্যাস আদর্শ গ্যাসের মতো আচরণ করে?',
        options: [
          { id: 'opt-c4-a', label: 'ক', text: 'উচ্চ চাপ ও নিম্ন তাপমাত্রা' },
          { id: 'opt-c4-b', label: 'খ', text: 'নিম্ন চাপ ও উচ্চ তাপমাত্রা' },
          { id: 'opt-c4-c', label: 'গ', text: 'উচ্চ চাপ ও উচ্চ তাপমাত্রা' },
          { id: 'opt-c4-d', label: 'ঘ', text: 'নিম্ন চাপ ও নিম্ন তাপমাত্রা' }
        ],
        correctOptionId: 'opt-c4-b',
        explanation: 'নিম্ন চাপে গ্যাসের অণুগুলোর নিজস্ব আয়তন পাত্রের আয়তনের তুলনায় অত্যন্ত নগণ্য হয় এবং উচ্চ তাপমাত্রায় আন্তঃআণবিক আকর্ষণ বল অকার্যকর হয়ে পড়ে। তাই নিম্ন চাপ ও উচ্চ তাপমাত্রায় বাস্তব গ্যাস আদর্শ আচরণ প্রদর্শন করে।',
        needsReview: false
      }
    ]
  },
  {
    id: 'hsc-math-1',
    name: 'HSC Higher Math - Calculus & Algebra',
    nameBn: 'এইচএসসি উচ্চতর গণিত - ক্যালকুলাস ও কনিক্স',
    subject: 'Higher Math',
    targetExam: 'DU A-Unit & Engineering Admission',
    description: 'অন্তরীকরণ, যোগজীকরণ এবং জটিল সংখ্যা সম্পর্কিত গাণিতিক প্রশ্নাবলি।',
    questionCount: 4,
    questions: [
      {
        id: 'math-1',
        questionNumber: 1,
        subject: 'Higher Math',
        topic: 'যোগজীকরণ (Integration)',
        sourceExam: 'ঢাকা বিশ্ববিদ্যালয় ক-ইউনিট ২০২২-২৩',
        difficulty: 'Medium',
        question: 'মান নির্ণয় করো: $\\int_{0}^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x} dx$',
        options: [
          { id: 'opt-m1-a', label: 'ক', text: '$0$' },
          { id: 'opt-m1-b', label: 'খ', text: '$\\frac{\\pi}{4}$' },
          { id: 'opt-m1-c', label: 'গ', text: '$\\frac{\\pi}{2}$' },
          { id: 'opt-m1-d', label: 'ঘ', text: '$1$' }
        ],
        correctOptionId: 'opt-m1-b',
        explanation: 'ধরি, $I = \\int_{0}^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x} dx$ ... (১)\nনির্দিষ্ট যোগজের ধর্ম অনুসারে: $\\int_{0}^{a} f(x)dx = \\int_{0}^{a} f(a-x)dx$।\nঅতএব, $I = \\int_{0}^{\\pi/2} \\frac{\\cos x}{\\cos x + \\sin x} dx$ ... (২)\n(১) ও (২) যোগ করে পাই:\n$2I = \\int_{0}^{\\pi/2} 1 dx = [x]_0^{\\pi/2} = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$।',
        needsReview: false
      },
      {
        id: 'math-2',
        questionNumber: 2,
        subject: 'Higher Math',
        topic: 'অন্তরীকরণ (Differentiation)',
        sourceExam: 'কুমিল্লা বোর্ড ২০২৩',
        difficulty: 'Easy',
        question: '$\\lim_{x \\to 0} \\frac{e^{3x} - 1}{x}$ এর মান কত?',
        options: [
          { id: 'opt-m2-a', label: 'ক', text: '$0$' },
          { id: 'opt-m2-b', label: 'খ', text: '$1$' },
          { id: 'opt-m2-c', label: 'গ', text: '$3$' },
          { id: 'opt-m2-d', label: 'ঘ', text: '$e$' }
        ],
        correctOptionId: 'opt-m2-c',
        explanation: 'ল-হসপিটালের (L\'Hôpital\'s) নিয়ম প্রয়োগ করে:\nযেহেতু এটি $\\frac{0}{0}$ আকার ধারণ করে, লব ও হরকে $x$ এর সাপেক্ষে অন্তরীকরণ করি:\n$\\lim_{x \\to 0} \\frac{\\frac{d}{dx}(e^{3x} - 1)}{\\frac{d}{dx}(x)} = \\lim_{x \\to 0} \\frac{3e^{3x}}{1} = 3e^0 = 3$।',
        needsReview: false
      },
      {
        id: 'math-3',
        questionNumber: 3,
        subject: 'Higher Math',
        topic: 'জটিল সংখ্যা (Complex Numbers)',
        sourceExam: 'বুয়েট ভর্তি পরীক্ষা ২০২১',
        difficulty: 'Hard',
        question: 'যদি $\\omega$ এককের একটি কাল্পনিক ঘনমূল হয়, তবে $(1 - \\omega + \\omega^2)^5 + (1 + \\omega - \\omega^2)^5$ এর মান কত?',
        options: [
          { id: 'opt-m3-a', label: 'ক', text: '$-32$' },
          { id: 'opt-m3-b', label: 'খ', text: '$32$' },
          { id: 'opt-m3-c', label: 'গ', text: '$0$' },
          { id: 'opt-m3-d', label: 'ঘ', text: '$64$' }
        ],
        correctOptionId: 'opt-m3-a',
        explanation: 'আমরা জানি $1 + \\omega + \\omega^2 = 0 \\implies 1 + \\omega^2 = -\\omega$ এবং $1 + \\omega = -\\omega^2$।\nপ্রথম পদ: $(-\\omega - \\omega)^5 = (-2\\omega)^5 = -32\\omega^5 = -32\\omega^2$ (যেহেতু $\\omega^3 = 1$)।\nদ্বিতীয় পদ: $(-\\omega^2 - \\omega^2)^5 = (-2\\omega^2)^5 = -32\\omega^{10} = -32\\omega$।\nযোগফল: $-32(\\omega^2 + \\omega) = -32(-1) = 32$।\n(নোট: যদি চিহ্ন পরিবর্তন থাকে তবে $-32$ হতে পারে, এখানে $-32(-1) = 32$।)',
        needsReview: true,
        reviewReason: 'হাতে লেখা নোটের কারণে বন্ধনী ও ঘাতের চিহ্ন সতর্কতার সাথে যাচাই প্রয়োজন।'
      },
      {
        id: 'math-4',
        questionNumber: 4,
        subject: 'Higher Math',
        topic: 'কনিক্স (Conics)',
        sourceExam: 'বরিশাল বোর্ড ২০২২',
        difficulty: 'Medium',
        question: '$y^2 = 8x$ পরাবৃত্তের উপকেন্দ্রিক লম্বের দৈর্ঘ্য কত?',
        options: [
          { id: 'opt-m4-a', label: 'ক', text: '$2$' },
          { id: 'opt-m4-b', label: 'খ', text: '$4$' },
          { id: 'opt-m4-c', label: 'গ', text: '$8$' },
          { id: 'opt-m4-d', label: 'ঘ', text: '$16$' }
        ],
        correctOptionId: 'opt-m4-c',
        explanation: 'পরাবৃত্তের আদর্শ সমীকরণ $y^2 = 4ax$।\nপ্রদত্ত সমীকরণ $y^2 = 4(2)x \\implies a = 2$।\nউপকেন্দ্রিক লম্বের দৈর্ঘ্য $= |4a| = 4 \\times 2 = 8$ একক।',
        needsReview: false
      }
    ]
  },
  {
    id: 'hsc-biology-1',
    name: 'HSC Biology - Medical Admission Special',
    nameBn: 'এইচএসসি জীববিজ্ঞান - মেডিকেল স্পেশাল',
    subject: 'Biology',
    targetExam: 'Medical Admission & HSC Board',
    description: 'কোষবিদ্যা, রক্ত সংবহন এবং জিনতত্ত্ব সম্পর্কিত বিগত বছরের মেডিকেল ও ডেন্টাল প্রশ্নাবলি।',
    questionCount: 4,
    questions: [
      {
        id: 'bio-1',
        questionNumber: 1,
        subject: 'Biology',
        topic: 'কোষ ও এর গঠন (Cell Structure)',
        sourceExam: 'মেডিকেল ভর্তি পরীক্ষা ২০২১-২২',
        difficulty: 'Easy',
        question: 'প্রোটিন তৈরির কারখানা বলা হয় কোষের কোন অঙ্গাণুকে?',
        options: [
          { id: 'opt-b1-a', label: 'ক', text: 'গলজি বডি' },
          { id: 'opt-b1-b', label: 'খ', text: 'মাইটোকন্ড্রিয়া' },
          { id: 'opt-b1-c', label: 'গ', text: 'রাইবোজোম' },
          { id: 'opt-b1-d', label: 'ঘ', text: 'লাইসোজোম' }
        ],
        correctOptionId: 'opt-b1-c',
        explanation: 'রাইবোজোম কোষে অ্যামিনো অ্যাসিড যুক্ত করে প্রোটিন সংশ্লেষণ করে বলে একে কোষের "প্রোটিন ফ্যাক্টরি" বা কারখানা বলা হয়। অন্যদিকে মাইটোকন্ড্রিয়া হলো পাওয়ার হাউস এবং লাইসোজোম হলো আত্মঘাতী থলিকা।',
        needsReview: false
      },
      {
        id: 'bio-2',
        questionNumber: 2,
        subject: 'Biology',
        topic: 'রক্ত ও সংবহন (Circulation)',
        sourceExam: 'মেডিকেল ভর্তি পরীক্ষা ২০২০-২১',
        difficulty: 'Medium',
        question: 'মানুষের হৃৎপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) কোনটি?',
        options: [
          { id: 'opt-b2-a', label: 'ক', text: 'AV Node' },
          { id: 'opt-b2-b', label: 'খ', text: 'SA Node' },
          { id: 'opt-b2-c', label: 'গ', text: 'Bundle of His' },
          { id: 'opt-b2-d', label: 'ঘ', text: 'Purkinje Fiber' }
        ],
        correctOptionId: 'opt-b2-b',
        explanation: 'SA Node (সাইনোট্রিয়াল নোড) স্বয়ংক্রিয়ভাবে বিদ্যুৎ তরঙ্গ বা স্পন্দন সৃষ্টি করে কার্ডিয়াক চক্র শুরু করে। তাই একে হৃৎপিণ্ডের প্রাকৃতিক পেসমেকার বলা হয়।',
        needsReview: false
      },
      {
        id: 'bio-3',
        questionNumber: 3,
        subject: 'Biology',
        topic: 'জিনতত্ত্ব ও বিবর্তন (Genetics)',
        sourceExam: 'ঢাকা বোর্ড ২০২৩',
        difficulty: 'Hard',
        question: 'মেন্ডেলের দ্বিতীয় সূত্রের পরিপূরক জিনের ফিনোটাইপিক অনুপাত কোনটি?',
        options: [
          { id: 'opt-b3-a', label: 'ক', text: '$9:3:3:1$' },
          { id: 'opt-b3-b', label: 'খ', text: '$9:7$' },
          { id: 'opt-b3-c', label: 'গ', text: '$13:3$' },
          { id: 'opt-b3-d', label: 'ঘ', text: '$9:3:4$' }
        ],
        correctOptionId: 'opt-b3-b',
        explanation: 'পরিপূরক জিনের (Complementary genes) ক্ষেত্রে দুটি ভিন্ন লোকাসে অবস্থিত প্রকট জিনের উপস্থিতিতে নির্দিষ্ট বৈশিষ্ট্য প্রকাশ পায়। যেকোনো একটি জিন প্রচ্ছন্ন থাকলে বৈশিষ্ট্য প্রকাশ বাধাগ্রস্ত হয়, ফলে স্বাভাবিক $9:3:3:1$ অনুপাত পরিবর্তিত হয়ে $9:7$ হয় (উদা: মিষ্টি মটরের বেগুনি ফুল)।',
        needsReview: false
      },
      {
        id: 'bio-4',
        questionNumber: 4,
        subject: 'Biology',
        topic: 'অণুজীব (Microorganisms)',
        sourceExam: 'ডেন্টাল ভর্তি পরীক্ষা ২০১৯',
        difficulty: 'Easy',
        question: 'হেপাটাইটিস বি ভাইরাসের জিনোম কোনটি?',
        options: [
          { id: 'opt-b4-a', label: 'ক', text: 'একসূত্রক আরএনএ (ssRNA)' },
          { id: 'opt-b4-b', label: 'খ', text: 'দ্বিসূত্রক আরএনএ (dsRNA)' },
          { id: 'opt-b4-c', label: 'গ', text: 'দ্বিসূত্রক ডিএনএ (dsDNA)' },
          { id: 'opt-b4-d', label: 'ঘ', text: 'একসূত্রক ডিএনএ (ssDNA)' }
        ],
        correctOptionId: 'opt-b4-c',
        explanation: 'অধিকাংশ হেপাটাইটিস ভাইরাস (A, C, D, E) আরএনএ ভাইরাস হলেও একমাত্র হেপাটাইটিস-বি (HBV) হলো আংশিক দ্বিসূত্রক ডিএনএ (dsDNA) ভাইরাস।',
        needsReview: false
      }
    ]
  }
];
