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
row('skewer-rank','السيخ',2,'8/8/8/8/8/8/1k3r2/R5K1 w - - 0 1','Ra2+ Kc3 Rxf2','الرخ على a2 يعطي كش للملك b2، وخلف الملك رخ f2. بعد ابتعاد الملك في هذا الخط يأخذ الرخ.','ابحث عن كش أفقي يضع الملك أمام الرخ.'),
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
bank.push(row('morphy-opera','الإلهاء',3,morphy.fen(),'Qb8+ Nxb8 Rd8#','من مباراة الأوبرا، مورفي ١٨٥٨: Qb8+ يجبر الحصان على ترك d7، ثم Rd8 مات. الشرح أصلي. مصدر السجل: chess.com/terms/opera-game-chess','ابحث عن كش بالوزير يفتح طريق الرخ للمات.'));
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

export const tacticalLessons={
'قطعة غير محمية':{detect:'افحص القطع التي لا يدافع عنها شيء، والقطع التي يفوق عدد مهاجميها عدد مدافعيها.',calculate:'احسب الأخذ والاسترداد وقيمة القطع، ثم افحص كشات الخصم.',mistake:'القطعة غير المحمية ليست دائمًا مجانية؛ قد تكون طُعمًا.'},
'الشوكة':{detect:'ابحث عن هدفين يمكن لقطعة واحدة مهاجمتهما، خصوصًا الملك والوزير أو الرخ.',calculate:'ابدأ بالكشات، وافحص هل يستطيع الخصم أخذ القطعة المهاجمة أو إنقاذ الهدفين معًا.',mistake:'لا تفترض أن كل شوكة تكسب مادة؛ قد توجد نقلة مضادة.'},
'التثبيت':{detect:'ابحث عن قطعتين على خط رخ أو فيل أو وزير؛ القطعة الأمامية تحجب هدفًا خلفها.',calculate:'فرّق بين التثبيت المطلق أمام الملك والنسبي أمام قطعة ثمينة. زوّد الضغط على القطعة المثبتة.',mistake:'القطعة المثبتة نسبيًا تستطيع التحرك قانونيًا، والمثبتة مطلقًا قد تتحرك على خط التثبيت.'},
'السيخ':{detect:'ابحث عن ملك أو قطعة ثمينة أمام قطعة أخرى على نفس الخط.',calculate:'افحص كل مربعات هروب الهدف الأمامي وإمكانية الحجب أو أخذ المهاجم.',mistake:'قد يستطيع الخصم حماية الهدف الخلفي أثناء الهروب.'},
'الهجوم المكتشف':{detect:'ابحث عن قطعة صديقة تحجب خط رخ أو فيل أو وزير نحو هدف.',calculate:'حرّك القطعة الحاجبة مع تهديد إضافي، وافحص رد الخصم على التهديدين.',mistake:'فتح الخط وحده لا يضمن ربح قطعة.'},
'الكش المزدوج':{detect:'ابحث عن قطعة تستطيع إعطاء كش أثناء كشف خط قطعة أخرى نحو الملك.',calculate:'احسب نقلات الملك القانونية فقط؛ قد يأخذ الملك إحدى القطعتين إذا كان مربعها آمنًا.',mistake:'الكش المزدوج ليس بالضرورة كش مات.'},
'إزالة المدافع':{detect:'حدد القطعة التي تحمي هدفًا ثمينًا أو مربع مات.',calculate:'احسب أخذ المدافع أو إبعاده، ثم افحص وجود مدافع آخر أو رد أقوى.',mistake:'لا تضحّ بقطعة قبل حساب الاسترداد والتهديدات المضادة.'},
'الترقية':{detect:'ابحث عن بيدق قريب من الصف الأخير، خاصة إذا كانت الترقية بكش.',calculate:'قارن الوزير والرخ والفيل والحصان عند الحاجة، وافحص التعادل بالخنق.',mistake:'الترقية إلى وزير ليست دائمًا الاختيار الأفضل.'},
'كش مات':{detect:'افحص الملك المحصور ومربعات الهروب والقطع التي تستطيع إعطاء كش.',calculate:'لكل كش افحص الأخذ والحجب وهروب الملك؛ إذا لم يوجد رد قانوني فهو مات.',mistake:'لا تخلط بين الكش والمات، ولا تنس حماية القطعة المهاجمة.'},
'الدفاع':{detect:'قبل الهجوم افحص كشات الخصم والقطع المهددة.',calculate:'قارن الهروب والحماية والأخذ والتهديد المضاد.',mistake:'الهروب ليس الحل الوحيد في المباراة الحقيقية.'}
};

bank.push(row("rook-mate-black-new","كش مات",1,"4r1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1","Re1#","الرخ يغلق الصف الأول، وبيادق الأبيض تمنع هروب الملك. افحص الحجب والأخذ قبل إعلان المات.","افحص الصف الأول."));
bank.push(row("loose-bishop-black-new","قطعة غير محمية",1,"6k1/8/3b4/8/5R2/8/8/6K1 b - - 0 1","Bxf4","الفيل يأخذ الرخ غير المحمي عبر e5. افحص أمان الفيل بعد الأخذ.","تتبع قطر الفيل."));
bank.push(row("queen-mate-black-new","كش مات",1,"8/8/8/8/8/5kq1/8/7K b - - 0 1","Qg2#","الوزير محمي بالملك ويغلق مربعات الهروب حول h1.","ابحث عن كش بوزير محمي."));
export const advancedThemes={"الإلهاء":"Deflection","الاستدراج":"Decoy","التحميل الزائد":"Overloading","قطع خط الدفاع":"Interference","النقلة البينية":"Zwischenzug"};
themes["الإلهاء"]="إجبار المدافع على ترك مهمة دفاعية مهمة."; tacticalLessons["الإلهاء"]={"detect":"ابحث عن قطعة تحمي هدفًا ويمكن تهديدها أو إجبارها على الأخذ بعيدًا عنه.","calculate":"احسب ردود المدافع البديلة قبل التضحية.","mistake":"لا تفترض أن الخصم مضطر للأخذ."};
themes["الاستدراج"]="جذب قطعة الخصم إلى مربع يجعلها عرضة لتكتيك."; tacticalLessons["الاستدراج"]={"detect":"ابحث عن مربع يؤدي وصول الملك أو الوزير إليه إلى شوكة أو مات.","calculate":"احسب النقلات الإجبارية التي تجذب الهدف ثم نفّذ الفكرة.","mistake":"قد يرفض الخصم الطعم."};
themes["التحميل الزائد"]="مدافع واحد مسؤول عن أكثر من مهمة لا يستطيع تنفيذها معًا."; tacticalLessons["التحميل الزائد"]={"detect":"حدد القطع التي تحمي هدفين أو مربع مات وقطعة أخرى.","calculate":"احسب أي مهمة دفاعية ستنهار بعد التهديد الأول.","mistake":"وجود مهمتين لا يعني أن المدافع عاجز عن أدائهما."};
themes["قطع خط الدفاع"]="وضع قطعة بين مدافع والهدف الذي يحميه."; tacticalLessons["قطع خط الدفاع"]={"detect":"تتبع خطوط الرخ والفيل والوزير وابحث عن مربع تقاطع.","calculate":"احسب الأخذ والحجب والتهديد الناتج بعد قطع الخط.","mistake":"قد يتمكن الخصم من إزالة القطعة الحاجبة."};
themes["النقلة البينية"]="نقلة إجبارية بين نقلتين متوقعتين، تغير نتيجة الحساب."; tacticalLessons["النقلة البينية"]={"detect":"قبل الاسترداد التلقائي افحص الكشات والتهديدات الأقوى.","calculate":"احسب رد الخصم ثم عد إلى الاسترداد إن ظل ممكنًا.","mistake":"تأكد أن تأجيل الاسترداد لا يضيّع المادة."};

bank.push(row("zwischenzug-mate","النقلة البينية",3,"6k1/5ppp/8/8/8/8/3q1PPP/3RR1K1 w - - 0 1","Re8#","الوزير الأسود على d2 تحت هجوم الرخ d1، لكن الأبيض يملك نقلة أقوى من الأخذ: Re8 مات. هذا تدريب على البحث عن نقلة إجبارية قبل الأخذ، وهو المبدأ الذي تحتاجه في النقلة البينية.","افحص الكش قبل الأخذ."));

bank.push(row("fork-king-rook-b","الشوكة",2,"6k1/8/8/8/3n4/8/8/R3K3 b - - 0 1","Nc2+ Kd2 Nxa1","الحصان يهاجم الملك e1 والرخ a1 معًا. بعد رد الملك النموذجي يأخذ الرخ.","ابحث عن كش بالحصان يهاجم الرخ."));
bank.push(row("mate-black-ladder","كش مات",1,"1r4k1/8/8/8/8/8/r7/7K b - - 0 1","Rb1#","رخ a2 يمنع الهروب إلى الصف الثاني، والرخ الآخر يعطي المات على الصف الأول.","نسّق الرخين."));
bank.push(row("pawn-fork-black","الشوكة",2,"6k1/5ppp/4p3/8/3R1N2/8/5PPP/6K1 b - - 0 1","e5","البيدق يهاجم الرخ d4 والحصان f4 معًا. افحص الردود المضادة قبل افتراض ربح مادة.","ابحث عن هجوم مزدوج بالبيدق."));
bank.push(row("promotion-black-mate","الترقية",1,"8/8/8/8/8/6k1/4p3/7K b - - 0 1","e1=Q#","الترقية بكش مات؛ الملك الأسود يغطي مربعات الهروب القريبة.","رقّ البيدق مع كش."));
bank.push(row("loose-queen-black","قطعة غير محمية",1,"6k1/8/4r3/8/4Q3/8/8/6K1 b - - 0 1","Rxe4","الوزير الأبيض غير محمي على عمود e؛ الرخ يأخذه دون استرداد مباشر.","افحص عمود e."));
bank.push(row("decoy-king-fork-new","الاستدراج",3,"4k3/3r1r2/8/8/6N1/8/3Q4/6K1 w - - 0 1","Qxd7+ Kxd7 Ne5+ Ke6 Nxf7","في هذا الخط يستدرج الوزير الملك إلى d7، ثم يصنع الحصان شوكة على الملك والرخ f7. لكن التضحية لا تضمن ربحًا: للأسود ردود أخرى، وحتى في الخط المعروض يحصل الأبيض على رخين مقابل الوزير. احسب المادة قبل اختيار التضحية.","ابحث عن مربع يجمع الملك والرخ في شوكة حصان."));
bank.push(row("zwischenzug-check-first","النقلة البينية",3,"6k1/8/8/7Q/8/8/3q4/3R2K1 w - - 0 1","Qe8+ Kh7 Rxd2","في الرد النموذجي يبدأ الأبيض بكش قبل أخذ الوزير على d2. احسب الردود الأخرى؛ هذا مثال لترتيب النقلات وليس ادعاءً بأن الكش أفضل من الأخذ المباشر.","قارن الأخذ المباشر بالكش."));
bank.push(row("interference-bishop-line","قطع خط الدفاع",3,"r5k1/8/8/8/8/8/q7/R2B2K1 w - - 0 1","Ba4","الفيل على a4 يقطع خط الرخ a8 نحو الوزير a2. الفكرة هندسية فقط: لا يعني ذلك أن الأبيض يربح الوزير إجبارًا، فالأسود يستطيع الرد على التهديد.","ابحث عن مربع بين الرخ والوزير."));
bank.push(row("overload-rook-two-targets","التحميل الزائد",3,"3r2k1/5ppp/8/3q4/8/8/5PPP/3RR1K1 w - - 0 1","Rxd5 Rxd5 Re8#","الرخ الأسود d8 يحمي الوزير d5 ويمنع دخول الرخ الأبيض إلى e8 بالحجب أو الأخذ. بعد أخذ الوزير، إذا استرد الرخ على d5 يترك الصف الثامن، فيأتي Re8 مات. احسب أيضًا ردود الأسود الأخرى.","أي مدافع يحمي الوزير والصف الأخير معًا؟"));
bank.push(row("quiet-mate-two","كش مات",2,"7k/8/8/Q4K2/8/8/8/8 w - - 0 1","Kg6 Kg8 Qa8#","النقلة الهادئة Kg6 تغلق h7 وg7، وتجبر الملك على Kg8. بعدها Qa8 مات؛ الملك الأبيض يمنع الهروب إلى الصف السابع. ليست كل بداية لتركيبة مات كشًا.","ابحث عن نقلة بالملك تقيد الهروب."));
bank.push(row("quiet-mate-two-black","كش مات",2,"8/8/8/8/q4k2/8/8/7K b - - 0 1","Kg3 Kg1 Qa1#","الملك الأسود يتقدم إلى g3 ويغلق h2 وg2، فيجبر الأبيض على Kg1. ثم Qa1 مات. هذه نسخة معكوسة للتدريب بالأسود.","قيد مربعات هروب الملك قبل الكش."));
bank.push(row("anastasia-mate","كش مات",2,"7k/4N1p1/8/8/8/8/8/K5R1 w - - 0 1","Rh1#","مات أناستازيا: الرخ يسيطر على عمود h، والحصان e7 يغطي g8 وg6، والبيدق الأسود g7 يسد مربع الهروب.","ابحث عن كش بالرخ على عمود h."));
for(const id of ["anastasia-mate"]){const p=bank.find(x=>x.id===id),src=new Chess(p.fen),placement=p.fen.split(' ')[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/'),fen=placement+' b - - 0 1',dst=new Chess(fen),line=p.line.map(s=>{const m=src.move(s);return dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to)}).san});bank.push({...p,id:id+'-black',fen,line,explain:'نسخة تدريب للأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint)})}

bank.push(row("arabian-correct","كش مات",2,"7k/6R1/5N2/8/8/8/8/K7 w - - 0 1","Rh7#","المات العربي (Arabian Mate): الرخ على h7 يعطي الكش ويغطي g7، والحصان f6 يحمي الرخ ويغطي g8. لا يبقى للملك مربع هروب.","ابحث عن كش بالرخ يحميه الحصان."));
for(const id of ["arabian-correct"]){const p=bank.find(x=>x.id===id),src=new Chess(p.fen),placement=p.fen.split(' ')[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/'),fen=placement+' b - - 0 1',dst=new Chess(fen),line=p.line.map(s=>{const m=src.move(s);return dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to)}).san});bank.push({...p,id:id+'-black',fen,line,explain:'نسخة تدريب للأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint)})}

bank.push(row("boden-mate","كش مات",2,"2kr4/3p4/8/8/5B2/3B4/8/K7 w - - 0 1","Ba6#","مات بودين (Boden’s Mate): الفيل a6 يعطي كش عبر b7، والفيل f4 يغطي c7 وb8. الرخ d8 والبيدق d7 يسدان بقية مخارج الملك.","افحص القطرين المتقاطعين."));
bank.push(row("damiano-mate","كش مات",2,"7k/Q7/6P1/8/8/8/8/K7 w - - 0 1","Qh7#","مات داميانو (Damiano’s Mate): البيدق g6 يحمي الوزير على h7، والوزير يغطي g8 وg7 ويعطي المات.","استغل حماية البيدق للوزير."));
for(const id of ["boden-mate","damiano-mate"]){const p=bank.find(x=>x.id===id),src=new Chess(p.fen),placement=p.fen.split(' ')[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/'),fen=placement+' b - - 0 1',dst=new Chess(fen),line=p.line.map(s=>{const m=src.move(s);return dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to)}).san});bank.push({...p,id:id+'-black',fen,line,explain:'نسخة تدريب للأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint)})}

bank.push(row("pawn-fork-central","الشوكة",1,"6k1/8/8/2r1b3/8/3P4/8/6K1 w - - 0 1","d4","البيدق على d4 يهاجم الرخ c5 والفيل e5 في الوقت نفسه. افحص هل يستطيع الخصم إنقاذ القطعتين أو أخذ البيدق قبل افتراض الربح.","ابحث عن هجوم مزدوج بالبيدق."));
bank.push(row("bishop-pin-queen","التثبيت",1,"4k3/4q3/8/2B5/8/8/8/K3R3 w - - 0 1","Bxe7","الوزير e7 مثبت أمام الملك بواسطة الرخ e1، والفيل يأخذه على مربع يحميه الرخ. الملك لا يستطيع الاسترداد.","استغل القطعة المثبتة أمام الملك."));
bank.push(row("knight-fork-queen-check","الشوكة",2,"4k3/8/4q3/3N4/8/8/8/6K1 w - - 0 1","Nc7+ Kd8 Nxe6+","الحصان على c7 يهاجم الملك e8 والوزير e6. بعد Kd8 يأخذ الوزير بكش. افحص ردود الملك الأخرى قبل اعتبار الربح مضمونًا.","ابحث عن كش بالحصان يهاجم الوزير أيضًا."));
for(const id of ["pawn-fork-central","bishop-pin-queen","knight-fork-queen-check"]){const p=bank.find(x=>x.id===id),src=new Chess(p.fen),placement=p.fen.split(' ')[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/'),fen=placement+' b - - 0 1',dst=new Chess(fen),line=p.line.map(s=>{const m=src.move(s);return dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to)}).san});bank.push({...p,id:id+'-black',fen,line,explain:'نسخة تدريب للأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint)})}

bank.push(row("discovered-check-queen","الهجوم المكتشف",2,"4k3/8/8/8/8/4B3/3q4/K3R3 w - - 0 1","Bxd2+","الفيل يأخذ الوزير على d2 ويكشف كش الرخ على عمود e في الوقت نفسه. افحص دائمًا ما تستطيع القطعة الحاجبة أخذه أثناء فتح الخط.","ابحث عن أخذ يكشف كشًا."));
bank.push(row("double-check-capture","الكش المزدوج",2,"4k3/8/8/1r6/8/8/4B3/K3R3 w - - 0 1","Bxb5+","الفيل يأخذ الرخ على b5 ويعطي كشًا على قطر b5–e8، وفي الوقت نفسه يكشف كش الرخ على عمود e. لا يستطيع الخصم الرد بالحجب وحده.","ابحث عن أخذ يعطي كشًا مزدوجًا."));
for(const id of ["discovered-check-queen","double-check-capture"]){const p=bank.find(x=>x.id===id),src=new Chess(p.fen),placement=p.fen.split(' ')[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/'),fen=placement+' b - - 0 1',dst=new Chess(fen),line=p.line.map(s=>{const m=src.move(s);return dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to)}).san});bank.push({...p,id:id+'-black',fen,line,explain:'نسخة تدريب للأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint)})}

bank.push(row("remove-bishop-rook","إزالة المدافع",2,"6k1/8/8/3r4/4b3/8/2B5/K2R4 w - - 0 1","Bxe4","الفيل يأخذ المدافع عن الرخ d5. إذا لم ينقذ الخصم الرخ، يصبح أخذه ممكنًا؛ لا تفترض أن الربح إجباري.","حدد القطعة التي تحمي الرخ d5."));
bank.push(row("remove-knight-queen","إزالة المدافع",2,"6k1/8/3n4/1q6/8/8/3R4/K2B4 w - - 0 1","Rxd6","الرخ يأخذ الحصان d6 الذي يحمي الوزير b5. افحص رد الخصم قبل محاولة أخذ الوزير.","أي قطعة تحمي الوزير؟"));
for(const id of ["remove-bishop-rook","remove-knight-queen"]){const p=bank.find(x=>x.id===id),src=new Chess(p.fen),placement=p.fen.split(' ')[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/'),fen=placement+' b - - 0 1',dst=new Chess(fen),line=p.line.map(s=>{const m=src.move(s);return dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to)}).san});bank.push({...p,id:id+'-black',fen,line,explain:'نسخة تدريب للأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint)})}

bank.push(row("loose-queen-rook-check","قطعة غير محمية",1,"6k1/8/8/8/6q1/8/8/K5R1 w - - 0 1","Rxg4+","الرخ يأخذ الوزير غير المحمي مع كش على عمود g.","افحص الأخذ على عمود g."));
bank.push(row("pin-rook-knight-new","التثبيت",2,"4k3/4r3/2N5/8/8/8/8/K3R3 w - - 0 1","Nxe7","الحصان يأخذ الرخ المثبت على عمود الملك، والرخ الأبيض يحمي e7.","استغل التثبيت المطلق."));
for(const id of ["loose-queen-rook-check","pin-rook-knight-new"]){const p=bank.find(x=>x.id===id),src=new Chess(p.fen),placement=p.fen.split(' ')[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/'),fen=placement+' b - - 0 1',dst=new Chess(fen),line=p.line.map(s=>{const m=src.move(s);return dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to)}).san});bank.push({...p,id:id+'-black',fen,line,explain:'نسخة تدريب للأسود. '+mirrorText(p.explain),hint:mirrorText(p.hint)})}

bank.push(row("forced-mate-72-0","كش مات",3,"8/8/8/2B5/1K6/8/7R/k7 w - - 0 1","Kb3 Kb1 Rh1#","مات في نقلتين: Kb3 يترك للخصم ردًا قانونيًا واحدًا (Kb1)، ثم Rh1# ينهي المباراة. افحص مربعات الهروب قبل اختيار النقلة الأولى.","ابحث عن نقلة تحصر رد الملك ثم مات."));
bank.push(row("forced-mate-72-1","كش مات",3,"8/6N1/8/3R4/K7/8/8/k7 w - - 0 1","Kb3 Kb1 Rd1#","مات في نقلتين: Kb3 يترك للخصم ردًا قانونيًا واحدًا (Kb1)، ثم Rd1# ينهي المباراة. افحص مربعات الهروب قبل اختيار النقلة الأولى.","ابحث عن نقلة تحصر رد الملك ثم مات."));
bank.push(row("forced-mate-72-2","كش مات",3,"7k/4K3/8/8/8/8/5R2/2B5 w - - 0 1","Kf7 Kh7 Rh2#","مات في نقلتين: Kf7 يترك للخصم ردًا قانونيًا واحدًا (Kh7)، ثم Rh2# ينهي المباراة. افحص مربعات الهروب قبل اختيار النقلة الأولى.","ابحث عن نقلة تحصر رد الملك ثم مات."));
bank.push(row("forced-mate-72-3","كش مات",3,"8/7B/8/2R5/5K2/8/8/7k w - - 0 1","Kg3 Kg1 Rc1#","مات في نقلتين: Kg3 يترك للخصم ردًا قانونيًا واحدًا (Kg1)، ثم Rc1# ينهي المباراة. افحص مربعات الهروب قبل اختيار النقلة الأولى.","ابحث عن نقلة تحصر رد الملك ثم مات."));
for(const id of ["forced-mate-72-0","forced-mate-72-1","forced-mate-72-2","forced-mate-72-3"]){const p=bank.find(x=>x.id===id),src=new Chess(p.fen),placement=p.fen.split(' ')[0].split('/').reverse().map(r=>r.replace(/[a-zA-Z]/g,x=>x===x.toUpperCase()?x.toLowerCase():x.toUpperCase())).join('/'),fen=placement+' b - - 0 1',dst=new Chess(fen),line=p.line.map(s=>{const m=src.move(s);return dst.move({from:mirrorSquare(m.from),to:mirrorSquare(m.to)}).san});bank.push({...p,id:id+'-black',fen,line,explain:'مات في نقلتين: '+line[0]+' يجبر الخصم على '+line[1]+' ثم '+line[2]+'.',hint:p.hint})}

 // Editorial audit: demonstration positions must not be scored as unique solutions.
const demoIds=new Set(['discovery-file','discovery-file-black','discovery-rook','double-bishop','double-bishop-black','double-diagonal','bishop-rook-double','bishop-rook-double-black','opening-pin','active-pieces-trap','pawn-fork-two','pawn-fork-black','pawn-fork-central','pawn-fork-central-black','decoy-king-fork-new','zwischenzug-check-first','interference-bishop-line','remove-bishop-rook','remove-bishop-rook-black','remove-knight-queen','remove-knight-queen-black','promotion-rook','skewer-rank','skewer-rank-black','skewer-file','skewer-file-black','skewer-other-file','skewer-other-file-black','bishop-skewer-queen','remove-pawn','remove-pawn-black']);
let queenBlackSeen=false;
for(const p of bank){
 if(p.id==='loose-queen-black'){if(queenBlackSeen)p.id='loose-queen-black-e6';queenBlackSeen=true}
 if(p.id==='zwischenzug-mate'){p.theme='كش مات';p.level=1;p.explain='قبل أخذ الوزير على d2، افحص الكشات: Re8# مات مباشر. هذا مثال لأولوية المات على كسب المادة.'}
 if(p.id==='fork-rook-black')p.explain=p.explain.replace('Nf7+','Nf2+');
 if(p.id==='remove-pawn-black')p.explain=p.explain.replace('Rxf7','Rxf2');
 if(p.id==='skewer-other-file-black')p.explain=p.explain.replace('Rb1+','Rb8+').replace('Kc6','Kc3');
 if(p.id==='knight-fork-queen-check-black')p.explain=p.explain.replace('Kd8','Kd1');
 if(p.id==='backrank-second-file-black')p.explain='الرخ يصل إلى c1 ويغلق الصف الأول. بيادق الأبيض f2 وg2 وh2 تمنع الهروب.';
 if(p.id==='remove-knight-queen'||p.id==='remove-knight-queen-black'){p.explain='مثال على أخذ مدافع، وليس ربحًا إجباريًا للوزير. احسب إمكانية استرداد الرخ والتهديدات المضادة.';p.hint='حدد الحصان المدافع ثم افحص الاسترداد.'}
 p.demonstration=demoIds.has(p.id);
 const b=new Chess(p.fen);let forced=true;for(let i=0;i<p.line.length;i++){if(i%2&&b.moves().length!==1)forced=false;b.move(p.line[i],{strict:true})}
 p.examReady=forced&&b.isCheckmate()&&!p.demonstration;
 if(p.id.startsWith('forced-mate-72'))p.level=2;
}

 // Remove misleading examples and exact color-normalized duplicates.
const retired=new Set(['remove-bishop-rook','remove-bishop-rook-black','remove-knight-queen','remove-knight-queen-black','pawn-fork-central','pawn-fork-central-black','decoy-king-fork-new','zwischenzug-check-first','interference-bishop-line','skewer-rank','skewer-rank-black','fork-king-rook-b','double-diagonal']);
for(let i=bank.length-1;i>=0;i--)if(retired.has(bank[i].id))bank.splice(i,1);

// One-move material exercises checked against every immediate legal reply.
const captureAudit=[{"id":"loose-rook","best":5,"alternatives":["Rxd4"]},{"id":"loose-knight","best":3,"alternatives":["Bxc4+"]},{"id":"loose-queen","best":9,"alternatives":["Rxe4"]},{"id":"fork-queen","best":9,"alternatives":["Nxd6+"]},{"id":"pin-knight","best":3,"alternatives":["Bxe7","Rxe7+"]},{"id":"pin-bishop","best":3,"alternatives":["Nxe7","Rxe7+"]},{"id":"win-queen-check","best":9,"alternatives":["Nxd5"]},{"id":"win-rook-bishop","best":5,"alternatives":["Bxf5"]},{"id":"loose-rook-black","best":5,"alternatives":["Rxd5"]},{"id":"loose-knight-black","best":3,"alternatives":["Bxc5+"]},{"id":"loose-queen-black","best":9,"alternatives":["Rxe5"]},{"id":"pin-knight-black","best":3,"alternatives":["Rxe2+","Bxe2"]},{"id":"pin-bishop-black","best":3,"alternatives":["Rxe2+","Nxe2"]},{"id":"loose-bishop-black-new","best":5,"alternatives":["Bxf4"]},{"id":"loose-queen-black-e6","best":9,"alternatives":["Rxe4"]},{"id":"bishop-pin-queen","best":9,"alternatives":["Bxe7","Rxe7+"]},{"id":"bishop-pin-queen-black","best":9,"alternatives":["Rxe2+","Bxe2"]},{"id":"discovered-check-queen","best":9,"alternatives":["Bxd2+"]},{"id":"double-check-capture","best":5,"alternatives":["Bxb5+"]},{"id":"discovered-check-queen-black","best":9,"alternatives":["Bxd7+"]},{"id":"double-check-capture-black","best":5,"alternatives":["Bxb4+"]},{"id":"loose-queen-rook-check","best":9,"alternatives":["Rxg4+"]},{"id":"pin-rook-knight-new","best":5,"alternatives":["Nxe7","Rxe7+"]},{"id":"loose-queen-rook-check-black","best":9,"alternatives":["Rxg5+"]},{"id":"pin-rook-knight-new-black","best":5,"alternatives":["Rxe2+","Nxe2"]}];
for(const p of bank){const a=captureAudit.find(x=>x.id===p.id);if(a){p.examReady=true;p.acceptedMoves=a.alternatives;p.explain+=' تم فحص الاسترداد المباشر؛ الحد الأدنى لكسب المادة '+a.best+' نقاط وفق قيم القطع التقليدية.';}}

// Difficulty reflects calculation length and instructional complexity.
for(const p of bank){const b=new Chess(p.fen);const pieces=b.board().flat().filter(Boolean).length;const turns=Math.ceil(p.line.length/2);p.level=turns>=3||p.id==='morphy-opera'||(turns>=2&&pieces>=12)?3:turns>=2||pieces>=12||['التحميل الزائد','الإلهاء','النقلة البينية'].includes(p.theme)?2:1;}

// Retire the unsound queen fork: Rxa4 refutes Qa4+.
const badQueenFork=bank.findIndex(p=>p.id==='queen-double-threat');if(badQueenFork>=0)bank.splice(badQueenFork,1);
for(const p of bank){if(['fork-rook','fork-corner','fork-rook-black','fork-corner-black','knight-fork-queen-check','knight-fork-queen-check-black'].includes(p.id)){p.explain+=' تم فحص جميع ردود الملك: يمكن كسب مادة في كل رد، مع احتمال استرداد الحصان في بعض خطوط شوكة الوزير.';}if(p.id==='overload-rook-two-targets')p.explain+=' فحص الردود المباشرة يؤكد مكسبًا ماديًا أو ماتًا بعد الاسترداد في الخط المعروض.';}

bank.push({...row("lasker-bauer-1889","إزالة المدافع",3,"r4rk1/1b2bppp/ppq1p3/2ppB2n/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 15","Bxh7+ Kxh7 Qxh5+ Kg8 Bxg7 Kxg7 Qg4+ Kh7 Rf3 e5 Rh3+ Qh6 Rxh6+ Kxh6 Qd7 Bf6 Qxb7","لاسكر – باور، أمستردام 1889. الفيلان يزيلان غطاء الملك، ثم ينتقل الرخ عبر f3 إلى h3 لإجبار الأسود على التضحية بالوزير. الشوكة Qd7 تكمل المكسب. هذا خط المباراة التاريخي، وليس كل الفروع. المصدر: https://chessmotion.com/explore/famous-chess-games/lasker-bauer-double-bishop-sacrifice","احسب إدخال الوزير والرخ بعد التضحية بالفيل."),demonstration:true,examReady:false,source:"https://chessmotion.com/explore/famous-chess-games/lasker-bauer-double-bishop-sacrifice"});
bank.push({...row("fischer-byrne-1956","الهجوم المكتشف",3,"r3r1k1/pp3pbp/1Bp1b1p1/8/2BP4/Q1n2N2/P4PPP/3R1K1R b - - 0 18","Bxc4+ Kg1 Ne2+ Kf1 Nxd4+ Kg1 Ne2+ Kf1 Nc3+ Kg1 axb6","بيرن – فيشر، نيويورك 1956. بعد التضحية بالوزير، يستخدم الأسود الفيل والحصان لتتابع الكشات المكتشفة، فيأخذ بيدق d4 ويعيد الحصان إلى c3 مهددًا رخ d1، ثم يسترد الفيل على b6. خط المباراة الفعلي. المصدر: https://www.chessage.com/famous-games/game-of-the-century","استعمل كش الفيل والحصان بالتبادل."),demonstration:true,examReady:false,source:"https://www.chessage.com/famous-games/game-of-the-century"});
bank.push({...row("reti-tartakower-1910","الاستدراج",3,"rnb1kb1r/pp3ppp/2p5/4q3/4n3/3Q4/PPPB1PPP/2KR1BNR w kq - 0 9","Qd8+ Kxd8 Bg5+ Kc7 Bd8#","ريتي ضد تارتاكور، فيينا 1910. التضحية بالوزير تستدرج الملك إلى d8، ثم الكش المزدوج. إذا اختار Ke8 بدل Kc7 يأتي Rd8#. السجل المعاصر ينتهي بالاستسلام بعد Bg5+، والنهاية من رواية تارتاكور. المصدر: https://www.chesshistory.com/winter/extra/retitartakower.html","افتح عمود d بكش مزدوج."),demonstration:true,examReady:false,source:"https://www.chesshistory.com/winter/extra/retitartakower.html"});
bank.push({...row("anderssen-dufresne-1852","الإلهاء",3,"1r2k1r1/pbppnp1p/1bn2P2/8/Q7/B1PB1q2/P4PPP/3RR1K1 w - - 0 20","Rxe7+ Nxe7 Qxd7+ Kxd7 Bf5+ Ke8 Bd7+ Kf8 Bxe7#","أندرسن ضد دوفرين، برلين 1852، المباراة الخالدة الخضراء. التضحية بالرخ ثم الوزير تستدرج الملك وتتيح كشوف الفيلين المتتابعة. خط المباراة المعروض وليس ادعاءً بتفرد الحل. المصدر: https://www.numericana.com/answer/chess.htm","احسب الكشات المتتالية قبل استرداد المادة."),demonstration:true,examReady:false,source:"https://www.numericana.com/answer/chess.htm"});
// Promotion alternatives: both rook and queen deliver mate in this position.
for(const p of bank){if(p.id==='promotion-check')p.acceptedMoves=['e8=Q#','e8=R#'];}

bank.push({...row("underpromotion-82-0",'الترقية',2,"8/1P6/k7/8/K2B4/8/8/1R6 w - - 0 1","b8=N#","الترقية إلى حصان هنا تحقق المات الوحيد في نقلة واحدة، بخلاف الوزير. افحص طريقة هجوم الحصان ومربعات الهروب.",'ابحث عن مات في نقلة، ولا تفترض أن الوزير هو الأفضل.'),examReady:true,demonstration:false});
bank.push({...row('underpromotion-rook-stalemate','الترقية',2,'8/k1P5/2K5/8/8/8/8/8 w - - 0 1','c8=R','الوزير على c8 يمنع جميع نقلات الملك الأسود دون كش، فيتعادل بالخنق. الرخ يترك للملك a6، ويحتفظ الأبيض بمادة كافية للفوز بنهاية ملك ورخ ضد ملك. الفيل والحصان وحدهما لا يكفيان للمات.','اختر ترقية تتجنب الخنق وتحتفظ بمادة كافية للمات.'),examReady:true,demonstration:false});

bank.push({...row('zwischenzug-capture-check-84','النقلة البينية',2,'6kr/8/8/7Q/8/8/3q4/3R2K1 w - - 0 1','Qxh8+ Kxh8 Rxd2','إذا أخذت الوزير مباشرة بـ Rxd2 يستطيع الأسود أخذ وزيرك بـ Rxh5. لكن Qxh8+ أولًا يأخذ الرخ بكش، وبعد Kxh8 تسترد الوزير بـ Rxd2 وتكسب رخًا صافيًا. وإذا رد الملك Kf7 يبقى Rxd2 ممكنًا. الخط المعروض مثال تعليمي وليس إثباتًا لتفرد الحل.','قبل أخذ الوزير، ابحث عن أخذ آخر مصحوب بكش.'),demonstration:true,examReady:false});

bank.push({...row('overload-backrank-black-85','التحميل الزائد',2,'3rr1k1/5ppp/8/8/3Q4/8/5PPP/3R2K1 b - - 0 1','Rxd4 Rxd4 Re1#','الرخ الأبيض على d1 يدافع عن الوزير d4 ويستطيع بعد Re1+ أن يحجب الكش على e1 ما دام على الصف الأول: إذا استرد الوزير بـ Rxd4، يأتي Re1# بسبب بيادق الملك. إذا لم يسترد، يكون الأسود قد أخذ الوزير. هذا تطبيق معكوس للتمرين بالأبيض.','افحص ضعف الصف الأول قبل أخذ الوزير.'),demonstration:true,examReady:false});

bank.push({...row('interference-backrank-86','قطع خط الدفاع',2,'r5k1/4Bppp/8/8/8/8/5PPP/3RR1K1 w - - 0 1','Bd8 Rxd8 Rxd8#','الفيل على d8 يقطع خط الرخ الأسود a8 نحو e8، مهددًا Re8#. إذا أخذ الأسود الفيل بـ Rxd8 يأتي Rxd8# بالرخ الآخر. لكن الأسود يملك ردودًا أخرى، مثل h6 لفتح مربع هروب؛ لذلك هذا مثال على قطع الخط وليس ماتًا إجباريًا.','ضع قطعة بين الرخ المدافع ومربع المات، واحسب رد الأخذ.'),demonstration:true,examReady:false});

bank.push({...row('immortal-anderssen-1851-finish','الإلهاء',3,'r1b1k1nr/p2p1ppp/n2B4/1p1NPN1P/6P1/3P1Q2/P1P1K3/q5b1 w kq - 2 21','Nxg7+ Kd8 Qf6+ Nxf6 Be7#','من خاتمة المباراة الخالدة لأندرسن وكيسيريتسكي، لندن 1851، وفق الخط الختامي المنشور. Nxg7+ يدفع الملك إلى d8 في الخط المعروض؛ Qf6+ تضحي بالوزير لاستدراج حصان g8 بعيدًا عن حماية e7؛ ثم Be7# يكمل المات. المصدر يذكر أن الخاتمة استمرار تحليلي بعد الاستسلام، ولذلك لا نقدمها باعتبارها نقلات لعبت يقينًا.','احسب كش الحصان ثم كيف تبعد الحصان الأسود عن e7.'),source:'https://www.chessstrategyonline.com/content/tutorials/basic-chess-concepts-chess-notation',demonstration:true,examReady:false});

bank.push({...row('kasparov-topalov-1999','الاستدراج',3,'b2r3r/k4p1p/p2q1np1/Np1P4/3p1Q2/P4PPB/1PP4P/1K2R3 w - - 0 25','Re7+ Kb6 Qxd4+ Kxa5 b4+ Ka4 Qc3','كاسباروف ضد توبالوف، 1999. بعد قبول تضحية الرخ، Re7+ يبدأ مطاردة الملك. إذا أخذ الوزير الرخ: Qxe7 Qxd4+ Kb8 Qb6+ Bb7 Nc6+ Ka8 Qa7#. في المباراة اختار الأسود Kb6؛ ثم Qxd4+ يسترد بيدقًا بكش، وb4+ يدفع الملك إلى a4، وQc3 نقلة هادئة تواصل الهجوم. هذا جزء من المباراة، وليس إثباتًا لفوز إجباري بكل الفروع.','احسب ماذا يحدث إذا أخذ الوزير الرخ على e7.'),source:'https://en.chessbase.com/newsroom/post/throwback-thursday-kasparov-wijjk-1999?page=0',demonstration:true,examReady:false});

bank.push({...row('tal-botvinnik-1960-game6','الإلهاء',3,'2r3k1/pp4bp/3p2p1/3Ppb1n/1qr5/2N1B1PP/PP2QPBK/R1R5 b - - 1 21','Nf4 gxf4 exf4 Bd2 Qxb2 Rab1 f3 Rxb2 fxe2','بوتفينيك ضد تال، بطولة العالم 1960، المباراة السادسة. Nf4 يعرض الحصان للتضحية، وبعد gxf4 exf4 ينكشف غطاء الملك الأبيض. Qxb2 يكسب بيدقًا، ثم f3 يهاجم الوزير والفيل، وبعد Rxb2 يأتي fxe2 بأخذ الوزير وتهديد الترقية. تضحية عملية محفوفة بالمخاطر، وليست فوزًا إجباريًا مثبتًا؛ الخط هو ما حدث في المباراة.','افحص أثر فتح غطاء الملك ودفع البيدق f.'),source:'https://lavichess.com/famous-games/botvinnik-tal-1960',demonstration:true,examReady:false});

bank.push({...row('saavedra-study-1895','الترقية',3,'8/2P5/8/8/3r4/8/2K5/k7 w - - 0 1','c8=R Ra4 Kb3','من دراسة سافيدرا الشهيرة في النهايات (1895)، وليست مباراة فعلية. بعد c8=Q Rc4 Qxc4 يحدث التعادل بالخنق. الترقية إلى رخ تهدد Ra8#؛ وفي الخط Ra4 Kb3 يهدد الأبيض أخذ الرخ أو Rc1#. الخط تعليمي وليس تحققًا شاملاً بكل الفروع.','احسب فخ التعادل بعد الترقية إلى وزير.'),demonstration:true,examReady:false});

for(const p of bank){if(p.id==='zwischenzug-capture-check-84')p.branches=[p.line,['Qxh8+','Kf7','Rxd2']];if(p.id==='kasparov-topalov-1999')p.branches=[p.line,'Re7+ Qxe7 Qxd4+ Kb8 Qb6+ Bb7 Nc6+ Ka8 Qa7#'.split(' ')];}

for(const p of bank){const entry=[{"id":"bishop-skewer-queen","branches":[["Bb5+","Kc8","Bxe8"],["Bb5+","Kd8","Bxe8"],["Bb5+","Ke7","Bxe8"],["Bb5+","Ke6","Bxe8"],["Bb5+","Kd6","Bxe8"],["Bb5+","Kc7","Bxe8"]]}].find(x=>x.id===p.id);if(entry)p.branches=entry.branches;}

bank.push({...row('multi-mate-94','كش مات',1,'7k/5Q2/6K1/8/8/8/8/8 w - - 0 1','Qe8#','يوجد أكثر من مات مباشر: Qe8#، Qf8#، Qg7#، Qh7#. جميعها تمنع هروب الملك أو أخذ القطعة المهاجمة أو حجب الكش. اختر أيًا منها؛ لا فرق في النتيجة.','افحص جميع كشات الوزير ومربعات هروب الملك.'),acceptedMoves:["Qe8#","Qf8#","Qg7#","Qh7#"],examReady:true,demonstration:false});

bank.push({...row('multi-mate-black-94','كش مات',1,'8/8/8/8/8/6k1/5q2/7K b - - 0 1','Qg2#','يوجد أكثر من مات مباشر: Qg2#، Qh2#، Qf1#، Qe1#. جميعها تمنع هروب الملك أو أخذ القطعة المهاجمة أو حجب الكش. اختر أيًا منها؛ لا فرق في النتيجة.','افحص جميع كشات الوزير ومربعات هروب الملك.'),acceptedMoves:["Qg2#","Qh2#","Qf1#","Qe1#"],examReady:true,demonstration:false});
themes['إخلاء الخط']='إبعاد قطعة عن خط حركة قطعة أخرى لفتح تهديد أقوى، وقد يكون الإخلاء بتضحية.';
advancedThemes['إخلاء الخط']='Clearance';
tacticalLessons['إخلاء الخط']={detect:'ابحث عن قطعة صديقة تعوق خط الهجوم.',calculate:'احسب نقلتها الإجبارية ثم دخول القطعة الأخرى إلى الخط المفتوح.',mistake:'لا تضحِّ قبل فحص ردود الخصم والكشات المباشرة.'};
bank.push({...row('clearance-95','إخلاء الخط',2,'7k/6R1/5K2/8/8/7p/8/6Q1 w - - 0 1','Rh7+ Kxh7 Qg7#','الرخ يخلي عمود g بتضحية على h7، ويجبر الملك على أخذه. يدخل الوزير إلى g7 محميًا بالملك الأبيض وينهي المباراة بالمات.','كيف تخلي عمود g مع كش؟'),examReady:true,demonstration:false});

themes['حصر القطعة']='السيطرة على مربعات هروب قطعة الخصم ثم مهاجمتها حتى لا تستطيع النجاة دون خسارة مادة.';
advancedThemes['حصر القطعة']='Trapped Piece';
tacticalLessons['حصر القطعة']={detect:'ابحث عن قطعة على الحافة أو محاطة ببيادق ومربعات تحت سيطرتك.',calculate:'احسب جميع مربعات الهروب والأخذ والتهديدات المضادة قبل الهجوم.',mistake:'لا تفترض أن القطعة محاصرة لمجرد قلة حركتها؛ افحص التضحيات والاسترداد.'};
bank.push({...row('trapped-bishop-96','حصر القطعة',2,'6k1/8/8/8/8/1P6/b1P5/3R2K1 w - - 0 1','Ra1 Kh8 Rxa2','Ra1 يهاجم الفيل على a2. البيدق c2 يحمي b3، والرخ يسيطر على b1 بعد انتقال الفيل إليه عبر الصف الأول. إذا أخذ الفيل b3 يسترده بيدق c2، وإذا ذهب إلى b1 يأخذه الرخ، وإذا تحرك الملك يأخذ الرخ الفيل على a2. المكسب المادي المباشر نقطتان على الأقل.','افحص مربعي هروب الفيل b1 وb3.'),branches:[["Ra1","Kh8","Rxa2"],["Ra1","Kh7","Rxa2"],["Ra1","Kg7","Rxa2"],["Ra1","Kf7","Rxa2"],["Ra1","Kf8","Rxa2"],["Ra1","Bxb3","cxb3"],["Ra1","Bb1","Rxb1"]],examReady:false,demonstration:true});

themes['الأشعة السينية']='تأثير قطعة بعيدة المدى على مربع خلف قطعة حاجبة؛ يظهر عند زوال الحاجز. قد يكون هجومًا أو حماية غير مباشرة.';
advancedThemes['الأشعة السينية']='X-Ray';
tacticalLessons['الأشعة السينية']={detect:'تتبع الأعمدة والصفوف والأقطار خلف القطع الحاجبة.',calculate:'احسب تبادل القطع بالترتيب، ومن يسيطر على المربع بعد كل أخذ.',mistake:'لا تعتبر القطعة الخلفية مهاجمة مباشرة قبل زوال الحاجز.'};
bank.push({...row('xray-rooks-97','الأشعة السينية',2,'6k1/5ppp/8/3q4/8/3r4/3R4/3R2K1 w - - 0 1','Rxd3 Qxd3 Rxd3','الرخ الأمامي يأخذ الرخ الأسود على d3. إذا استرد الوزير على d3، يأخذه الرخ الخلفي من d1 عبر d2 الذي أصبح فارغًا. هذه حماية بالأشعة السينية وتنسيق رخين؛ استرداد الوزير ليس إجباريًا، ويمكن للأسود اختيار رد آخر.','تتبع عمود d خلف الرخ الأمامي.'),examReady:false,demonstration:true});
