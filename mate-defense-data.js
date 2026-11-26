export const defenses = [
  {title:'Create an Escape Square', fen:'6k1/pp3ppp/r1p5/8/8/8/PP3PPP/4R1K1 b - - 0 1', example:'h6', explain:'مثلًا ...h6 يفضّي h7 للملك بعد Re8+. لازم مربع الهروب يكون بعيد عن سيطرة قطع الخصم.'},
  {title:'Block the Queen’s Diagonal', fen:'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1', example:'g6', explain:'مثلًا ...g6 يسد قطر الوزير إلى f7 ويهاجمه. افحص تعاون الوزير مع فيل c4 قبل أي نقلة تطوير.'},
  {title:'Remove the Supporting Bishop', fen:'5rk1/ppp2ppp/3b4/8/7q/8/PPP2PPP/3R2K1 w - - 0 1', example:'Rxd6', explain:'مثلًا Rxd6 يشيل الفيل اللي بيحمي h2. لو الوزير أخذ h2 بعدها، الملك يقدر ياخده.'},
  {title:'Guard the Knight’s Landing Square', fen:'6k1/8/8/8/4n3/8/P2B2PP/6RK w - - 0 1', example:'Be1', explain:'مثلًا Be1 يحمي f2 ضد قفزة الحصان. لو الحصان دخل f2 بكش، الفيل يقدر ياخده.'}
];
