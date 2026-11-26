import {Chess} from './chess.js';
// Original instructional positions; motifs follow the standard taxonomy at lichess.org/practice.
const row=(id,theme,level,fen,line,explain,hint)=>({id,theme,level,fen,line:line.split(' '),explain,hint});
export const bank=[
row('loose-rook','قطعة غير محمية',1,'6k1/8/8/8/3r4/8/8/3R2K1 w - - 0 1','Rxd4','رخ d4 غير محمي. قبل البحث عن تركيبات صعبة، افحص الأخذ المجاني وأمان قطعة الأخذ.','افحص عمود d.'),
row('loose-knight','قطعة غير محمية',1,'6k1/8/8/8/2n5/8/4B3/6K1 w - - 0 1','Bxc4+','الفيل يصل إلى c4 عبر d3، ويأخذ الحصان غير المحمي بكش على الملك g8.','تتبّع قطر الفيل الأبيض.'),
row('loose-queen','قطعة غير محمية',1,'6k1/8/8/8/4q3/8/8/4R1K1 w - - 0 1','Rxe4','الوزير الأسود بلا حماية على عمود الرخ. قيمة القطع تساعدك تختار الأخذ المربح.','هناك قطعة ثمينة على عمود e.'),
row('fork-rook','الشوكة',2,'3r3k/8/8/4N3/8/8/8/6K1 w - - 0 1','Nf7+ Kg8 Nxd8','Nf7+ يهاجم الملك h8 والرخ d8 معًا. بعد رد الملك النموذجي تأخذ الرخ.','ابحث عن كش بالحصان يهاجم قطعة ثانية.'),
row('fork-corner','الشوكة',2,'r3k3/8/8/3N4/8/8/8/6K1 w - - 0 1','Nc7+ Kd8 Nxa8','الحصان على c7 يهاجم الملك e8 والرخ a8 في نفس الوقت.','مربع يجمع تهديد الملك والرخ.'),
row('fork-queen','قطعة غير محمية',1,'4k3/8/3q4/8/4N3/8/8/6K1 w - - 0 1','Nxd6+','الحصان يأخذ الوزير مع كش، فلا يملك الخصم وقتًا لتهديد مقابل. هذا مثال للأخذ بكش.','افحص أخذ الوزير بالحصان.'),
row('pin-knight','التثبيت',1,'4k3/4n3/8/2B5/8/8/8/K3R3 w - - 0 1','Bxe7','حصان e7 مثبت أمام ملك e8 بواسطة الرخ e1. الفيل يستطيع أخذه وهو محمي بالرخ.','أي قطعة سوداء لا تستطيع الابتعاد عن عمود الملك؟'),
row('pin-bishop','التثبيت',1,'4k3/4b3/2N5/8/8/8/8/K3R3 w - - 0 1','Nxe7','فيل e7 محصور على خط الملك والرخ. خذه بالحصان؛ والرخ يحمي مربع e7.','الحصان يستطيع مهاجمة القطعة المثبتة.'),
row('skewer-file','السيخ',2,'4r3/8/4k3/8/8/8/8/K2R4 w - - 0 1','Re1+ Kd6 Rxe8','كش على الملك الأمامي، وخلفه رخ. بعد ابتعاد الملك في هذا الخط تفوز بالرخ.','ضع الملك والرخ الأسودين على خط رخك.'),
row('skewer-rank','السيخ',2,'8/8/8/8/8/8/r3k3/3R2K1 w - - 0 1','Rd2+ Ke3 Rxa2','الرخ على d2 يهاجم الملك e2 وخلفه رخ a2. بعد رد الملك النموذجي خذ الرخ.','ابحث عن كش أفقي بالرخ.'),
row('discovery-file','الهجوم المكتشف',2,'4k3/8/8/8/8/4B3/8/K3R3 w - - 0 1','Bf4+','الفيل يترك عمود e فيكشف كش الرخ. الفكرة هنا هي فتح خط الرخ إلى الملك.','أي قطعة تحجب خط الرخ؟'),
row('discovery-rook','الهجوم المكتشف',2,'4r1k1/8/8/8/8/4B3/8/K3R3 w - - 0 1','Bd4','تحريك الفيل يفتح عمود e ليهاجم الرخ الأبيض الرخ الأسود. هذه نقلة تكشف هجومًا، وليست ادعاءً بربح إجباري.','افتح عمود الرخ بتحريك الفيل.'),
row('double-bishop','الكش المزدوج',1,'4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1','Bb5+','الفيل يوجّه كش من b5، وفي نفس الوقت يكشف كش الرخ على عمود e. في الكش المزدوج يلزم تحريك الملك.','اجعل الفيل والرخ يعطيان كش معًا.'),
row('double-diagonal','الكش المزدوج',1,'4k3/8/8/8/8/8/4B3/4R1K1 w - - 0 1','Bb5+','تحريك الفيل إلى b5 يفتح عمود e ويهاجم الملك قطريًا أيضًا.','ابحث عن كش بالفيل يفتح خط الرخ.'),
row('remove-pawn','إزالة المدافع',2,'5rk1/5p2/6q1/8/2B3Q1/8/8/K7 w - - 0 1','Bxf7+ Rxf7 Qxg6+','بيدق f7 يحمي الوزير g6. نزيله بكش، ثم بعد Rxf7 في الخط المعروض نأخذ الوزير بكش.','من يحمي الوزير على g6؟ هل تزيله بكش؟'),
row('promotion-check','الترقية',1,'7k/4P3/6K1/8/8/8/8/8 w - - 0 1','e8=Q#','الترقية إلى وزير هنا تعطي كش مات. افحص أثر القطعة الجديدة قبل اختيار نوع الترقية.','البيدق على بُعد خطوة واحدة.'),
row('promotion-rook','الترقية',1,'7k/2P5/8/8/8/8/8/K7 w - - 0 1','c8=Q+','الترقية تصنع وزيرًا ويأتي الكش على الصف الثامن.','أوصل البيدق للصف الأخير.'),
row('mate-back','كش مات',1,'6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1','Re8#','بيادق الملك تمنعه من الهروب، والرخ يغلق الصف الأخير.','ابحث عن كش على الصف الأخير.'),
row('mate-queen','كش مات',1,'7k/8/5KQ1/8/8/8/8/8 w - - 0 1','Qg7#','الوزير محمي بالملك، ويسد مربعات هروب ملك الخصم.','قرّب الوزير مع إبقائه محميًا.'),
row('mate-smother','كش مات',2,'6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1','Nf7#','الملك محبوس بقطعه؛ الحصان يوجه المات بالقفز.','الحصان يهاجم ملكًا بلا مربعات هروب.'),
row('mate-ladder','كش مات',1,'7k/R7/8/8/8/8/8/1R4K1 w - - 0 1','Rb8#','رخ على الصف السابع يحرم الملك من الهرب، والثاني يعطي المات.','الصف السابع مغلق بالفعل.'),
row('mate-bishop','كش مات',1,'7k/5K2/7B/8/8/3B4/8/8 w - - 0 1','Bg7#','فيل g7 يعطي الكش، وفيل d3 يحرم الملك من h7، والملك الأبيض يغطي g8.','نسّق الفيلين والملك.'),
row('win-queen-check','قطعة غير محمية',1,'4k3/8/8/3q4/8/2N5/8/6K1 w - - 0 1','Nxd5','الحصان يأخذ الوزير غير المحمي. انتبه: هذه النقلة ليست كش؛ افحص الوضع بدل افتراض أن كل أخذ تهديد للملك.','هل تستطيع أخذ الوزير بأمان؟'),
row('win-rook-bishop','قطعة غير محمية',1,'6k1/8/8/5r2/8/3B4/8/6K1 w - - 0 1','Bxf5','الفيل يأخذ رخًا غير محمي على f5. افحص القطع على الأقطار قبل النقل.','تتبّع d3–e4–f5.')
];
export const themes={
'قطعة غير محمية':'قطعة يمكن أخذها دون تعويض مناسب للخصم. افحص أمان قطعة الأخذ أيضًا.',
'الشوكة':'قطعة واحدة تصنع تهديدين أو أكثر. الكش يجبر الخصم غالبًا على الاهتمام بالملك أولًا.',
'التثبيت':'قطعة أمام الملك لا تستطيع الابتعاد إذا كشفت ملكها للكش. استغل قلة حركتها.',
'السيخ':'تهاجم قطعة ثمينة على خط، وخلفها قطعة أخرى. بعد تحرك الأولى قد تكسب الثانية.',
'الهجوم المكتشف':'حرّك قطعة لتفتح خط هجوم قطعة خلفها. افحص ما الذي يمنع الخصم من معالجة التهديد.',
'الكش المزدوج':'قطعتان تعطيان كش في الوقت نفسه. لا يكفي الأخذ أو الحجب؛ يلزم تحريك الملك.',
'إزالة المدافع':'أزل القطعة التي تحمي هدفًا مهمًا، ثم استغل ضعف الهدف بعد رد الخصم.',
'الترقية':'بلوغ البيدق آخر صف يغيّر قوته. اختر القطعة المناسبة وافحص الكش والخنق.',
'كش مات':'الملك في كش ولا يوجد رد قانوني ينقذه. افحص مربعات الهروب والأخذ والحجب.',
'الأخذ بكش':'الأخذ المصحوب بكش يجمع ربح مادة وتهديد الملك. تحقّق من علامة الكش على الرقعة.'};

// Historical moves with original instructional explanations.
const morphy=new Chess();for(const m of 'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7'.split(' '))morphy.move(m);
bank.push(row('morphy-opera','كش مات',2,morphy.fen(),'Qb8+ Nxb8 Rd8#','من مباراة الأوبرا، مورفي ١٨٥٨: Qb8+ يجبر الحصان على ترك d7، ثم Rd8 مات. الشرح أصلي. مصدر السجل: chess.com/terms/opera-game-chess','ابحث عن كش بالوزير يفتح طريق الرخ للمات.'));
const capa=new Chess();for(const m of 'd4 d5 c4 e6 Nc3 Nf6 Nf3 Be7 Bg5 O-O e3 Nbd7 Rc1 b6 cxd5 exd5 Qa4 Bb7 Ba6 Bxa6 Qxa6 c5 Bxf6 Nxf6 dxc5 bxc5 O-O Qb6 Qe2 c4 Rfd1 Rfd8 Nd4 Bb4 b3 Rac8 bxc4 dxc4 Rc2 Bxc3 Rxc3 Nd5 Rc2 c3 Rdc1 Rc5 Nb3 Rc6 Nd4 Rc7 Nb5 Rc5 Nxc3 Nxc3 Rxc3 Rxc3 Rxc3 Qb2 Qxb2'.split(' '))capa.move(m);
bank.push(row('capablanca-backrank','كش مات',2,capa.fen(),'Rd1#','فرع تعليمي بعد مباراة برنشتاين–كابابلانكا ١٩١٤: لو أخذ الأبيض الوزير بـQxb2، يكون Rd1 ماتًا. المباراة الأصلية انتهت قبل هذا الفرع باستسلام الأبيض.','الأسود يلعب؛ افحص الصف الأول وبيادق الملك.'));
// Mirrored training counterparts make the learner play Black; not new historical games.
const blackSeeds=bank.filter(p=>['loose-rook','loose-knight','loose-queen','fork-rook','fork-corner','pin-knight','pin-bishop','skewer-file','skewer-rank','discovery-file','double-bishop','remove-pawn'].includes(p.id));
const mirrorSquare=s=>s[0]+(9-Number(s[1]));const mirrorText=s=>s.replace(/\b([a-h])([1-8])\b/g,(_,f,r)=>f+(9-Number(r))).replace(/الأسود|الأبيض|السوداء|البيضاء/g,x=>({'الأسود':'الأبيض','الأبيض':'الأسود','السوداء':'البيضاء','البيضاء':'السوداء'}[x]));
for(const p of blackSeeds){const src=new Chess(p.fen),parts=p.fen.split(' ');const placement=parts[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/');const fen=placement+' '+(parts[1]==='w'?'b':'w')+' - - 0 1',dst=new Chess(fen),line=[];for(const san of p.line){const m=src.move(san);line.push(dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to),promotion:m.promotion||'q'}).san)}bank.push({...p,id:p.id+'-black',fen,line,explain:'نسخة تعليمية من منظور الأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint),variant:'black'})}
function fromOpening(id,theme,prefix,line,explain,hint){const c=new Chess();for(const m of prefix.split(' '))c.move(m);return row(id,theme,2,c.fen(),line,explain,hint)}
bank.push(fromOpening('scholar-target','كش مات','e4 e5 Bc4 Nc6 Qh5 Nf6','Qxf7#','الفيل c4 يحمي مربع f7. أخذ f7 بالوزير يعطي المات هنا، بعد خطأ الأسود في الدفاع. هذه فرصة مشروطة بالوضع، وليست خطة مضمونة في كل افتتاح.','افحص f7 وحماية الفيل للوزير.'));
bank.push(fromOpening('active-pieces-trap','كش مات','e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3 Bh5','Nxe5 Bxd1 Bxf7+ Ke7 Nd5#','خط تعليمي يوضح خطر الطمع في الوزير مع تأخر التطوير. المات يعتمد على رد Bxd1 المعروض؛ للأسود بدائل، فلا تعتبر التضحية إجبارية بلا حساب.','احسب كشات الفيل والحصان إذا أخذ الأسود الوزير.'));
bank.push(fromOpening('opening-pin','التثبيت','e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Nf6','Bb5','الفيل على b5 يثبت حصان c6 أمام الملك e8 عبر d7 الخالي. ظهور فكرة صحيحة لا يعني أن هذه هي النقلة الوحيدة الجيدة.','افحص قطر b5–e8.'));
bank.push(row('pawn-fork-two','الشوكة',2,'6k1/5ppp/4p3/3r1n2/8/4P3/5PPP/6K1 w - - 0 1','e4','البيدق على e4 يهاجم الرخ d5 والحصان f5. قبل اعتبار الربح مضمونًا، افحص كشات الخصم والدفاعات المضادة.','البيدق يستطيع صناعة تهديدين في نقلة واحدة.'));
bank.push(row('bishop-skewer-queen','السيخ',2,'4q3/3k4/8/8/2B5/8/5PPP/6K1 w - - 0 1','Bb5+ Kd6 Bxe8','الفيل يعطي كش على قطر الملك والوزير. بعد رد الملك النموذجي يأخذ الوزير e8.','ضع الملك والوزير الأسودين على قطر واحد.'));
bank.push(row('queen-double-threat','الشوكة',2,'r3k3/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1','Qa4+ Kf8 Qxa8+','الوزير يعطي كش من a4 ويهاجم الرخ a8. بعد رد الملك النموذجي يكسب الرخ بكش.','ابحث عن كش بالوزير يصنع تهديدًا على عمود a.'));

// Additional original exercises: forcing checks, pinned defenders, and knight geometry.
const extension=[
row('backrank-second-file','كش مات',1,'6k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1','Rc8#','الرخ يصل إلى c8 ويغلق الصف الثامن. بيادق f7 وg7 وh7 تمنع هروب الملك، ولا يستطيع الأسود الأخذ أو الحجب.','افحص الصف الأخير ومربعات هروب الملك.'),
row('queen-supported-mate','كش مات',1,'k7/8/1QK5/8/8/8/8/8 w - - 0 1','Qb7#','الوزير على b7 محمي بالملك c6؛ يغطي a7 وb8 ويعطي كش للملك a8. لا تضع الوزير بجوار الملك إلا بعد التأكد من حمايته.','ابحث عن وزير محمي بجوار الملك.'),
row('bishop-rook-double','الكش المزدوج',2,'3k4/8/8/8/8/8/3B4/K2R4 w - - 0 1','Bg5+','الفيل يفتح عمود d للرخ ويعطي كش على القطر g5–f6–e7–d8 في الوقت نفسه. الهدف إنشاء كش مزدوج؛ هذه ليست دعوى بمات أو ربح مادة إجباري.','افتح خط الرخ مع كش بالفيل.'),
row('skewer-other-file','السيخ',2,'1r6/8/1k6/8/8/8/8/2R3K1 w - - 0 1','Rb1+ Kc6 Rxb8','Rb1+ يضع الملك b6 والرخ b8 على عمود واحد. بعد Kc6 في الخط النموذجي يأخذ الرخ الأبيض رخ b8. احسب أولًا ردود الملك ولا تكتفِ بالتعرف على الشكل.','اجمع الملك والرخ على عمود b.')
];
for(const p of extension){bank.push(p);const src=new Chess(p.fen),parts=p.fen.split(' '),placement=parts[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/');const fen=placement+' b - - 0 1',dst=new Chess(fen),line=[];for(const san of p.line){const m=src.move(san);line.push(dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to),promotion:m.promotion||'q'}).san)}bank.push({...p,id:p.id+'-black',fen,line,explain:'نسخة تدريب للأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint),variant:'black'})}
