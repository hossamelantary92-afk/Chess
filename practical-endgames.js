import {keepView} from './refresh.js';
import {squareAt, paintSquare} from './board-cells.js';
import {Chess} from './chess.js';
import {endgameLessons} from './practical-endgames-data.js?v=205';

const $ = id => document.getElementById(id);
const pieceNames = {p:'بيدق', n:'حصان', b:'فيل', r:'رخ', q:'وزير', k:'ملك'};
const labels = {win:'ألعب على الفوز', draw:'أحافظ على التعادل'};
const exercises = endgameLessons.flatMap(lesson => lesson.positions);
const panel = document.createElement('section');
panel.id = 'endgamePractice';
panel.hidden = true;
panel.innerHTML = `
  <nav class="training-links mid-nav"><a href="#home">الرئيسية</a></nav>
  <div class="lesson-head"><h2 lang="en">Practical Endgames</h2></div>
  <p>حدّد هدفك من النهاية، والعب خطّ التمرين على الرقعة.</p><details class="unit-card" id="endgameFoundations"><summary>مبادئ النهايات</summary><article><h3>الفوز دون خنق</h3><ul><li>المات يتطلب أن يكون الملك في كش؛ الخنق لا يوجد فيه كش ولا نقلة قانونية.</li><li>وأنت متقدم بوزير أو رخ، ضيّق مساحة الملك مع الاحتفاظ برد قانوني له حتى لحظة المات.</li><li>افحص وضع الملك بعد كل نقلة هادئة؛ لا تستعجل أخذ آخر بيدق إذا أدى للتعادل.</li></ul><details><summary>الخصم لا يملك نقلة قانونية وملكه ليس في كش. النتيجة؟</summary><p>تعادل بالخنق — انعدام النقلات دون كش هو الخنق والتعادل، مهما كان تفوقك المادي.</p></details></article><article><h3>الملك قطعة نشطة</h3><ul><li>مع تناقص القطع تقل بعض أخطار الهجوم، ويزداد دور الملك في دعم البيادق.</li><li>قرّب الملك من أهدافه مع فحص الكش والقانونية؛ لا تدخل في هجوم قائم.</li><li>الملكان لا يجوز أن يتجاورا؛ المعارضة تساعد على كسب أو منع اختراق.</li></ul><details><summary>لماذا تنشّط الملك في نهايات كثيرة؟</summary><p>ليهاجم بيادق ويدعم الترقية مع مراعاة الأمان — الملك قوة قتالية في النهاية، لكنه يظل خاضعًا لقواعد الكش.</p></details></article><article><h3>البيدق المار ومربع البيدق</h3><ul><li>البيدق المار لا يعترضه بيدق خصم على عموده أو العمودين المجاورين أمامه.</li><li>قاعدة المربع تساعد في سباق ملك ضد بيدق بلا عوائق؛ الدور والقفزة الأولى مهمان.</li><li>عند وجود قطع أو كشات أو عوائق، احسب النقلات بدل استخدام القاعدة وحدها.</li></ul><details><summary>هل قاعدة المربع تغني عن الحساب مع وجود رخ؟</summary><p>لا؛ الرخ والكشات قد تغيّر السباق — هي أداة لوضع مبسط؛ تدخل القطع يضيف احتمالات جديدة.</p></details></article></details>
  <div class="training-links mid-nav"><button class="premium-btn primary" id="endgameExam">اختبار النهايات</button><button class="premium-btn" id="endgameExitExam" hidden>إنهاء الاختبار</button></div><p id="endgameExamScore" role="status"></p>
  <label for="endgamePicker">اختار موقف</label>
  <select id="endgamePicker" class="premium-btn"></select>
  <div class="safety-layout">
    <div class="board-area">
      <div id="endgameGoals" class="training-links mid-nav">
        <button type="button" class="premium-btn" data-goal="win">ألعب على الفوز</button>
        <button type="button" class="premium-btn" data-goal="draw">أحافظ على التعادل</button>
      </div>
      <div class="board-top"><span id="endgameTurn"></span><span id="endgameNotation" dir="ltr"></span></div>
      <div class="frame"><div id="endgameBoard" aria-label="رقعة تدريب النهايات"></div></div>
    </div>
    <div class="coach">
      <h3 id="endgameTitle" lang="en" dir="ltr" tabindex="-1"></h3>
      <p id="endgamePrompt"></p>

      <div id="endgamePromote" class="training-links mid-nav" hidden aria-label="اختار قطعة الترقية"></div>
      <p id="endgameFeedback" role="status" aria-live="polite"></p>
      <div id="endgameReview" class="unit-card" hidden>
        <h4 lang="en" dir="ltr">Review</h4>
        <p id="endgameNote"></p>
      </div>
      <div class="training-links mid-nav">
        <button type="button" class="premium-btn" id="endgameHint" hidden>تلميح للنقلة</button>
        <button type="button" class="premium-btn" id="endgameRestart" hidden>أعد المحاولة</button>
        <button type="button" class="premium-btn primary" id="endgameNext" hidden>الموقف التالي</button>
      </div>
    </div>
  </div>`;
document.querySelector('main footer').before(panel);
const queenTrainer=document.createElement('details');
queenTrainer.className='unit-card';
queenTrainer.innerHTML='<summary>Queen Checkmate Mastery · تدريب المات بالوزير</summary><p>ضيّق مساحة الملك بالوزير، قرّب ملكك، وتجنب الخنق. العب أي نقلة قانونية حتى المات. دفاع تدريبي تقريبي وليس Tablebase.</p><div class="training-links"><button class="premium-btn" id="queenReset">ابدأ / أعد التدريب</button></div><div class="frame"><div id="queenBoard" aria-label="رقعة المات بالوزير"></div></div><p id="queenStatus" role="status"></p>';
panel.querySelector('.lesson-head').after(queenTrainer);
let qGame,qSelected;
function queenDraw(){
 const board=$('queenBoard');let i=0;
 const targets=new Set(qSelected?qGame.moves({square:qSelected,verbose:true}).map(m=>m.to):[]);
 for(const rank of '87654321')for(const file of 'abcdefgh'){
 const sq=file+rank,p=qGame.get(sq),btn=squareAt(board,i++);
 btn.type='button';btn.className=(('abcdefgh'.indexOf(file)+Number(rank))%2?'dark':'')+(qSelected===sq?' selected':'')+(targets.has(sq)?' legal':'');
 btn.disabled=qGame.isGameOver();btn.setAttribute('aria-label',sq);
 paintSquare(btn,p?'<img class="piece" src="pieces/'+p.color+p.type.toUpperCase()+'.svg" alt="" draggable="false">':'');
 btn.onclick=()=>queenChoose(sq);
 }
}
function queenDefense(g){
 let best=null,score=-Infinity;
 for(const m of g.moves({verbose:true})){
 g.move(m.san);const captured=m.captured==='q',draw=g.isDraw(),mateThreat=g.moves().some(s=>s.endsWith('#'));
 const king=g.board().flat().find(p=>p?.type==='k'&&p.color==='b');
 const center=king?Math.min('abcdefgh'.indexOf(king.square[0]),7-'abcdefgh'.indexOf(king.square[0]),Number(king.square[1])-1,8-Number(king.square[1])):0;
 const value=captured||draw?10000:(mateThreat?-1000:0)+center*10;
 g.undo();if(value>score){score=value;best=m.san;}
 }return best;
}
function queenChoose(sq){
 if(qGame.isGameOver())return;
 if(qGame.get(sq)?.color==='w'){qSelected=qSelected===sq?null:sq;queenDraw();return;}
 if(!qSelected)return;
 const m=qGame.moves({square:qSelected,verbose:true}).find(x=>x.to===sq);if(!m)return;
 qGame.move(m.san);qSelected=null;
 if(!qGame.isGameOver()){const reply=queenDefense(qGame);if(reply)qGame.move(reply);}
 $('queenStatus').textContent=qGame.isCheckmate()?'أحسنت! حققت المات في '+Math.ceil(qGame.history().length/2)+' نقلة.':qGame.isDraw()?'تعادل — أعد المحاولة وتجنب الخنق أو فقد الوزير.':'استمر في تضييق مساحة الملك وتقريب ملكك.';
 queenDraw();
}
$('queenReset').onclick=()=>{qGame=new Chess('8/8/4k3/8/8/3Q4/8/4K3 w - - 0 1');qSelected=null;$('queenStatus').textContent='الأبيض يلعب — حقق المات.';queenDraw();};
queenTrainer.addEventListener('toggle',()=>{if(queenTrainer.open&&!qGame)$('queenReset').click();});
const rookMateTrainer=document.createElement('details');
rookMateTrainer.className='unit-card';
rookMateTrainer.innerHTML='<summary>Rook Checkmate Mastery · تدريب المات بالرخ</summary><p>احصر الملك بالرخ، قرّب ملكك واستخدم المعارضة، واحمِ الرخ من الأخذ. العب أي نقلة قانونية حتى المات. دفاع تدريبي تقريبي وليس Tablebase.</p><div class="training-links"><button class="premium-btn" id="rookMateReset">ابدأ / أعد التدريب</button></div><div class="frame"><div id="rookMateBoard" aria-label="رقعة المات بالرخ"></div></div><p id="rookMateStatus" role="status"></p>';
panel.querySelector('.lesson-head').after(rookMateTrainer);
let rGame,rSelected;
function rookMateDraw(){
 const board=$('rookMateBoard');let i=0;
 const targets=new Set(rSelected?rGame.moves({square:rSelected,verbose:true}).map(m=>m.to):[]);
 for(const rank of '87654321')for(const file of 'abcdefgh'){
 const sq=file+rank,p=rGame.get(sq),btn=squareAt(board,i++);
 btn.type='button';btn.className=(('abcdefgh'.indexOf(file)+Number(rank))%2?'dark':'')+(rSelected===sq?' selected':'')+(targets.has(sq)?' legal':'');
 btn.disabled=rGame.isGameOver();btn.setAttribute('aria-label',sq);
 paintSquare(btn,p?'<img class="piece" src="pieces/'+p.color+p.type.toUpperCase()+'.svg" alt="" draggable="false">':'');
 btn.onclick=()=>rookMateChoose(sq);
 }
}
function rookMateDefense(g){
 let best=null,score=-Infinity;
 for(const m of g.moves({verbose:true})){
 g.move(m.san);const captured=m.captured==='r',draw=g.isDraw(),mateThreat=g.moves().some(s=>s.endsWith('#'));
 const king=g.board().flat().find(p=>p?.type==='k'&&p.color==='b');
 const center=king?Math.min('abcdefgh'.indexOf(king.square[0]),7-'abcdefgh'.indexOf(king.square[0]),Number(king.square[1])-1,8-Number(king.square[1])):0;
 const value=captured||draw?10000:(mateThreat?-1000:0)+center*10;
 g.undo();if(value>score){score=value;best=m.san;}
 }return best;
}
function rookMateChoose(sq){
 if(rGame.isGameOver())return;
 if(rGame.get(sq)?.color==='w'){rSelected=rSelected===sq?null:sq;rookMateDraw();return;}
 if(!rSelected)return;
 const m=rGame.moves({square:rSelected,verbose:true}).find(x=>x.to===sq);if(!m)return;
 rGame.move(m.san);rSelected=null;
 if(!rGame.isGameOver()){const reply=rookMateDefense(rGame);if(reply)rGame.move(reply);}
 $('rookMateStatus').textContent=rGame.isCheckmate()?'أحسنت! حققت المات في '+Math.ceil(rGame.history().length/2)+' نقلة.':rGame.isDraw()?'تعادل — أعد المحاولة وتجنب الخنق أو فقد الرخ.':'استمر في تضييق مساحة الملك وتقريب ملكك.';
 rookMateDraw();
}
$('rookMateReset').onclick=()=>{rGame=new Chess('8/8/4k3/8/8/3R4/8/4K3 w - - 0 1');rSelected=null;$('rookMateStatus').textContent='الأبيض يلعب — حقق المات.';rookMateDraw();};
rookMateTrainer.addEventListener('toggle',()=>{if(rookMateTrainer.open&&!rGame)$('rookMateReset').click();});
const bishopsMateTrainer=document.createElement('details');
bishopsMateTrainer.className='unit-card';
bishopsMateTrainer.innerHTML='<summary>Two Bishops Checkmate Mastery · تدريب المات بالفيلين</summary><p>نسّق الفيلين على اللونين، قرّب ملكك وادفع الخصم إلى الركن، واحمِ الفيلين من الأخذ. العب أي نقلة قانونية حتى المات. دفاع تدريبي تقريبي وليس Tablebase.</p><div class="training-links"><button class="premium-btn" id="bishopsMateReset">ابدأ / أعد التدريب</button></div><div class="frame"><div id="bishopsMateBoard" aria-label="رقعة المات بالفيلين"></div></div><p id="bishopsMateStatus" role="status"></p>';
panel.querySelector('.lesson-head').after(bishopsMateTrainer);
let bbGame,bbSelected;
function bishopsMateDraw(){
 const board=$('bishopsMateBoard');let i=0;
 const targets=new Set(bbSelected?bbGame.moves({square:bbSelected,verbose:true}).map(m=>m.to):[]);
 for(const rank of '87654321')for(const file of 'abcdefgh'){
 const sq=file+rank,p=bbGame.get(sq),btn=squareAt(board,i++);
 btn.type='button';btn.className=(('abcdefgh'.indexOf(file)+Number(rank))%2?'dark':'')+(bbSelected===sq?' selected':'')+(targets.has(sq)?' legal':'');
 btn.disabled=bbGame.isGameOver();btn.setAttribute('aria-label',sq);
 paintSquare(btn,p?'<img class="piece" src="pieces/'+p.color+p.type.toUpperCase()+'.svg" alt="" draggable="false">':'');
 btn.onclick=()=>bishopsMateChoose(sq);
 }
}
function bishopsMateDefense(g){
 let best=null,score=-Infinity;
 for(const m of g.moves({verbose:true})){
 g.move(m.san);const captured=m.captured==='b',draw=g.isDraw(),mateThreat=g.moves().some(s=>s.endsWith('#'));
 const king=g.board().flat().find(p=>p?.type==='k'&&p.color==='b');
 const center=king?Math.min('abcdefgh'.indexOf(king.square[0]),7-'abcdefgh'.indexOf(king.square[0]),Number(king.square[1])-1,8-Number(king.square[1])):0;
 const value=captured||draw?10000:(mateThreat?-1000:0)+center*10;
 g.undo();if(value>score){score=value;best=m.san;}
 }return best;
}
function bishopsMateChoose(sq){
 if(bbGame.isGameOver())return;
 if(bbGame.get(sq)?.color==='w'){bbSelected=bbSelected===sq?null:sq;bishopsMateDraw();return;}
 if(!bbSelected)return;
 const m=bbGame.moves({square:bbSelected,verbose:true}).find(x=>x.to===sq);if(!m)return;
 bbGame.move(m.san);bbSelected=null;
 if(!bbGame.isGameOver()){const reply=bishopsMateDefense(bbGame);if(reply)bbGame.move(reply);}
 $('bishopsMateStatus').textContent=bbGame.isCheckmate()?'أحسنت! حققت المات في '+Math.ceil(bbGame.history().length/2)+' نقلة.':bbGame.isDraw()?'تعادل — أعد المحاولة وتجنب الخنق أو فقد الفيل.':'نسّق الفيلين وقرّب ملكك لدفع الخصم نحو الركن.';
 bishopsMateDraw();
}
$('bishopsMateReset').onclick=()=>{bbGame=new Chess('8/8/4k3/8/8/2BB4/8/4K3 w - - 0 1');bbSelected=null;$('bishopsMateStatus').textContent='الأبيض يلعب — حقق المات.';bishopsMateDraw();};
bishopsMateTrainer.addEventListener('toggle',()=>{if(bishopsMateTrainer.open&&!bbGame)$('bishopsMateReset').click();});
const knightBishopMateTrainer=document.createElement('details');
knightBishopMateTrainer.className='unit-card';
knightBishopMateTrainer.innerHTML='<summary>Bishop & Knight Checkmate Mastery · تدريب المات بالفيل والحصان</summary><p>ادفع الملك إلى a1 أو h8 (لون الفيل على c3)، واستخدم مناورة W للحصان عند نقله من الركن الخطأ. العب أي نقلة قانونية حتى المات. دفاع تدريبي تقريبي وليس Tablebase.</p><div class="training-links"><button class="premium-btn" id="knightBishopMateReset">ابدأ / أعد التدريب</button></div><div class="frame"><div id="knightBishopMateBoard" aria-label="رقعة المات بالفيل والحصان"></div></div><p id="knightBishopMateStatus" role="status"></p>';
panel.querySelector('.lesson-head').after(knightBishopMateTrainer);
let bnGame,bnSelected;
function knightBishopMateDraw(){
 const board=$('knightBishopMateBoard');let i=0;
 const targets=new Set(bnSelected?bnGame.moves({square:bnSelected,verbose:true}).map(m=>m.to):[]);
 for(const rank of '87654321')for(const file of 'abcdefgh'){
 const sq=file+rank,p=bnGame.get(sq),btn=squareAt(board,i++);
 btn.type='button';btn.className=(('abcdefgh'.indexOf(file)+Number(rank))%2?'dark':'')+(bnSelected===sq?' selected':'')+(targets.has(sq)?' legal':'');
 btn.disabled=bnGame.isGameOver();btn.setAttribute('aria-label',sq);
 paintSquare(btn,p?'<img class="piece" src="pieces/'+p.color+p.type.toUpperCase()+'.svg" alt="" draggable="false">':'');
 btn.onclick=()=>knightBishopMateChoose(sq);
 }
}
function knightBishopMateDefense(g){
 let best=null,score=-Infinity;
 for(const m of g.moves({verbose:true})){
 g.move(m.san);const captured=['b','n'].includes(m.captured),draw=g.isDraw(),mateThreat=g.moves().some(s=>s.endsWith('#'));
 const king=g.board().flat().find(p=>p?.type==='k'&&p.color==='b');
 const center=king?Math.min('abcdefgh'.indexOf(king.square[0]),7-'abcdefgh'.indexOf(king.square[0]),Number(king.square[1])-1,8-Number(king.square[1])):0;
 const value=captured||draw?10000:(mateThreat?-1000:0)+center*10;
 g.undo();if(value>score){score=value;best=m.san;}
 }return best;
}
function knightBishopMateChoose(sq){
 if(bnGame.isGameOver())return;
 if(bnGame.get(sq)?.color==='w'){bnSelected=bnSelected===sq?null:sq;knightBishopMateDraw();return;}
 if(!bnSelected)return;
 const m=bnGame.moves({square:bnSelected,verbose:true}).find(x=>x.to===sq);if(!m)return;
 bnGame.move(m.san);bnSelected=null;
 if(!bnGame.isGameOver()){const reply=knightBishopMateDefense(bnGame);if(reply)bnGame.move(reply);}
 $('knightBishopMateStatus').textContent=bnGame.isCheckmate()?'أحسنت! حققت المات في '+Math.ceil(bnGame.history().length/2)+' نقلة.':bnGame.isDraw()?'تعادل — أعد المحاولة وتجنب الخنق أو فقد الفيل أو الحصان.':'نسّق الملك والفيل والحصان وادفع الخصم إلى ركن لون الفيل.';
 knightBishopMateDraw();
}
$('knightBishopMateReset').onclick=()=>{bnGame=new Chess('8/8/4k3/8/8/2BN4/8/4K3 w - - 0 1');bnSelected=null;$('knightBishopMateStatus').textContent='الأبيض يلعب — حقق المات.';knightBishopMateDraw();};
knightBishopMateTrainer.addEventListener('toggle',()=>{if(knightBishopMateTrainer.open&&!bnGame)$('knightBishopMateReset').click();});
const picker = $('endgamePicker');
const levelLabels = {1:'أساسي',2:'متوسط',3:'متقدم'};
const learningOrder = [];
for (const level of [1,2,3]) {
  for (const lesson of endgameLessons) {
    const positions = lesson.positions.filter(position => position.level === level);
    if (!positions.length) continue;
    const group = document.createElement('optgroup');
    group.label = levelLabels[level] + ' · ' + lesson.title;
    for (const position of positions) {
      const i = exercises.indexOf(position);
      learningOrder.push(i);
      const option = document.createElement('option');
      option.value = i;
      option.textContent = position.title;
      group.append(option);
    }
    picker.append(group);
  }
}

let index = 0;
let chess;
let line;
let step;
let selected;
let started;
let outcome;
let side;
let exam = null;
const examGroups = [1,8,11,14,16,17];
function examScore(){ $('endgameExamScore').textContent = exam ? `الاختبار ${Math.min(exam.at+1,exam.queue.length)}/${exam.queue.length} · ${exam.results.filter(r=>r.ok).length} صحيحة` : ''; }
function recordExam(ok){ if(!exam || exam.results.length>exam.at)return; exam.results.push({index,ok}); examScore(); }
function exitExam(){exam=null;picker.disabled=false;$('endgameExam').hidden=false;$('endgameExitExam').hidden=true;examScore();open(index);}
$('endgameExam').onclick=()=>{exam={at:0,results:[],queue:examGroups.map(i=>{const group=endgameLessons[i].positions;return exercises.indexOf(group[Math.floor(Math.random()*group.length)]);})};picker.disabled=true;$('endgameExam').hidden=true;$('endgameExitExam').hidden=false;open(exam.queue[0]);examScore();};
$('endgameExitExam').onclick=exitExam;

function drawBoard() {
  const board = $('endgameBoard');
  const files = side === 'w' ? 'abcdefgh' : 'hgfedcba';
  const ranks = side === 'w' ? '87654321' : '12345678';
  const last = chess.history({verbose:true}).at(-1);
  const targets = new Set(selected ? chess.moves({square:selected, verbose:true}).map(move=>move.to) : []);
  let cellIndex = 0;
  $('endgameTurn').textContent = chess.isCheckmate() ? 'كش مات' : chess.isDraw() ? 'تعادل' : chess.turn() === 'w' ? 'دور الأبيض' : 'دور الأسود';
  $('endgameNotation').textContent = chess.history().join(' ');
  for (const rank of ranks) {
    for (const [column, file] of [...files].entries()) {
      const square = file + rank;
      const piece = chess.get(square);
      const button = squareAt(board, cellIndex++);
      button.type = 'button';
      button.dataset.square = square;
      button.className = ('abcdefgh'.indexOf(file) + Number(rank)) % 2 ? 'dark' : '';
      if (last?.from === square || last?.to === square) button.classList.add('safe-last');
      if (selected === square) button.classList.add('selected');
      button.classList.toggle('legal', targets.has(square));
      button.disabled = Boolean(outcome);
      button.setAttribute('aria-label', square + (piece ? ` ${pieceNames[piece.type]} ${piece.color === 'w' ? 'أبيض' : 'أسود'}` : ''));
      paintSquare(button, (piece ? `<img class="piece" src="pieces/${piece.color + piece.type.toUpperCase()}.svg" alt="" draggable="false">` : '') +
        (column === 0 ? `<small class="rank">${rank}</small>` : '') +
        (rank === ranks.at(-1) ? `<small class="file">${file}</small>` : ''));
      button.onclick = () => chooseSquare(square);

    }
  }
}

function render(feedback = '') {
  const exercise = exercises[index];
  $('endgameTitle').textContent = exercise.title;
  $('endgameGoals').hidden = started;
  $('endgamePromote').hidden = true;
  $('endgameHint').hidden = Boolean(exam) || !started || Boolean(outcome);
  $('endgameRestart').hidden = Boolean(exam) || !started;
  $('endgameNext').hidden = exam ? !outcome : outcome !== 'complete';
  $('endgameNext').textContent = learningOrder.indexOf(index) + 1 === learningOrder.length ? 'ارجع للموقف الأول' : 'الموقف التالي';
  if(exam) $('endgameNext').textContent = exam.at===exam.queue.length-1?'النتيجة':'السؤال التالي';
  $('endgameReview').hidden = !outcome;
  $('endgameNote').textContent = outcome ? exercise.note : '';
  $('endgamePrompt').textContent = outcome === 'alternative' ? 'الخط ده انتهى بالتعادل. أعد المحاولة ودور على طريقة تستفيد من وضع القطع.' :
    outcome === 'complete' ? 'أكملت خطّ التمرين.' :
    outcome === 'exam-wrong' ? 'راجع الشرح ثم انتقل للسؤال التالي.' : started ? (exam?'نفّذ النقلة المناسبة للهدف دون تلميح.':exercise.prompts[step / 2]) : `إنت بال${side === 'w' ? 'أبيض' : 'أسود'}. تختار تلعب على الفوز ولا تحافظ على التعادل؟`;
  $('endgameFeedback').textContent = feedback;
  drawBoard();
}

function chooseSquare(square) {
  if (outcome) return;
  if (!started) {
    $('endgameFeedback').textContent='اختار هدفك الأول عشان تبدأ تحرّك القطع.';
    $('endgameGoals').querySelector('button').focus();
    return;
  }
  $('endgamePromote').hidden = true;
  if (chess.get(square)?.color === side) {
    selected = selected === square ? null : square;
    drawBoard();
    $('endgameBoard').querySelector(`[data-square="${square}"]`).focus({preventScroll:true});
    return;
  }
  if (!selected) return;
  const moves = chess.moves({square:selected, verbose:true}).filter(move => move.to === square);
  if (!moves.length) {
    $('endgameFeedback').textContent = chess.isCheck() ? 'ملكك عليه كش. اختار نقلة تردّ الكش الأول.' : 'النقلة دي مش قانونية. اختار مربع من المربعات المحددة.';
    return;
  }
  if (moves.length === 1) {
    play(moves[0].san);
    return;
  }
  const choices = $('endgamePromote');
  choices.replaceChildren();
  for (const {promotion,san} of moves) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'premium-btn';
    button.textContent = pieceNames[promotion];
    button.onclick = () => play(san);
    choices.append(button);
  }
  choices.hidden = false;
  choices.firstElementChild.focus({preventScroll:true});
}

function play(san) {
  if(!started||outcome)return;
  const exercise = exercises[index];
  if(exam){const ok=san===line[0];chess.move(san);step=1;outcome=ok?'complete':'exam-wrong';recordExam(ok);selected=null;render(ok?'إجابة مطابقة للخط التعليمي.':`النقلة التعليمية: ${line[0]}. قد توجد بدائل صحيحة غير مقيمة.`);return;}
  const alternative = step === 0 && exercise.alternative?.split(' ');
  let feedback = '';
  $('endgamePromote').hidden = true;
  if (alternative && san === alternative[0]) {
    for (const move of alternative) chess.move(move);
    outcome = 'alternative';
  } else if (san === line[step]) {
    chess.move(san);
    step++;
    if (step < line.length) {
      const reply = line[step++];
      chess.move(reply);
      feedback = `ردّ الخصم في الخط · ${reply}`;
    }
    if (step === line.length) outcome = 'complete';
  } else {
    $('endgameFeedback').textContent = 'دي نقلة قانونية. جرّب نقلة تناسب المطلوب في الخط ده، أو استخدم التلميح.';
    if ($('endgamePromote').contains(document.activeElement)) {
      $('endgameBoard').querySelector(`[data-square="${selected}"]`).focus({preventScroll:true});
    }
    return;
  }
  selected = null;
  render(feedback);
  const target = outcome === 'complete' ? $('endgameNext') : outcome ? $('endgameRestart') : $('endgameTitle');
  target.focus({preventScroll:true});
}

function open(next) {
  if(!Number.isInteger(next)||!exercises[next])return;
  index = next;
  picker.value = index;
  chess = new Chess(exercises[index].fen);
  line = exercises[index].line.split(' ');
  side = chess.turn();
  step = 0;
  selected = null;
  started = false;
  outcome = null;
  render();
}

for (const button of $('endgameGoals').querySelectorAll('button')) {
  button.onclick = () => {
    if (button.dataset.goal !== exercises[index].goal) {
      if(exam){outcome='exam-wrong';recordExam(false);render('الهدف في التمرين: '+labels[exercises[index].goal]);return;}
      $('endgameFeedback').textContent = 'راجع المادة والبيدق الأقرب للترقية قبل ما تختار هدفك.';
      return;
    }
    started = true;
    render(labels[button.dataset.goal]);
    $('endgameTitle').focus({preventScroll:true});
  };
}
$('endgameHint').onclick = () => {
  $('endgameFeedback').textContent = `النقلة في الخط ده · ${line[step]}`;
};
$('endgameRestart').onclick = () => {
  open(index);
  $('endgameGoals').querySelector('button').focus({preventScroll:true});
};
$('endgameNext').onclick = () => {
  if(exam){exam.at++;if(exam.at<exam.queue.length){open(exam.queue[exam.at]);examScore();return;}const results=exam.results.slice();exitExam();$('endgameExamScore').textContent=`النتيجة ${results.filter(r=>r.ok).length}/${results.length} · راجع: ${results.filter(r=>!r.ok).map(r=>exercises[r.index].title).join('، ')||'لا أخطاء في الخطوط المختارة'}`;return;}
  open(learningOrder[(learningOrder.indexOf(index) + 1) % learningOrder.length]);
  $('endgameTitle').focus({preventScroll:true});
};
picker.onchange = () => open(Number(picker.value));

function route() {
  const draws = location.hash === '#draws';
  panel.hidden = !draws && location.hash !== '#practical-endgames';
  if (panel.hidden) {if(exam)exitExam();return;}
  document.body.classList.add('training-view');
  document.body.dataset.section = 'practical-endgames';
  $('homeDashboard').hidden = true;
  document.querySelector('.workspace').hidden = true;
  open(draws ? exercises.findIndex(item => item.title === 'Avoid Stalemate') : index);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();

keepView('endgame', () => panel.hidden || exam ? null : {index, started, step, outcome}, saved => {
  if (!saved || !Number.isInteger(saved.index) || !exercises[saved.index] || !Number.isInteger(saved.step) || saved.step<0 || saved.step>exercises[saved.index].line.split(' ').length || (saved.outcome==='alternative'&&!exercises[saved.index].alternative)) return;
  open(saved.index);
  started = saved.started;
  outcome = saved.outcome;
  step = saved.step;
  const played = outcome === 'alternative' ? exercises[index].alternative.split(' ') : line.slice(0,step);
  for (const move of played) chess.move(move);
  render();
});
