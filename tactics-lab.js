import {moveSound,playSound} from './rook-sound.js?v=329';
import {squareAt, paintSquare} from './board-cells.js';
import {Chess} from './chess.js';
import {bank,themes,tacticalLessons,advancedThemes} from './tactics-bank.js?v=276';
import {exercises} from './safety.js?v=329';
const englishTheme = {...advancedThemes,
  'قطعة غير محمية': 'Hanging Piece',
  'الشوكة': 'Fork',
  'التثبيت': 'Pin',
  'السيخ': 'Skewer',
  'الهجوم المكتشف': 'Discovered Attack',
  'الكش المزدوج': 'Double Check',
  'إزالة المدافع': 'Removing the Defender',
  'الترقية': 'Promotion',
  'كش مات': 'Checkmate',
  'الدفاع': 'Defense'
};
const $=s=>document.querySelector(s),files='abcdefgh',labels={p:'بيدق',n:'حصان',b:'فيل',r:'رخ',q:'وزير',k:'ملك'};
let saved;try{saved=JSON.parse(localStorage.getItem('rook-tactics-lab')||'{}')}catch{saved={}}let log={solved:[],review:[],...saved};for(const k of ['solved','review'])log[k]=Array.isArray(log[k])?[...new Set(log[k].filter(x=>typeof x==='string'))]:[];if(!log.v279){const id='underpromotion-rook-stalemate';if(log.solved.includes(id)){log.solved=log.solved.filter(x=>x!==id);if(!log.review.includes(id))log.review.push(id)}log.v279=true;}let mode='learn',queue=[],n=0,ply=0,c,selected=null,flipped=false,hints=0,failed=false,done=false,last=null,verdict=null,round=0,roundFirst=0,topic='all',counted=new Set(),firstCounted=new Set();
const panel=document.createElement('section');panel.id='tacticsLab';panel.hidden=true;panel.innerHTML=`<div class="focus-heading"><button id="labReview" class="premium-btn">مراجعة أخطائي</button></div><div class="lesson-head"><h2 id="labTitle">مختبر التكتيكات</h2><span class="level" id="labCount"></span></div><details class="unit-card" id="labFoundations"><summary>مبادئ التكتيكات والحساب</summary><article><h3>النقلات المرشحة</h3><ul><li>عند وجود كش عليك، ابحث أولًا عن رد قانوني يزيله.</li><li>في غير ذلك افحص الكش والأخذ والتهديدات لك وللخصم، ثم النقلات الهادئة.</li><li>النقلة الإجبارية تستحق الفحص، لكنها ليست صحيحة تلقائيًا.</li></ul><details><summary>أي عبارة أدق؟</summary><p>الكش مرشح يحتاج حساب الرد — قد يبدد الكش الوقت أو يضع قطعتك تحت الأخذ؛ احسب ما بعده.</p></details></article><article><h3>احسب للخصم أيضًا</h3><ul><li>بعد نقلتك لا تتخيل الرد الذي تتمناه؛ ابحث عن أقوى رد معقول للخصم.</li><li>افحص هل يستطيع أخذ قطعة الهجوم، أو تبديل القطع، أو خلق كش معاكس.</li><li>إذا انتهى خطك بوضع غير واضح، لا تصفه بفوز إجباري.</li></ul><details><summary>حسابك ينجح فقط لو لعب الخصم ردًا ضعيفًا. ماذا يعني؟</summary><p>الخطة تحتاج اختبار ردود أقوى — التركيبة لا تكون إجبارية إلا إذا صمدت أمام الدفاعات المناسبة.</p></details></article><article><h3>تخيّل الوضع النهائي</h3><ul><li>أثناء الحساب تابع أماكن القطع التي تحركت أو أُخذت.</li><li>توقف عند نهاية الخط واسأل: من المتقدم؟ هل ملكي آمن؟ هل هناك رد تكتيكي؟</li><li>ابدأ بحساب قصير دقيق، ثم زد العمق؛ لا تحرّك القطع عشوائيًا لاكتشاف الحل.</li></ul><details><summary>بعد حساب تبادل، ما الذي تقيّمه؟</summary><p>الوضع الناتج وصافي المادة وأمان الملك — التقييم يكون للوضع الذي ستصل إليه، وليس لوضع البداية وحده.</p></details></article><article><h3>الشوكة والهجوم المزدوج</h3><ul><li>الشوكة تصنع تهديدين بقطعة واحدة، ويشتهر بها الحصان والبيدق.</li><li>لا يكفي رؤية تهديدين: قد يستطيع الخصم إزالة المهاجم أو حماية الهدفين معًا.</li><li>الشوكة المصحوبة بكش تقلل حرية الرد، لكن افحص قانونية وأمان قطعة الشوكة.</li></ul><details><summary>حصان يهاجم الملك والرخ. ماذا يفحص المدافع أولًا؟</summary><p>يجب إزالة الكش بنقلة قانونية — الكش يفرض معالجة خطر الملك، وهذا يمنحك فرصة تنفيذ التهديد الآخر.</p></details></article><article><h3>التثبيت المطلق والنسبي</h3><ul><li>التثبيت المطلق: تحريك القطعة يكشف ملكها للكش، فيكون غير قانوني.</li><li>التثبيت النسبي: خلف القطعة هدف ثمين؛ التحرك قانوني لكنه قد يخسر ذلك الهدف.</li><li>هاجم القطعة المثبتة أو استغل مربعات لا تستطيع الدفاع عنها قانونيًا.</li></ul><details><summary>قطعة مثبتة أمام الوزير بدل الملك. هل تحركها ممنوع؟</summary><p>قانوني، لكنه قد يخسر الوزير — الملك وحده يفرض المنع القانوني؛ حماية الوزير قرار تكتيكي.</p></details></article><article><h3>الخطوط وإزالة المدافع</h3><ul><li>في الهجوم المكتشف تبتعد قطعة لتفتح خط قطعة خلفها.</li><li>في السيخ يكون الهدف الأغلى أمام قطعة أخرى على خط الهجوم.</li><li>في إزالة المدافع تزيل حماية هدف ثم تستغله؛ احسب ردود الخصم قبل التضحية.</li></ul><p dir="ltr">Bxf7+ Rxf7 Qxg6</p><p>مثال أصلي برد نموذجي: أزلنا بيدق f7 المدافع عن g6 بكش، ثم أخذنا الوزير.</p><details><summary>ما أول سؤال قبل إزالة المدافع؟</summary><p>هل يملك الخصم دفاعًا بديلًا أو ردًا أقوى؟ — الفكرة لا تنجح بالاسم وحده؛ يجب أن يبقى الهدف قابلًا للاستغلال بعد رد الخصم.</p></details></article></details><details class="lab-config" id="labConfig"><summary>⚙ إعدادات التدريب <span id="labConfigSummary"></span></summary><div class="lab-settings"><label hidden><select id="labMode"><option value="learn">تعلّم فكرة محددة</option><option value="mixed">تحدي مختلط · ١٠ مواقف</option><option value="exam">اختبار تكتيكات · بلا مساعدة</option></select></label><label id="labTopicLabel">الفكرة<select id="labTopic"><option value="all">كل الأفكار</option></select></label><label id="labDifficultyLabel">المستوى<select id="labDifficulty"><option value="all">كل المستويات</option><option value="1">أساسي · فكرة مباشرة</option><option value="2">متوسط · احسب الخط</option><option value="3">متقدم · تركيبات تكتيكية</option></select></label><label id="labSideLabel">اللون<select id="labSide"><option value="all">الأبيض والأسود</option><option value="w">ألعب بالأبيض</option><option value="b">ألعب بالأسود</option></select></label><button id="labStart" class="premium-btn primary">جولة جديدة</button></div></details><div class="lab-layout"><div class="board-area"><div class="board-top"><span id="labTurn"></span><span id="labLevel"></span></div><div class="frame"><div id="labBoard" role="grid" aria-label="رقعة التكتيكات"></div></div><div class="board-tools"><button id="labFlip" class="premium-btn">قلب الرقعة</button><button id="labRetry" class="premium-btn">إعادة الموقف</button></div><button id="labNext" class="premium-btn primary" hidden>الموقف التالي</button></div><div class="coach"><div class="eyebrow" id="labTheme" hidden><span id="labThemeArabic"></span><span id="labThemeEnglish" lang="en" dir="ltr"></span></div><h3 id="labTask" tabindex="-1"></h3><p id="labIntro"></p><p id="labMethod" class="lab-method"></p><div id="labLesson" hidden style="display:grid;gap:10px;margin:12px 0"></div><div id="labFeedback" aria-live="polite"></div><div id="labSteps" dir="ltr"></div><div class="lab-actions"><button id="labHint" class="premium-btn">تلميح</button><button id="labAnswer" class="premium-btn">شاهد الحل</button><button id="labSkip" class="premium-btn" hidden>لا أعرف</button></div><div id="labExplanation" hidden><b>الفكرة بعد الحل</b><p id="labExplainText"></p><div id="labSolutionDetail"></div></div></div></div><p id="labStats"></p></section>`;$('#homeDashboard').after(panel);

// Keep native selects for a compact, accessible mobile settings panel.
const labConfigSummary=()=>{const ids=['labTopic','labDifficulty','labSide'];$('#labConfigSummary').textContent=ids.map(id=>$('#'+id).selectedOptions[0]?.textContent.split(' · ')[0]||'').join(' • ')};
for(const id of ['labMode','labDifficulty','labSide','labTopic'])$('#'+id).addEventListener('change',labConfigSummary);
$('#labStart').addEventListener('click',()=>{$('#labConfig').open=false;labConfigSummary()});
new MutationObserver(labConfigSummary).observe(panel,{attributes:true,attributeFilter:['hidden']});
labConfigSummary();
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const defs=exercises.map((d,i)=>({id:'defense-'+i,theme:'الدفاع',level:1,fen:d[0],target:d[1],attacker:d[2],explain:d[3],defense:true}));const all=[...bank,...defs];
[...new Set([...all.map(p=>p.theme),'التركيبات التكتيكية','تكتيكات النهايات'])].forEach(t=>{const o=document.createElement('option');o.value=t;o.textContent=`${t} · ${englishTheme[t]}`;$('#labTopic').append(o)});
const oldCard=[...$('#homeCards').children].find(b=>b.textContent.includes('التكتيكات'));if(oldCard){const badge=oldCard.querySelector('.home-card-top span');if(badge)badge.textContent=`${bank.length} موقفًا`;oldCard.onclick=()=>location.hash='tactics-lab';}
const mixedCard=document.createElement('button');mixedCard.className='home-card';mixedCard.dataset.learningCard='mixed';mixedCard.innerHTML='<div class="home-card-top"><b>♞</b><span>١٠ مواقف للجولة</span></div><h3>التحدي المختلط</h3><small>هجوم • دفاع • كش مات</small>';mixedCard.onclick=()=>location.hash='mixed-lab';$('#homeCards').append(mixedCard);
function save(){try{localStorage.setItem('rook-tactics-lab',JSON.stringify(log))}catch{}$('#labStats').textContent=`${log.solved.length} مواقف أُنجزت · ${log.review.length} للمراجعة · الجولة: ${round} صحيحة، منها ${roundFirst} دون مساعدة${log.exam?' · آخر اختبار: '+log.exam.score+'/'+log.exam.total:''}`;$('#labReview').disabled=!log.review.length}
function miss(msg){failed=true;if(!log.review.includes(queue[n].id))log.review.push(queue[n].id);$('#labFeedback').textContent=msg;save()}
function renderTheme(arabic='',english=''){
  $('#labThemeArabic').textContent=arabic;
  $('#labThemeEnglish').textContent=english;
  $('#labTheme').hidden=!(arabic||english);
}
let activeLine=[], usedAlternative=false;
function load(){const p=queue[n];usedAlternative=false;activeLine=p.line||[];if(p.branches?.length&&mode!=='exam'&&mode!=='mixed')activeLine=p.branches[Math.floor(Math.random()*p.branches.length)];const lesson=$('#labLesson');lesson.replaceChildren();lesson.hidden=mode!=='learn';lesson.style.display=mode==='learn'?'grid':'none';if(mode==='learn'&&tacticalLessons[(topic==='التركيبات التكتيكية'&&p.combination||topic==='تكتيكات النهايات'&&p.endgame)?topic:p.theme]){for(const [label,key] of [['كيف تكتشفه؟','detect'],['كيف تحسبه؟','calculate'],['خطأ شائع','mistake']]){const box=document.createElement('div');box.style.cssText='padding:10px 12px;border:1px solid #7775;border-radius:10px';const title=document.createElement('strong');title.textContent=label;const body=document.createElement('p');body.style.margin='5px 0 0';body.textContent=tacticalLessons[(topic==='التركيبات التكتيكية'&&p.combination||topic==='تكتيكات النهايات'&&p.endgame)?topic:p.theme][key];box.append(title,body);lesson.append(box);}}$('#labIntro').hidden=false;$('#labFlip').disabled=false;$('#labRetry').disabled=false;$('#labMethod').textContent=mode==='learn'?'١. افحص كشاتك. ٢. افحص الأخذ والتهديدات. ٣. احسب رد الخصم قبل النقل.':'';c=new Chess(p.fen);flipped=c.turn()==='b';ply=0;selected=null;hints=0;failed=false;done=false;last=null;verdict=null;$('#labCount').textContent=`${n+1} / ${queue.length}`;if(mode==='learn')renderTheme('',englishTheme[p.theme]);else renderTheme('اقرأ الوضع بنفسك');$('#labTask').textContent=mode!=='learn'?'ما النقلة المناسبة هنا؟':(topic==='التركيبات التكتيكية'&&p.combination?'احسب التركيب كاملًا':p.task)|| (p.defense?'حافظ على قطعتك':p.demonstration?p.theme+' · مثال تعليمي':p.theme);$('#labIntro').textContent=mode==='learn'?(themes[p.theme]||'افحص التهديد ثم اختر نقلة آمنة.'):'ابحث عن تهديد للملك، أو فرصة لكسب قطعة، أو قطعة تحتاج إنقاذًا.';$('#labFeedback').textContent=p.defense&&mode==='learn'?'انقل القطعة المهددة إلى مربع آمن.':'حرّك القطعة على الرقعة. قد تحتاج الفكرة إلى أكثر من نقلة.';$('#labSteps').textContent='';$('#labExplanation').hidden=true;$('#labNext').hidden=true;$('#labHint').hidden=mode==='exam';$('#labAnswer').hidden=mode==='exam';$('#labSkip').hidden=mode!=='exam';draw();save()}
function draw(){const box=$('#labBoard');const fs=flipped?[...files].reverse():[...files],rs=flipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];const legal=selected&&mode!=='exam'?c.moves({square:selected,verbose:true}).map(m=>m.to):[];for(const [ri,r]of rs.entries())for(const[fi,f]of fs.entries()){const sq=f+r,p=c.get(sq),b=squareAt(box,ri*8+fi);let markup='';b.className=((files.indexOf(f)+r)%2?'dark ':'')+(selected===sq?'selected ':'')+(last&&(last.from===sq||last.to===sq)?'last ':'')+(legal.includes(sq)?'legal':'');b.setAttribute('role','gridcell');b.setAttribute('aria-label',sq+(p?' '+labels[p.type]+' '+(p.color==='w'?'أبيض':'أسود'):''));markup=(p?`<img class="piece" src="pieces/${p.color+p.type.toUpperCase()}.svg" alt="" draggable="false">`:'')+(fi===0?`<small class="rank">${r}</small>`:'')+(ri===7?`<small class="file">${f}</small>`:'');if(verdict?.square===sq){
  const correct=verdict.kind==='correct';
  b.classList.add('answer-'+verdict.kind);
  b.setAttribute('aria-label',b.getAttribute('aria-label')+(correct?' — نقلة صحيحة':' — نقلة غير صحيحة'));
  markup+=`<span class="square-verdict" aria-hidden="true">${correct?'✓':'×'}</span>`;
}b.onclick=()=>play(sq);paintSquare(b,markup)}$('#labTurn').textContent=done?'انتهى الموقف':c.turn()==='w'?'الأبيض يلعب':'الأسود يلعب';$('#labLevel').textContent=mode==='exam'?'اختبار بلا تلميحات':mode==='mixed'?'فكّر قبل النقل':queue[n].level===1?'أساسي':queue[n].level===2?'متوسط':'متقدم'}
function explainLine(p){
 const box=$('#labSolutionDetail');box.replaceChildren();if(!p.line)return;
 const b=new Chess(p.fen), steps=[], actual=c.history(), line=actual.length===activeLine.length?actual:activeLine;let forced=true;
 const names={p:'البيدق',n:'الحصان',b:'الفيل',r:'الرخ',q:'الوزير',k:'الملك'};
 const values={p:1,n:3,b:3,r:5,q:9,k:0};
 const side=b.turn();const score=()=>b.board().flat().filter(Boolean).reduce((s,x)=>s+(x.color===side?1:-1)*values[x.type],0);const initial=score();
 for(let i=0;i<line.length;i++){
  const choices=b.moves();if(i%2===1&&choices.length!==1)forced=false;
  const m=b.move(line[i]);const mate=b.isCheckmate(),check=b.isCheck();
  const notes=[];
  if(m.captured)notes.push('أخذ '+names[m.captured]+' على '+m.to+' ('+values[m.captured]+' نقاط مادة).');
  if(m.promotion)notes.push('ترقية البيدق إلى '+names[m.promotion]+'.');
  if(mate)notes.push('كش مات: لا يوجد أخذ أو حجب أو هروب قانوني.');
  else if(check)notes.push('كش يجبر الخصم على معالجة تهديد الملك؛ عدد الردود القانونية: '+b.moves().length+'.');
  else if(!m.captured&&!m.promotion)notes.push('نقلة دون كش أو أخذ: افحص التهديد الجديد ومربعات السيطرة.');
  if(i%2===1)notes.push(choices.length===1?'هذا هو الرد القانوني الوحيد.':'هذا رد من '+choices.length+' ردود قانونية؛ ليس بالضرورة الأقوى.');
  steps.push({san:m.san,role:i%2===0?'نقلتك':'رد الخصم',notes:notes.join(' ')});
 }
 const heading=document.createElement('strong');heading.textContent=b.isCheckmate()&&forced?'مات بخط إجباري':p.line.length>1?'تحليل الخط المعروض':'تحليل النقلة';box.append(heading);
 for(const step of steps){const row=document.createElement('div');row.style.cssText='padding:9px 0;border-bottom:1px solid #7773';const top=document.createElement('div');top.style.cssText='display:flex;justify-content:space-between;gap:8px';const label=document.createElement('span');label.textContent=step.role;const san=document.createElement('b');san.dir='ltr';san.textContent=step.san;top.append(label,san);const detail=document.createElement('div');detail.style.cssText='font-size:13px;line-height:1.7;margin-top:4px';detail.textContent=step.notes;row.append(top,detail);box.append(row);}
 const summary=document.createElement('div');summary.style.cssText='padding:9px 0;font-size:13px;line-height:1.7';const delta=score()-initial;summary.textContent=b.isCheckmate()?'النتيجة: كش مات.':'صافي تغير المادة في الخط المعروض: '+(delta>0?'+':'')+delta+' نقطة. هذا ليس تقييمًا كاملًا للموقف.';box.append(summary);
 if(p.acceptedMoves?.length>1){const alt=document.createElement('div');alt.style.cssText='font-size:13px;line-height:1.7;padding:6px 0';alt.textContent='حلول بديلة متحققة: '+p.acceptedMoves.join(' / ');box.append(alt);}
 const lesson=tacticalLessons[(topic==='التركيبات التكتيكية'&&p.combination||topic==='تكتيكات النهايات'&&p.endgame)?topic:p.theme];if(lesson){const takeaway=document.createElement('div');takeaway.style.cssText='padding:8px 0;font-size:13px;line-height:1.7';takeaway.textContent='في مبارياتك: '+lesson.detect+' '+lesson.mistake;box.append(takeaway);}
}
function finish(revealed=false){if(revealed)verdict=null;done=true;$('#labIntro').hidden=true;$('#labMethod').textContent='';$('#labLesson').style.display='none';const p=queue[n];if(!revealed)counted.add(p.id);if(!failed&&!hints&&!revealed)firstCounted.add(p.id);round=counted.size;roundFirst=firstCounted.size;if(!revealed&&!log.solved.includes(p.id))log.solved.push(p.id);if(!failed&&!hints&&!revealed)log.review=log.review.filter(x=>x!==p.id);$('#labExplanation').hidden=false;$('#labExplainText').textContent=(p.combinationNote?p.combinationNote+' — ':'')+p.explain;explainLine(p);renderTheme(p.theme,englishTheme[p.theme]);$('#labTask').textContent=revealed?'راجع الفكرة وجربها تاني':usedAlternative?'Alternative · حل بديل صحيح':'Excellent · حل صحيح';$('#labFeedback').textContent=revealed?'عرض الحل لا يُحسب إجابة صحيحة.':failed||hints?'حل صحيح. كرر الموقف لاحقًا دون تلميح.':usedAlternative?'حل بديل متحقق من أول محاولة دون مساعدة.':'حل صحيح من أول محاولة دون مساعدة.';$('#labNext').hidden=false;$('#labNext').textContent=n===queue.length-1?'نتيجة الجولة':'الموقف التالي';$('#labHint').hidden=true;$('#labAnswer').hidden=true;$('#labSkip').hidden=true;draw();save()}
function rejectMove(square,message){
  verdict={square,kind:'wrong'};
  miss(message);
  draw();
}
function play(sq,promotionChoice){
  if(done)return;
  if(c.get(sq)?.color===c.turn()){
    verdict=null;
    selected=sq;
    draw();
    return;
  }
  if(!selected)return;
  const from=selected;
  selected=null;
  const promotions=c.moves({square:from,verbose:true}).filter(m=>m.to===sq&&m.promotion);
  if(promotions.length&&!promotionChoice){
    const dialog=document.createElement('dialog');dialog.style.cssText='border:1px solid #9b8054;border-radius:16px;padding:20px;background:#29241e;color:#fff;max-width:90vw;text-align:center';
    const heading=document.createElement('div');heading.textContent='اختر قطعة الترقية';heading.style.marginBottom='12px';dialog.append(heading);
    const choices=document.createElement('div');choices.style.cssText='display:flex;gap:8px;justify-content:center';
    for(const [piece,label] of [['q','وزير'],['r','رخ'],['b','فيل'],['n','حصان']]){
      const btn=document.createElement('button');btn.className='premium-btn';btn.textContent=label;btn.onclick=()=>{dialog.close();dialog.remove();selected=from;play(sq,piece)};choices.append(btn);
    }
    dialog.append(choices);dialog.addEventListener('cancel',()=>{dialog.remove();selected=from;draw()});document.body.append(dialog);dialog.showModal();return;
  }
  let move;
  try{move=c.move({from,to:sq,promotion:promotionChoice||'q'})}catch{}
  if(!move){
    playSound('invalid');rejectMove(sq,'النقلة غير قانونية. افحص حركة القطعة وأمان الملك.');
    return;
  }
  const p=queue[n];
  if(p.defense){
    if(from!==p.target||c.isAttacked(sq,c.turn())){
      c.undo();
      rejectMove(sq,'راجع تهديد الخصم. أنقذ القطعة المعرضة للأخذ بنقلها إلى مربع آمن.');
      return;
    }
    verdict={square:sq,kind:'correct'};
    last=move;moveSound(move);
    $('#labSteps').textContent=move.san;
    finish();
    return;
  }
  const acceptsMate=activeLine[ply]?.endsWith('#')&&c.isCheckmate();
  const alternative=move.san!==activeLine[ply]&&(acceptsMate||(ply===0&&p.acceptedMoves?.includes(move.san)));
  if(move.san!==activeLine[ply]&&!acceptsMate&&!(ply===0&&p.acceptedMoves?.includes(move.san))){
    c.undo();
    rejectMove(sq,'Try Again · نقلة قانونية غير معتمدة في هذا التدريب. افحص الهدف؛ قد توجد حلول أخرى لم تُفحص.');
    return;
  }
  if(alternative)usedAlternative=true;
  verdict={square:sq,kind:'correct'};
  last=move;moveSound(move);
  ply++;
  if(ply<activeLine.length)last=c.move(activeLine[ply++]);
  $('#labSteps').textContent=c.history().join('  ');
  if(ply>=activeLine.length){
    finish();
  }else{
    $('#labFeedback').textContent='صحيح. الخصم نفّذ ردًا تدريبيًا متحققًا؛ كمّل الحساب.';
    draw();
  }
}
function markAssisted(){if(!log.review.includes(queue[n].id))log.review.push(queue[n].id);save()}
$('#labHint').onclick=()=>{if(mode==='exam'||done||!queue[n])return;hints++;markAssisted();const p=queue[n];if(p.defense){$('#labFeedback').textContent=hints===1?`افحص القطعة السوداء على ${p.attacker}.`:`القطعة المهددة على ${p.target}. انقلها خارج الهجوم.`;if(hints>1){selected=p.target;draw()}return}if(hints===1)$('#labFeedback').textContent=p.hint;else{const clone=new Chess(c.fen()),m=clone.move(activeLine[ply]);selected=m.from;draw();$('#labFeedback').textContent=hints===2?'ابدأ بالقطعة المحددة، وابحث عن مربع وصولها.':`النقلة المقصودة: ${activeLine[ply]}`}};
$('#labAnswer').onclick=()=>{if(mode==='exam'||done||!queue[n])return;hints++;markAssisted();const p=queue[n];if(p.defense){for(const m of c.moves({square:p.target,verbose:true})){c.move(m);if(!c.isAttacked(m.to,c.turn())){last=m;break}c.undo()}}else{while(ply<activeLine.length)last=c.move(activeLine[ply++])}$('#labSteps').textContent=c.history().join('  ');finish(true)};
$('#labNext').onclick=()=>{if(n+1<queue.length){n++;load()}else{$('#labTask').textContent='الجولة مكتملة';$('#labIntro').hidden=false;$('#labIntro').textContent=`${round} من ${queue.length} حلول صحيحة، منها ${roundFirst} من أول محاولة دون تلميح.`;if(mode==='exam'){log.exam={score:roundFirst,total:queue.length,date:new Date().toISOString()};$('#labFeedback').textContent=`اختبار دون تلميحات: ${roundFirst} / ${queue.length} من أول محاولة. ${roundFirst>=8?'اجتزت حد ٨ من ١٠.':'راجع الأخطاء ثم جرّب اختبارًا آخر.'} النتيجة ليست تقييم Chess.com.`;save()}else $('#labFeedback').textContent='راجع أخطاءك أو ابدأ جولة جديدة. النتيجة هنا ليست تقييم Chess.com.';$('#labNext').hidden=true;$('#labTask').focus()}};
$('#labRetry').onclick=()=>{const f=failed,h=hints;load();failed=f;hints=h};$('#labFlip').onclick=()=>{flipped=!flipped;draw()};
function start(review=false){for(const id of ['labMode','labDifficulty','labSide'])document.getElementById(id)._syncDirect?.();counted=new Set();firstCounted=new Set();round=0;roundFirst=0;n=0;topic=$('#labTopic').value;mode=review?'review':$('#labMode').value;$('#labTopicLabel').hidden=mode!=='learn';$('#labDifficultyLabel').hidden=mode!=='learn';$('#labSideLabel').hidden=mode!=='learn';queue=review?log.review.map(id=>all.find(p=>p.id===id)).filter(Boolean):mode==='mixed'?shuffle([...shuffle(bank.filter(p=>p.examReady)).slice(0,6),...shuffle(defs).slice(0,4)]):mode==='exam'?([...shuffle(bank.filter(p=>p.examReady&&!log.solved.includes(p.id))),...shuffle(bank.filter(p=>p.examReady&&log.solved.includes(p.id)))]).slice(0,10):all.filter(p=>(topic==='all'||p.theme===topic||(topic==='التركيبات التكتيكية'&&p.combination)||(topic==='تكتيكات النهايات'&&p.endgame))&&($('#labDifficulty').value==='all'||p.level===Number($('#labDifficulty').value))&&($('#labSide').value==='all'||new Chess(p.fen).turn()===$('#labSide').value)).sort((a,b)=>a.level-b.level);if(!queue.length){$('#labLesson').style.display='none';$('#labIntro').hidden=true;$('#labMethod').textContent='';$('#labSteps').textContent='';$('#labExplanation').hidden=true;renderTheme();$('#labFlip').disabled=true;$('#labRetry').disabled=true;$('#labTask').textContent='لا توجد مواقف بهذه الاختيارات';$('#labFeedback').textContent='اختَر كل المستويات أو الأبيض والأسود لتوسيع النتائج.';done=true;$('#labCount').textContent='٠ مواقف';$('#labBoard').innerHTML='';$('#labHint').hidden=true;$('#labAnswer').hidden=true;$('#labNext').hidden=true;$('#labSkip').hidden=true;return}load()}
$('#labStart').onclick=()=>start();$('#labReview').onclick=()=>start(true);$('#labMode').onchange=()=>start();$('#labTopic').onchange=()=>start();$('#labDifficulty').onchange=()=>start();$('#labSide').onchange=()=>start();
function route(){if(location.hash.startsWith('#train/tactics/')){location.hash='tactics-lab';return}const active=['#tactics-lab','#mixed-lab','#tactics-exam'].includes(location.hash);panel.hidden=!active;if(!active)return;document.body.classList.add('training-view');document.body.dataset.section='lab';$('#homeDashboard').hidden=true;document.querySelector('.workspace').hidden=true;$('#safetyPanel').hidden=true;$('#labMode').value=location.hash==='#tactics-exam'?'exam':location.hash==='#mixed-lab'?'mixed':'learn';$('#labTitle').textContent=location.hash==='#tactics-exam'?'اختبار التكتيكات':location.hash==='#mixed-lab'?'التحدي المختلط':'مختبر التكتيكات';start();window.scrollTo(0,0)}window.addEventListener('hashchange',route);route();

$('#labSkip').onclick=()=>{if(mode!=='exam'||done)return;failed=true;markAssisted();const p=queue[n];while(ply<p.line.length)last=c.move(p.line[ply++]);$('#labSteps').textContent=c.history().join('  ');finish(true)};

import {keepView} from './refresh.js';
keepView('tacticsLab', () => panel.hidden || !queue.length ? null : {
  ids:queue.map(p=>p.id), n, mode, topic, difficulty:$('#labDifficulty').value,
  side:$('#labSide').value, counted:[...counted], first:[...firstCounted], failed, hints
}, saved => {
  if(!saved||!Array.isArray(saved.ids)||!Number.isInteger(saved.n)||!['learn','exam','mixed','review'].includes(saved.mode))return;
  const positions=saved.ids.map(id=>all.find(item=>item.id===id));
  if (positions.some(p=>!p) || !positions[saved.n]) return;
  $('#labMode').value=saved.mode==='review'?'learn':saved.mode;
  $('#labTopic').value=saved.topic; $('#labSide').value=saved.side; $('#labDifficulty').value=saved.difficulty;
  start(saved.mode==='review');
  queue=positions; n=saved.n; load();
  counted=new Set(Array.isArray(saved.counted)?saved.counted.filter(id=>saved.ids.includes(id)):[]); firstCounted=new Set(Array.isArray(saved.first)?saved.first.filter(id=>counted.has(id)):[]);
  round=counted.size; roundFirst=firstCounted.size; failed=saved.failed; hints=saved.hints;
});
