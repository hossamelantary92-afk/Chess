const start = 'start';
export const groups = {
  'Openings & Essentials':['Dutch Defense','Offbeat Openings','Read and Play a Game','Pieces Working Together'],
  'Middlegame':['Adjust Your Plan','Trust Your Intuition','How to Bluff','A Must-Win Situation'],
  'Checkmate Patterns':['Fool’s Mate','Kiss of Death Mate','Morphy Mate','Double Bishop Mate','Légal’s Mate','Forrest Gump Mate'],
  'Bullet':['Opening Traps in Bullet','Premoves in Bullet','Time Management in Bullet','How to Checkmate in Bullet','Flagging Your Opponent']
};
// Each line starts at an actual decision. The following moves demonstrate one legal continuation.
export const examples = {
 'Dutch Defense':[[start,'d4','f5 g3 Nf6 Bg2 e6 Nf3 Be7 O-O O-O','العب الدفاع الهولندي وسيطر ببيدقك على e4.']],
 'Offbeat Openings':[[start,'g4','d5 h3 e5','خد مساحة في الوسط وافتح قطر فيل c8 في نفس النقلة.']],
 'Read and Play a Game':[[start,'e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6','O-O','أمّن الملك بعد التبادل. للتبييت اختار الملك ثم g1.']],
 'Pieces Working Together':[['r5k1/ppp2pp1/7p/8/4b3/2P1B2P/PP3PP1/3R2K1 w - - 0 1','','Rd4 Bc6','هاجم الفيل برخك من مربع بيحميه فيلك.']],
 'Adjust Your Plan':[['r5k1/ppp2pp1/7p/7b/4P3/2P1B2P/PP3PP1/3R2K1 w - - 0 1','','Rd7','الفيل هاجم الرخ. انقله للصف السابع وهدّد c7.'],['r5k1/pp3pp1/2p4p/3n4/P3P3/7P/1P3PP1/2R3K1 b - - 0 1','','Nf6','بيدق e4 هاجم حصانك. حرّكه لمربع يضغط منه على نفس البيدق.'],['r5k1/ppp2pp1/7p/8/4b3/2P1B2P/PP3PP1/3R2K1 w - - 0 1','','Rd4 Bc6','هاجم الفيل وحافظ على عمود d.'],['r5k1/pp3pp1/2p4p/3n4/P7/2R1P2P/1P3PP1/6K1 b - - 0 1','','Nxc3 bxc3','احسب تبادل الرخ والحصان.']],
 'Trust Your Intuition':[['r3k3/pp3ppp/8/3N2b1/4P3/8/PP3PPP/6K1 w - - 0 1','','Nc7+ Kd7 Nxa8','العب شوكة على الملك والرخ.'],['r3k3/pp3ppp/8/3N4/4Pb2/8/PP3PPP/6K1 w - - 0 1','','Nxf4','الفيل غطّى مربع الشوكة. شوف تقدر تاخد أنهي قطعة بأمان.']],
 'How to Bluff':[['r6k/5K2/6Q1/8/8/8/8/8 b - - 0 1','','Rf8+ Kxf8','اعرض الرخ بكش بحيث لو الملك أخده يبقى تعادل.']],
 'A Must-Win Situation':[['k7/1r4R1/8/P7/5K2/8/8/8 w - - 0 1','','Rg5 Rb4+ Ke5','احتفظ بالرخ وانقله لصف بيحمي بيدقك.']],
 'Fool’s Mate':[[start,'f3 e5 g4','Qh4#','استغل القطر المفتوح ناحية الملك.']],
 'Kiss of Death Mate':[['7k/8/5K2/6Q1/8/8/8/8 w - - 0 1','','Qg7#','ادي مات بالوزير من مربع يحميه ملكك.']],
 'Morphy Mate':[['7k/4B2p/8/8/8/8/8/K5R1 w - - 0 1','','Bf6#','ادي مات بالفيل والرخ قافل عمود g.']],
 'Double Bishop Mate':[['k3B3/8/1K6/8/5B2/8/8/8 w - - 0 1','','Bc6#','فيل بيحرس b8. ادي المات بالفيل التاني.']],
 'Légal’s Mate':[[start,'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3 Bh5 Nxe5 Bxd1','Bxf7+ Ke7 Nd5#','الوزير اتاخد. ابدأ بكش يجبر الملك يخرج للوسط.']],
 'Forrest Gump Mate':[[start,'d4 f5 Nf3 Nf6 Bg5 e6 Nc3 Be7 Bxf6 Bxf6 e4 fxe4 Nxe4 b6 Ne5 O-O Bd3 Bb7 Qh5 Qe7 Qxh7+ Kxh7 Nxf6+ Kh6 Neg4+ Kg5','h4+ Kf4 g3+ Kf3 Be2+ Kg2 Rh2+ Kg1 Kd2#','كمل المطاردة بكش ببيدق h.']],
 'Opening Traps in Bullet':[[start,'e4 e5 Bc4 Nc6 Qh5','g6 Qf3 Nf6','سدّ قطر الوزير الأبيض وهاجمه في نفس النقلة.']],
 'Premoves in Bullet':[['6k1/p4ppp/8/5b2/8/3B4/2P2PPP/6K1 b - - 0 1','Bxd3','cxd3','الأسود نفّذ التبديل. استرد الفيل بالبيدق.']],
 'Time Management in Bullet':[[start,'e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 Nxe5','Qd4 Nf3 Qxe4+','استغل الطريق المفتوح للوزير وهاجم هدفين.']],
 'How to Checkmate in Bullet':[['8/6k1/R7/1R6/8/8/8/4K3 w - - 0 1','','Rb7+ Kg8 Ra8#','سيب رخ a6 يحرس الصف السادس. ابدأ السُلّم بالرخ التاني.']],
 'Flagging Your Opponent':[['6k1/5ppp/8/8/8/8/r4PPP/4R1K1 w - - 0 1','','Re8#','الوقت قليل. اختار المات المباشر.']]
};
