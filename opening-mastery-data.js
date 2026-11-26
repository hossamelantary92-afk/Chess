import {Chess} from './chess.js';
import {openings} from './opening-library.js';
import {openingBranches} from './opening-branches.js?v=6';

const profiles = [
  ['Beginner', 'تطوير هادي', 'الفيل بينشط على c4 والتبييت قريب.', 'توقيت d4 بيتغير مع كل رد.'],
  ['Intermediate', 'ضغط طويل', 'الفيل بيضغط على المدافع عن e5.', 'أخذ e5 بدري ممكن يضيّع وقت أو مادة.'],
  ['Beginner', 'مركز متماسك', 'بتطلع الفيل قبل ما تلعب e3.', 'لو الأسود ضغط بـ ...c5 راجع d4 قبل ما تكمّل الترتيب المعتاد.'],
  ['Intermediate', 'لعب نشط وغير متماثل', 'الأسود بينافس على d4 من الجنب.', 'الفروع مختلفة وملكك محتاج تأمين حسب الوضع.'],
  ['Intermediate', 'ضغط على سلسلة البيادق', '...d5 بيتحدّى e4 بدعم e6.', 'فيل c8 محتاج خطة عشان يدخل اللعب.'],
  ['Intermediate', 'مركز متين', 'الفيل يقدر يطلع قبل إغلاق السلسلة بـ ...e6.', 'بيدق c6 بياخد مربع حصان b8 وقد يحتاج نقلة إضافية للكسر.'],
  ['Intermediate', 'ضغط على d5', 'c4 بيفرض قرار على مركز الأسود.', 'لو الأسود أخد على c4، احسب وقت استرداد البيدق.'],
  ['Advanced', 'جامبيت حاد', 'بيخلق تهديدات سريعة في بعض الردود.', 'الأسود بيعرض بيدق مقابل نشاط قد يقدر الأبيض يحيّده.'],
  ['Advanced', 'جامبيت حاد', 'الأبيض بيحاول يسبق في التطوير.', 'التعويض عن البيدق محتاج حساب.'],
  ['Intermediate', 'مركز مفتوح', 'd4 بيفتح خطوط التطوير بدري.', 'الحصان على d4 ممكن يتهاجم مع التطوير.'],
  ['Beginner', 'تحدّي مباشر للمركز', 'الأسود بيواجه e4 من أول نقلة.', 'الوزير ممكن يتعرض للهجوم أثناء تطوير الخصم.'],
  ['Advanced', 'هجوم مضاد على المركز', 'الأسود بيأجّل صدام البيادق عشان يختار توقيته.', 'الأبيض غالبًا عنده مساحة في الأول.'],
  ['Advanced', 'تطوير مرن', 'الفيل على g7 ممكن يضغط على القطر الطويل.', 'الأسود محتاج يحدد إمتى ينافس الأبيض على المركز.']
];

const supplements = [
  ['open-game', 'Open Game', 'e4 e5 Nf3 Nc6', 'e4', 'الأبيض هو اللي هيحدد إذا كان الفرع Italian أو Scotch أو Ruy Lopez.'],
  ['dutch', 'Dutch Defense', 'd4 f5 g3 Nf6', 'd4', 'بيدق f5 بيسيطر على e4، ودفعه يفتح قطر ناحية الملك.'],
  ['english-symmetrical', 'Symmetrical English', 'c4 c5 Nc3 Nc6', 'c4', 'بتنافس على d4. تشابه البيادق ما يضمنش إن تقليد كل نقلة آمن.'],
  ['english-reversed', 'Reversed Sicilian', 'c4 e5 Nc3 Nf6', 'c4', 'الأسود بياخد مساحة في الوسط. الأبيض عنده نقلة زيادة مقارنة بمواقف الصقلي المشابهة.'],
  ['d5-vs-nf3', 'Central Setup vs 1.Nf3', 'Nf3 d5 d4 Nf6 c4 e6 Nc3', 'Nf3', '...d5 يحتل المركز. ترتيب الأبيض هنا ممكن يدخل في عيلة Queen’s Gambit Declined.'],
  ['larsen', 'Central Setup vs 1.b3', 'b3 d5 Bb2 Nf6', 'Other Moves', 'خد مساحة في الوسط، وراقب قطر فيل b2 قبل ما تحرّك e5.'],
  ['bird', 'Central Setup vs 1.f4', 'f4 d5 Nf3 Nf6', 'Other Moves', 'نافس الأبيض على e5 بأكتر من قطعة، وراجع أمان الملك لو المركز اتفتح.']
];

export const catalog = new Map(openings.map(([name, , moves, summary, notes], index) => {
  const branches = openingBranches[index];
  return [String(index), {
    name, summary, index, profile: profiles[index], source: branches?.source, video: branches?.video,
    lines: (branches?.lines ?? [{id: '', name: 'Main Line'}]).map(line => ({
      ...line, moves: (line.moves ?? moves).split(' '), notes: {...Object.fromEntries((notes ?? []).map((note, ply) => [ply + 1, note]).filter(([ply]) =>
        (line.moves ?? moves).split(' ').slice(0, ply).join(' ') === moves.split(' ').slice(0, ply).join(' '))), ...line.notes}
    }))
  }];
}));
for (const [id, name, moves, , summary] of supplements) {
  catalog.set(id, {name, summary, lines: [{id: '', name: 'Main Line', moves: moves.split(' ')}]});
}

// A general 1...e5 repertoire continues into actual playable lines.
const openGame = catalog.get('open-game');
openGame.profile = ['Beginner', 'تطوير طبيعي', 'بتنافس على المركز وبتجهّز القطع للتبييت.', 'بعد ...Nc6 لازم تتعامل مع اختيار الأبيض، مش تفرض ترتيب واحد.'];
openGame.lines = ['0','1','9'].map((id,index) => {
  const opening = catalog.get(id);
  const line = opening.lines[0];
  return {...line, openingId:id, variationName:line.name, id: index === 0 ? '' : 'open-game-'+id, name: opening.name+' · '+line.name,
    idea: 'بعد 1.e4 e5 2.Nf3 Nc6، اختيار الأبيض بيحدد الفرع. '+(line.idea ?? opening.summary)};
});
catalog.get('0').lines.push({
  id: 'italian-h6', name: 'Unexpected Moves · 3...h6', start: 6,
  moves: 'e4 e5 Nf3 Nc6 Bc4 h6 d4 exd4 O-O'.split(' '),
  idea: 'راجع إمتى تفتح الوسط لو خصمك أخّر تطويره.',
  notes: {6: 'الأسود منع Ng5 ولسه مطوّرش حصان g8.', 7: 'd4 يتحدّى e5 فورًا. راجع مين يقدر يلعب بأمان بعد الفتح.'}
});
catalog.get('0').lines.push({
 id:'italian-hungarian',name:'Hungarian Defense · Quiet Development',start:6,
 moves:'e4 e5 Nf3 Nc6 Bc4 Be7 d3 Nf6 O-O O-O Nc3 d6'.split(' '),
 idea:'الأسود يختار ...Be7 بعد دخول الإيطالي. الأبيض يطوّر قطعه بهدوء ويؤمّن الملك.',
 notes:{6:'...Be7 يطوّر الفيل ويجهّز التبييت؛ لسه إحنا داخل الإيطالي.',7:'d3 يدعم e4 ويفتح قطر فيل c1.',9:'التبييت يحمي الملك ويجهّز الرخ.',11:'Nc3 يطوّر الحصان ويزيد السيطرة على الوسط.'},
 white:'أمّن الملك وطوّر باقي القطع ثم قيّم توقيت d4.',black:'أمّن الملك ونافس على الوسط مع مراقبة d4.'
});
catalog.get('6').lines.push({
  id: 'qgd-transposition', name: 'Transposition · 1...Nf6', start: 6,
  moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'd5', ...catalog.get('6').lines[0].moves.slice(6)],
  idea: 'بعد ...d5 وصلت لنفس الوضع اللي بيظهر بعد 1. d4 d5 2. c4 e6 3. Nc3 Nf6.'
});

// Separate Black's defensive choices while preserving the original Queen's Gambit lesson.
const queen=catalog.get('6');
catalog.set('qgd',{...queen,name:'Queen’s Gambit Declined',lines:queen.lines.filter(l=>['','queen-gambit-exchange','qgd-transposition'].includes(l.id))});
catalog.set('slav',{name:'Slav Defense',summary:'ادعم d5 بـ...c6، وطوّر فيل c8 قبل ...e6 لو الوضع يسمح.',profile:['Intermediate','مركز متين','بيدق c6 يدعم d5.','راقب توقيت تطوير الفيل واسترداد بيدق c4.'],lines:[
  {...queen.lines.find(l=>l.id==='queen-gambit-slav'),id:'',name:'Classical Line'},
  {id:'slav-exchange',name:'Exchange Variation',start:5,moves:'d4 d5 c4 c6 cxd5 cxd5 Nc3 Nf6 Nf3 Nc6 Bf4 Bf5 e3 e6'.split(' '),idea:'بعد تبادل بيادق c وd يبقى المركز متماثل. الأولوية لتطوير القطع قبل فتح خطوط جديدة.',white:'طوّر فيل f1 وأمّن الملك. راقب السيطرة على عمود c.',black:'كمّل تطوير فيل f8 وأمّن الملك. نافس على عمود c وراجع توقيت كسر المركز.',question:'ليه ...Bf5 مفيدة قبل ...e6؟',answer:'الفيل يخرج من سلسلة البيادق قبل إغلاق قطره.'}
]});
catalog.set('kid',{name:'King’s Indian Defense',summary:'الأسود يسمح للأبيض بمركز واسع ثم ينافسه بكسر مركزي، مع فيل g7 النشط.',profile:['Advanced','هجوم مضاد','فيل g7 يضغط على القطر الطويل.','احسب توقيت ...e5 أو ...c5 قبل الهجوم.'],lines:[
{id:'',name:'Classical Variation',start:8,moves:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6'.split(' '),notes:{2:'...Nf6 يطوّر الحصان ويراقب e4.',6:'...Bg7 ينشّط الفيل على القطر الطويل.',12:'...e5 يتحدّى مركز الأبيض.'},white:'أمّن الملك وحدد هل تغلق المركز بـd5 أو تبقي التوتر حسب الوضع.',black:'طوّر باقي القطع وراقب قرار الأبيض في المركز قبل اختيار الهجوم.',question:'ليه الأسود يتحدّى المركز بعد التبييت؟',answer:'ملك الأسود بقى آمن نسبيًا، وفتح المركز ممكن ينشّط قطعه.'},
{id:'kid-fianchetto',name:'Fianchetto Variation',start:6,moves:'d4 Nf6 c4 g6 Nf3 Bg7 g3 O-O Bg2 d6 O-O Nbd7 Nc3 e5'.split(' '),idea:'الأبيض يضع الفيل على g2 ويحمي جناح الملك، والأسود ينافس على المركز.',white:'راقب d4 وأكمل تطوير القطع.',black:'نافس على المركز بـ...e5 وراجع وضع الحصان والبيادق.'}
]});
// White chooses a starting plan; Black chooses a reply to White's first move.
catalog.set('english-white',{name:'English Opening',summary:'ابدأ بـ c4 للسيطرة على d5 من الجناح، ثم طوّر القطع وراقب مركز الأسود.',profile:['Intermediate','سيطرة من الجناح','ممكن تتعامل مع مركز الأسود بأكتر من بناء.','لا تؤجل تطوير القطع عشان تحرّك البيادق بلا هدف.'],lines:[
{id:'',name:'Symmetrical Line',moves:'c4 c5 Nc3 Nc6 g3 g6 Bg2 Bg7 Nf3 Nf6 O-O O-O'.split(' '),idea:'ابدأ بالسيطرة على d5 ثم طوّر الحصان والفيل وأمّن الملك.',notes:{1:'c4 يسيطر على d5.',3:'Nc3 يزود السيطرة على d5.',7:'Bg2 يفعّل الفيل على القطر الطويل.'},white:'أمّن الملك ثم راقب توقيت d4 حسب وضع الأسود.',black:'نافس على d4 وطوّر القطع قبل أي كسر مركزي.'},
{id:'english-e5',name:'Against ...e5',moves:'c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5 Bg2 Nb6 Nf3 Nc6 O-O'.split(' '),idea:'الأسود يحتل المركز؛ الأبيض يضغط عليه من الجناح ويطوّر الفيل.',white:'كمّل التطوير وراقب d5 وd4.',black:'استغل وجود بيدق e5 لتأمين مساحة وتطوير القطع.'}
]});
catalog.set('reti-white',{name:'Réti Opening',summary:'ابدأ بـ Nf3 وطوّر القطع بمرونة، واستخدم c4 للضغط على مركز الأسود.',profile:['Intermediate','تطوير مرن','الحصان يمنع ...e5 غير المدعومة ويمهّد للتبييت.','اختار بناء المركز حسب رد الأسود.'],lines:[
{id:'',name:'Classical Setup',moves:'Nf3 d5 c4 e6 g3 Nf6 Bg2 Be7 O-O O-O'.split(' '),idea:'ضغط على d5 من الجناح مع تبييت سريع.',notes:{1:'Nf3 يطوّر قطعة ويراقب e5 وd4.',3:'c4 يضغط على بيدق d5.'},white:'كمّل التطوير وراقب توقيت d4.',black:'ادعم المركز وطوّر القطع.'},
{id:'reti-nf6',name:'Against ...Nf6',moves:'Nf3 Nf6 c4 g6 g3 Bg7 Bg2 O-O O-O d6'.split(' '),idea:'التطوير المرن يسمح بالانتقال لبناء إنجليزي حسب نقلات الطرفين.'}
]});
catalog.set('london-black',{...catalog.get('2'),name:'Defense vs London System',summary:'لو الأبيض طوّر الفيل إلى f4، نافس مركز d4 وطوّر قطعك. اختار الرد حسب وضع البيادق، مش بالتقليد.',lines:catalog.get('2').lines});
const defenses = {
  e4: ['open-game','5','10','4','3','11','12'],
  d4: ['qgd','london-black','slav','kid','dutch','7'],
  c4: ['english-symmetrical','english-reversed'],
  Nf3: ['d5-vs-nf3'],
  'Other Moves': ['larsen','bird']
};
const whiteOrder=['0','2','9','6','1','english-white','reti-white'];
export const firstMoves=Object.keys(defenses);
export function openingChoices(color,first){return color==='w'?whiteOrder: defenses[first]??defenses.e4;}
const learningGroups=[
 ['beginner','Start here',['0','2']],
 ['develop','Next steps',['9','6','1']],
 ['expand','Expand your repertoire',['english-white','reti-white']],
 ['e4basic','Core defenses',['open-game','5','10']],
 ['e4advanced','Explore next',['4','3','11','12']],
 ['d4basic','Classical setups',['qgd','london-black','slav']],
 ['d4advanced','Counterattacks',['kid','dutch','7']],
 ['other','Other responses',['english-symmetrical','english-reversed','d5-vs-nf3','larsen','bird']]
];
export function familyOf(id){return learningGroups.find(g=>g[2].includes(id))?.[0]??'other';}
export function familyChoices(color,first){
 const allowed=openingChoices(color,first);
 return learningGroups.map(([id,label,ids])=>({id,label,openings:allowed.filter(x=>ids.includes(x))})).filter(g=>g.openings.length);
}
// Keep old links, saved choices and review positions usable after filtering.
export function normalizeSelection(value){
 if(!value||!catalog.has(value.id)||!['w','b'].includes(value.color))return value;
 const {color,id}=value;
 if(openingChoices(color,value.first).includes(id))return value;
 let next=id;
 if(color==='w'){
   if(['english-symmetrical','english-reversed'].includes(id))next='english-white';
   else if(id==='d5-vs-nf3')next='reti-white';
   else if(['qgd','slav','kid','dutch','7'].includes(id))next='6';
   else if(id==='london-black')next='2';
   else next='0';
   return {...value,id:next,first:firstMoves.includes(value.first)?value.first:'e4',activeId:value.activeId??id};
 }
 if(['0','1','9'].includes(id))next='open-game';
 else if(id==='6')next='qgd';
 else if(id==='2')next='london-black';
 else if(id==='8')next='5';
 else if(id==='english-white')next='english-symmetrical';
 else if(id==='reti-white')next='d5-vs-nf3';
 const first=firstMoves.find(m=>openingChoices('b',m).includes(next));
 return first?{...value,id:next,first,activeId:value.activeId??id}:value;
}
// Include opponent deviations separately from the selected opening.
// Dynamic training only samples the authored lines; it is not an engine.
export function studyLines(id,color){
 const primaryIds=id==='open-game'?['0','1','9']:color==='b'&&id==='5'?['5','8']: [id];
 const alternatives=color==='w'&&['0','1','9'].includes(id)?['5','10','4','3','11','12','8']:
   color==='w'&&id==='6'?['slav','kid','dutch','7']:
   color==='w'&&id==='2'?['dutch','7']:[];
 const entries=[];
 const seen=new Set();
 for(const item of [...primaryIds,...alternatives]){
   for(const line of catalog.get(item).lines){
     const key=line.moves.join(' ');
     if(seen.has(key))continue;
     seen.add(key);
     entries.push({id:item,line,opponentResponse:alternatives.includes(item)});
   }
 }
 return entries;
}
// Beginner menu: a few representative lines; retain the full training library.
export function essentialLines(id,color,entries=studyLines(id,color)){
 const primary=entries.filter(e=>!e.opponentResponse);
 const responses=entries.filter(e=>e.opponentResponse);
 const pick=(item,lineId='')=>entries.find(e=>e.id===item&&e.line.id===lineId);
 let core;
 if(id==='open-game')core=['0','1','9'].map(i=>pick(i));
 else if(id==='0')core=[pick('0'),pick('0','italian-center'),pick('0','two-knights-quiet'),pick('0','italian-hungarian')];
 else if(id==='5')core=[pick('5'),pick('5','caro-advance'),pick('5','caro-exchange')];
 else core=primary.slice(0,3);
 const replyIds=color==='w'&&['0','1','9'].includes(id)?['3','5','4','10']:color==='w'&&id==='6'?['kid','dutch']:color==='w'&&id==='2'?['dutch']: [];
 const replies=replyIds.map(i=>i==='3'?pick(i,'sicilian-alapin-d5'):pick(i)).filter(e=>e&&responses.includes(e));
 return [...new Set([...core.filter(Boolean),...replies])];
}
// Teaching categories describe the actual move that selects each route.
const moveLabel=(moves,index)=>Math.floor(index/2)+1+(index%2?'...':'.')+moves[index];
export function replyGroup(id,color,entry){
 const moves=entry.line.moves;
 const name=catalog.get(id).name;
 const isolate=value=>'\u2066'+value+'\u2069';
 if(entry.opponentResponse&&color==='w'){
   return {key:'external',label:['0','1','9'].includes(id)?'دفاعات أخرى قبل دخول الافتتاحية':'مسارات أخرى للرد على بداية الأبيض',external:true,move:moveLabel(moves,1)};
 }
 if(color==='w'&&['0','1','9','6'].includes(id)){
   const index=id==='6'?3:5;
   const prefix=id==='6'?['d4','d5','c4']:id==='0'?['e4','e5','Nf3','Nc6','Bc4']:id==='1'?['e4','e5','Nf3','Nc6','Bb5']:['e4','e5','Nf3','Nc6','d4'];
   if(prefix.every((san,i)=>moves[i]===san)&&moves[index]){
     const reply=moveLabel(moves,index);
     const rank=id==='0'?(['Bc5','Nf6','Be7','h6'].indexOf(moves[index])+1||99):0;
     return {key:'inside:'+reply,label:'رد الأسود داخل '+isolate(name)+' · '+isolate(reply),move:reply,rank};
   }
 }
 if(color==='w'&&['english-white','reti-white','2'].includes(id)&&moves[1]){
   const reply=moveLabel(moves,1);
   return {key:'first:'+reply,label:'رد الأسود الأول · '+isolate(reply),move:reply,rank:0};
 }
 if(color==='b'&&id==='open-game'&&moves[4]){
   const reply=moveLabel(moves,4);
   return {key:'white:'+reply,label:'اختيار الأبيض · '+isolate(reply),move:reply,rank:0};
 }
 if(color==='b'&&id==='5'&&moves[4]){
   const reply=moveLabel(moves,4);
   return {key:'white:'+reply,label:'اختيار الأبيض · '+isolate(reply),move:reply,rank:0};
 }
 return {key:'main',label:color==='w'?'خطوط الافتتاحية':'خطوط الدفاع وردود الأبيض',rank:0};
}
export function matchingLines(id,prefix,color){
 return studyLines(id,color).filter(({line})=>line.moves.length>=prefix.length&&prefix.every((san,i)=>line.moves[i]===san));
}
export function positionKey(chess) {
  return chess.fen().split(' ').slice(0, 4).join(' ');
}

export function buildTree() {
  const tree = new Map();
  for (const [id, opening] of catalog) {
    for (const line of opening.lines) {
      const chess = new Chess();
      for (const [ply, san] of line.moves.entries()) {
        const position = positionKey(chess);
        const move = chess.move(san);
        if (!tree.has(position)) tree.set(position, new Map());
        const branches = tree.get(position);
        if (!branches.has(move.san)) branches.set(move.san, []);
        branches.get(move.san).push({id, line, ply: ply + 1, move});
      }
    }
  }
  return tree;
}
