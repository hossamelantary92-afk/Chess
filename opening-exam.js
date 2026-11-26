import {Chess} from './chess.js';
import {questions} from './opening-exam-data.js?v=3';

const $ = id => document.getElementById(id);
const files = 'abcdefgh';
const pieceNames = {p:'بيدق', n:'حصان', b:'فيل', r:'رخ', q:'وزير', k:'ملك'};
let round = [];
let index = 0;
let answers = [];
let chess;
let selected;
let lastMove;
let played;
let phase = 'move';

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startRound() {
  const sides = ['w','b'].flatMap(side => shuffle(questions.filter(q => q.side === side)).slice(0,5));
  round = shuffle(sides);
  answers = [];
  index = 0;
  $('examPlay').hidden = false;
  $('examResults').hidden = true;
  loadQuestion();
}

function loadQuestion() {
  const q = round[index];
  chess = new Chess();
  for (const san of q.line.split(' ')) lastMove = chess.move(san);
  selected = null;
  played = null;
  phase = 'move';
  $('examCount').textContent = `${index + 1} / ${round.length}`;
  $('examSide').textContent = q.side === 'w' ? 'دور الأبيض' : 'دور الأسود';
  $('examGoal').textContent = q.goal;
  $('examStep').textContent = 'نفّذ النقلة على الرقعة';
  $('examStatus').textContent = '';
  $('examReasons').replaceChildren();
  $('examFeedback').hidden = true;
  $('examNext').hidden = true;
  draw();
}

function draw() {
  const side = round[index].side;
  const columns = side === 'w' ? [...files] : [...files].reverse();
  const ranks = side === 'w' ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8];
  const board = $('examBoard');
  board.replaceChildren();
  $('examLast').textContent = `${played?'نقلتك':'آخر نقلة للخصم'} · ${lastMove.san}`;
  for (const rank of ranks) {
    for (const file of columns) {
      const square = file + rank, piece = chess.get(square), cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `square ${(files.indexOf(file) + rank) % 2 ? 'dark' : 'light'}`;
      if (square === lastMove.from || square === lastMove.to) cell.classList.add(played ? 'answer' : 'last');
      if (square === selected) cell.classList.add('exam-selected');
      cell.dataset.square = square;
      cell.setAttribute('aria-label', square + (piece ? ` ${pieceNames[piece.type]} ${piece.color === 'w' ? 'أبيض' : 'أسود'}` : ''));
      if (piece) {
        const img = document.createElement('img');
        img.src = `pieces/${piece.color + piece.type.toUpperCase()}.svg`;
        img.alt = '';
        img.draggable = false;
        cell.append(img);
      }
      if (file === columns[0] || rank === ranks.at(-1)) {
        const coordinate = document.createElement('small');
        coordinate.className = 'coord';
        coordinate.textContent = (file === columns[0] ? rank : '') + (rank === ranks.at(-1) ? file : '');
        cell.append(coordinate);
      }
      cell.onclick = () => chooseSquare(square);
      board.append(cell);
    }
  }
}

function chooseSquare(square) {
  if (phase !== 'move') return;
  if (chess.get(square)?.color === chess.turn()) {
    selected = selected === square ? null : square;
    draw();
    $('examBoard').querySelector(`[data-square="${square}"]`).focus({preventScroll:true});
    return;
  }
  if (!selected) return;
  const move = chess.moves({square:selected,verbose:true}).find(candidate => candidate.to === square);
  if (!move) {
    $('examStatus').textContent = 'النقلة دي غير قانونية. اختار مربع تاني للقطعة أو جرّب قطعة مختلفة.';
    return;
  }
  played = chess.move(move);
  lastMove = played;
  selected = null;
  phase = 'reason';
  draw();
  $('examStatus').textContent = `سجّلنا ${played.san}. اختار الفكرة اللي تحقق هدف السؤال.`;
  $('examStep').textContent = 'أنهي تفسير يناسب هدف الموقف؟';
  const q = round[index];
  for (const option of shuffle(q.reasons.map((text,id) => ({text,id})))) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-btn';
    button.textContent = option.text;
    button.onclick = () => chooseReason(option.id);
    $('examReasons').append(button);
  }
  $('examReasons').firstElementChild?.focus({preventScroll:true});
}

function chooseReason(choice) {
  if (phase !== 'reason') return;
  phase = 'review';
  const q = round[index];
  const result = {move:played.san, matches:q.moves.includes(played.san), reason:choice === q.correct};
  answers.push(result);
  for (const button of $('examReasons').children) button.disabled = true;
  $('examStatus').textContent = '';
  $('examFeedback').hidden = false;
  $('examName').textContent = q.name;
  $('examVerdict').textContent = result.matches ? 'النقلة حققت الهدف' : `نقلتك: ${result.move}. النقلات المستهدفة: ${q.moves.join(' / ')}.`;
  $('examIdea').textContent = `${result.reason?'فهمت الفكرة.':'راجع سبب اختيار النقلة.'} ${q.reasons[q.correct]}`;
  $('examExplanation').textContent = q.note;
  $('examLesson').href = `./#train/openings/${q.route}`;
  $('examNext').textContent = index === round.length - 1 ? 'اعرض نتيجة الجولة' : 'الموقف التالي';
  $('examNext').hidden = false;
}

function showResults() {
  $('examPlay').hidden = true;
  $('examResults').hidden = false;
  const matching = answers.filter(result => result.matches).length;
  const reasoning = answers.filter(result => result.reason).length;
  $('examScore').textContent = `${matching}/${round.length} نقلات تحقق الهدف · ${reasoning}/${round.length} أفكار صحيحة`;
  $('examReviewList').replaceChildren();
  round.forEach((q,i) => {
    const result = answers[i];
    const row = document.createElement('div');
    row.className = 'library-item';
    const title = document.createElement('h3');
    title.lang = 'en'; title.textContent = q.name;
    const summary = document.createElement('p');
    summary.textContent = `نقلتك ${result.move} · ${result.matches?'حققت الهدف':'راجع النقلة'} · ${result.reason?'الفكرة صحيحة':'راجع الفكرة'}`;
    const link = document.createElement('a');
    link.className = 'secondary link-button';
    link.href = `./#train/openings/${q.route}`;
    link.textContent = 'راجع الدرس';
    row.append(title,summary,link);
    $('examReviewList').append(row);
  });
  $('examRestart').focus({preventScroll:true});
  $('examResults').scrollIntoView({block:'start'});
}

$('examNext').onclick = () => {
  if (phase !== 'review') return;
  if (++index === round.length) showResults();
  else loadQuestion();
};
$('examRestart').onclick = startRound;
function route() {
  if (location.hash === '#exam' && !round.length) startRound();
}
window.addEventListener('hashchange',route);
route();

import {keepView} from './refresh.js';
keepView('openingExam', () => location.hash !== '#exam' ? null : {
  round:round.map(q=>questions.indexOf(q)), index, answers, played:played && [played.from,played.to], phase
}, saved => {
  if (!saved.round?.length || !saved.round.every(i=>questions[i])) return;
  round=saved.round.map(i=>questions[i]); index=saved.index;
  answers=saved.answers.slice(0,index);
  if (index===round.length) return showResults();
  loadQuestion();
  if (saved.played) {
    selected=saved.played[0];
    chooseSquare(saved.played[1]);
    if (saved.phase==='review') chooseReason(saved.answers[index].reason ? round[index].correct : -1);
  }
});
