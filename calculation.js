import {keepView} from './refresh.js';
import {squareAt, paintSquare} from './board-cells.js';
import {Chess} from './chess.js';
import {calculationExercises} from './calculation-data.js';

const $ = id => document.getElementById(id);
const pieceNames = {p:'بيدق', n:'حصان', b:'فيل', r:'رخ', q:'وزير', k:'ملك'};
const stages = ['Candidate Moves', 'Best Reply', 'Continuation', 'Final Position'];
const panel = document.createElement('section');
panel.id = 'calculationPanel';
panel.hidden = true;
panel.innerHTML = `
  <nav class="training-links mid-nav"><a href="#home">الرئيسية</a></nav>
  <div class="lesson-head"><h2 lang="en">Calculation Trainer</h2></div>
  <p>قارن نقلتين، احسب رد الخصم، وقيّم الوضع. جرّب الخطّين قبل ما تنتقل للموقف التالي.</p>
  <label for="calcPicker">الموقف</label>
  <select id="calcPicker" class="premium-btn"></select>
  <div class="safety-layout">
    <div class="board-area">
      <div class="board-top"><span id="calcTurn"></span><span id="calcNotation" dir="ltr"></span></div>
      <div class="frame"><div id="calcBoard" aria-label="رقعة تدريب الحساب"></div></div>
    </div>
    <div class="coach">
      <h3 id="calcStage" lang="en" dir="ltr" tabindex="-1"></h3>
      <p id="calcPrompt"></p>
      <div id="calcChoices" class="training-links mid-nav"></div>
      <p id="calcFeedback" role="status" aria-live="polite"></p>
      <div id="calcReview" class="unit-card" hidden>
        <h4 id="calcTheme" lang="en" dir="ltr"></h4>
        <p id="calcOutcome"></p>
      </div>
      <div class="training-links mid-nav">
        <button class="premium-btn" id="calcRetry" type="button" hidden>ارجع للنقلات المرشحة</button>
        <button class="premium-btn primary" id="calcNext" type="button" hidden>الموقف التالي</button>
      </div>
    </div>
  </div>`;
document.querySelector('main footer').before(panel);

let index = 0;
let root;
let chess;
let branch;
let stage;
let selected;
let finished;
let completed = new Set();

function startPosition(position) {
  const game = new Chess(position.fen);
  for (const san of position.line.split(' ')) game.move(san);
  return game.fen();
}

const exercises = calculationExercises.map(exercise => ({...exercise, fen:startPosition(exercise.position)}));
for (const [i, exercise] of exercises.entries()) {
  const option = document.createElement('option');
  option.value = i;
  option.textContent = `${i + 1} / ${exercises.length} · ${new Chess(exercise.fen).turn() === 'w' ? 'الأبيض' : 'الأسود'}`;
  $('calcPicker').append(option);
}

function drawBoard() {
  const black = root.turn() === 'b';
  const files = black ? 'hgfedcba' : 'abcdefgh';
  const ranks = black ? '12345678' : '87654321';
  const board = $('calcBoard');
  const last = chess.history({verbose:true}).at(-1);
  let cellIndex = 0;
  $('calcTurn').textContent = chess.isCheckmate() ? 'كش مات' : chess.turn() === 'w' ? 'دور الأبيض' : 'دور الأسود';
  $('calcNotation').textContent = chess.history().join(' ');
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
      button.setAttribute('aria-label', square + (piece ? ` ${pieceNames[piece.type]} ${piece.color === 'w' ? 'أبيض' : 'أسود'}` : ''));
      button.disabled = stage === 3 || finished;
      paintSquare(button, (piece ? `<img class="piece" src="pieces/${piece.color + piece.type.toUpperCase()}.svg" alt="" draggable="false">` : '') +
        (column === 0 ? `<small class="rank">${rank}</small>` : '') +
        (rank === ranks.at(-1) ? `<small class="file">${file}</small>` : ''));
      button.onclick = () => chooseSquare(square);

    }
  }
}

function moveChoices() {
  if (stage === 0) return exercises[index].branches.map(item => item.moves[0]);
  if (stage === 1) return [branch.moves[1], branch.otherReply].filter(Boolean).sort();
  return [branch.moves[2]];
}

function render({focus = false, feedback = ''} = {}) {
  const exercise = exercises[index];
  const prompts = [
    exercise.prompt,
    'أنهي رد لازم تحسبه في الفرع ده؟ جرّبه على الرقعة أو اختاره من النقلات.',
    'نفّذ نقلة المتابعة واحسب إيه اللي اتغيّر.',
    'إيه نتيجة الخط بعد آخر نقلة؟'
  ];
  $('calcStage').textContent = stages[stage];
  $('calcPrompt').textContent = finished ? 'راجع النتيجة، أو ارجع وجرّب النقلة المرشحة التانية.' : prompts[stage];
  $('calcFeedback').textContent = feedback;
  $('calcReview').hidden = !finished;
  $('calcTheme').textContent = finished ? exercise.theme : '';
  $('calcOutcome').textContent = finished ? branch.outcome : '';
  $('calcRetry').hidden = stage === 0;
  $('calcNext').hidden = !finished || completed.size < 2;
  $('calcNext').textContent = index === exercises.length - 1 ? 'ارجع للموقف الأول' : 'الموقف التالي';
  $('calcChoices').replaceChildren();
  if (!finished && stage === 3) {
    const options = [branch.outcome, exercise.distractor];
    if ((index + exercise.branches.indexOf(branch)) % 2) options.reverse();
    for (const option of options) addChoice(option, () => {
      if (option !== branch.outcome) {
        $('calcFeedback').textContent = 'بصّ على الوضع الحالي تاني وقارن المادة والتهديدات.';
        return;
      }
      finished = true;
      completed.add(branch.moves[0]);
      render({focus:true, feedback:'تمام، ده تقييم الخط اللي حسبته.'});
    });
  } else if (!finished && stage < 2) {
    for (const san of moveChoices()) addChoice(san + (stage === 0 && completed.has(san) ? ' ✓' : ''), () => play(san), true);
  }
  drawBoard();
  if (focus) $('calcStage').focus({preventScroll:true});
}

function addChoice(label, action, notation = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'premium-btn';
  button.textContent = label;
  if (notation) button.dir = 'ltr';
  button.onclick = action;
  $('calcChoices').append(button);
}

function chooseSquare(square) {
  if (stage === 3 || finished) return;
  if (chess.get(square)?.color === chess.turn()) {
    selected = selected === square ? null : square;
    drawBoard();
    $('calcBoard').querySelector(`[data-square="${square}"]`).focus({preventScroll:true});
    return;
  }
  if (!selected) return;
  const move = chess.moves({square:selected, verbose:true}).find(item => item.to === square);
  if (!move) {
    $('calcFeedback').textContent = 'النقلة دي مش قانونية. جرّب مربع تاني.';
    return;
  }
  play(move.san);
}

function play(san) {
  if (!moveChoices().includes(san)) {
    $('calcFeedback').textContent = stage === 2 ? 'جرّب نقلة المتابعة اللي بتحقق هدف الفرع.' : 'النقلة قانونية. جرّب واحدة من النقلات المحددة للمقارنة.';
    return;
  }
  if (stage === 0) branch = exercises[index].branches.find(item => item.moves[0] === san);
  if (stage === 1 && san !== branch.moves[1]) {
    $('calcFeedback').textContent = 'رد قانوني، لكن افحص الرد التاني. إيه اللي ممكن يهدده أو يغيّره في خطتك؟';
    return;
  }
  chess.move(san);
  selected = null;
  stage = stage === 1 && branch.moves.length === 2 ? 3 : stage + 1;
  render({focus:true});
}

function resetAttempt() {
  chess = new Chess(root.fen());
  branch = null;
  stage = 0;
  selected = null;
  finished = false;
  render();
}

function openExercise(next) {
  index = next;
  completed = new Set();
  $('calcPicker').value = index;
  root = new Chess(exercises[index].fen);
  resetAttempt();
}

$('calcPicker').onchange = event => openExercise(Number(event.target.value));
$('calcRetry').onclick = () => {
  resetAttempt();
  $('calcStage').focus({preventScroll:true});
};
$('calcNext').onclick = () => {
  openExercise((index + 1) % exercises.length);
  $('calcStage').focus({preventScroll:true});
};

function route() {
  panel.hidden = location.hash !== '#calculation';
  if (panel.hidden) return;
  document.body.classList.add('training-view');
  document.body.dataset.section = 'calculation';
  $('homeDashboard').hidden = true;
  document.querySelector('.workspace').hidden = true;
  openExercise(index);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();

keepView('calculation', () => panel.hidden ? null : index, saved => { if(exercises[saved]) openExercise(saved); });
