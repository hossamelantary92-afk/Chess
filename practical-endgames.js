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
  <p>حدّد هدفك من النهاية، والعب خطّ التمرين على الرقعة.</p>
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
  if (!exercises[saved.index]) return;
  open(saved.index);
  started = saved.started;
  outcome = saved.outcome;
  step = saved.step;
  const played = outcome === 'alternative' ? exercises[index].alternative.split(' ') : line.slice(0,step);
  for (const move of played) chess.move(move);
  render();
});
