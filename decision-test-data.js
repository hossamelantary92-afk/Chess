export const decisionTest = [
  {
    task: 'two', title: 'Close the Escape Square',
    fen: '7k/8/3P1K2/3Q4/8/8/p7/8 w - - 0 1',
    keys: {Kf7: {Kh7: ['Qh5#', 'Qh1#'], 'a1=N': ['Qh5#', 'Qh1#'], 'a1=B': ['Qh5#', 'Qh1#'], 'a1=R': ['Qh5#'], 'a1=Q': ['Qh5#']}},
    traps: {'Qa8+': 'بعد Qa8+ يهرب الملك بـ Kh7. احسب مين هيغطي g8 لو غيّرت مكان ملكك.'},
    explain: 'الملك على f7 بيغطي g8 وg7. الوزير بعدها يقدر يدي مات من h5 حتى لو بيدق الأسود ترقّى لوزير.'
  },
  {
    task: 'two', title: 'Uncover the Bishop',
    fen: '8/8/5b2/8/8/2k4r/8/K7 b - - 0 1',
    keys: {'Kb3+': {Kb1: ['Rh1#']}},
    traps: {'Kb4+': 'بعد Kb4+ الفيل بيدي كش، لكن Ka2 متاحة. اختار مربع للملك الأسود يقفل a2 كمان.'},
    explain: 'لما الملك الأسود يروح b3، بيفتح قطر الفيل من f6 إلى a1 وبيغطي a2. الأبيض مجبر يروح b1، والرخ يقفل الصف الأول.'
  },
  {
    task: 'defend', title: 'Cut the Bishop’s Support',
    fen: 'r5k1/1b3ppp/8/8/8/7q/5P1P/3R2K1 w - - 0 1', example: 'f3',
    explain: 'التهديد Qg2#، والفيل على b7 هو اللي بيحمي الوزير هناك. من الحلول f3، لأن البيدق بيقطع القطر وبيفتح f2 للملك.'
  },
  {
    task: 'defend', title: 'Give the King Air',
    fen: '6k1/5ppp/p7/8/8/8/PPP3PP/3RR1K1 b - - 0 1', example: 'h6',
    explain: 'الرخّين يقدروا يدخلوا الصف الثامن. لو لعبت a5، الأبيض عنده Re8#. من الحلول h6، وبعد Re8+ الملك يخرج على h7.'
  },
  {
    task: 'improve', title: 'Take the Open File',
    fen: 'r5k1/ppp2pp1/6bp/8/4P3/2P1B2P/PP3PP1/R5K1 w - - 0 1',
    example: 'Rd1', goal: 'رخ a1 قدامه بيدق من قطعه. اختار له عمود مفتوح يقدر يدخل منه على الصف السابع.',
    explain: 'بعد Rd1 مفيش بيادق على عمود d. لو الأسود ساب d7 من غير حراسة، الرخ يقدر يدخل عليه ويضغط على بيدق c7. افحص رد الأسود قبل ما تدخل.'
  },
  {
    task: 'improve', title: 'Centralize the Knight',
    fen: 'r5k1/pp3pp1/1np4p/8/P7/4P2P/1P3PP1/2R3K1 b - - 0 1',
    example: 'Nd5', goal: 'اختار للحصان مربع في المركز يحميه بيدق أسود، ويقدر منه يضغط على بيدق e3.',
    explain: 'بعد Nd5 بيدق c6 بيحمي الحصان. الحصان دلوقتي بيهاجم e3 وبيراقب c3. بيدق f2 بيحمي e3، فاحسب التبادل قبل ما تفكر تاخده.'
  }
];
