import {keepView} from './refresh.js';
import {Chess} from './chess.js';
import {modelGames} from './model-games-data.js';

const $ = id => document.getElementById(id);
const files = 'abcdefgh';
const pieces = {p:'بيدق', n:'حصان', b:'فيل', r:'رخ', q:'وزير', k:'ملك'};
let active;
let line = [];
let stopIndex = 0;
let ply = 0;
let chess;
let flipped = false;
let selected = null;
let example = false;
let attempts = new Map();

const panel = document.createElement('section');
panel.id = 'modelGamesPanel';
panel.hidden = true;
panel.innerHTML = `
  <nav class="training-links mid-nav" aria-label="التنقل في دراسة المباريات">
    <a href="#model-games" id="modelListLink" hidden>كل المباريات</a>
  </nav>
  <div id="modelList">
    <div class="lesson-head"><h2 lang="en">Model Games</h2></div>
    <p>٣ قرارات في كل مباراة. اختار نقلتك قبل ما تشوف اللي اتلعب، وبعدها كمّل متابعة المباراة لآخر نقلة مسجّلة.</p>
    <div id="modelCards" class="guide-cards"></div>
  </div>
  <div id="modelStudy" hidden>
    <div class="lesson-head"><h2 id="modelTitle" lang="en"></h2></div>
    <p id="modelEvent" class="mid-level" lang="en"></p>
    <div class="training-links mid-nav" id="modelStops" aria-label="محطات المباراة"></div>
    <div class="safety-layout">
      <div class="board-area">
        <div class="board-top"><span id="modelTurn"></span><span id="modelLast"></span></div>
        <div class="frame"><div id="modelBoard" aria-label="رقعة المباراة النموذجية"></div></div>
        <div class="model-playback training-links" aria-label="عرض نقلات المباراة">
          <button class="premium-btn" id="modelFirst" type="button">البداية</button>
          <button class="premium-btn" id="modelPrev" type="button">السابق</button>
          <button class="premium-btn" id="modelNext" type="button">التالي</button>
          <button class="premium-btn" id="modelFlip" type="button">قلب الرقعة</button>
        </div>
        <p id="modelNotation" dir="ltr"></p>
      </div>
      <div class="coach">
        <h3 id="modelStopTitle" lang="en" dir="ltr"></h3>
        <p id="modelPrompt"></p>
        <p id="modelHint" class="mid-level"></p>
        <p id="modelStatus" role="status" aria-live="polite"></p>
        <div id="modelAnswer" class="unit-card" hidden>
          <p id="modelPlayed"></p>
          <p id="modelExplanation"></p>
          <p id="modelComparison" hidden></p>
        </div>
        <div class="training-links mid-nav">
          <button class="premium-btn" id="modelReveal" type="button">اعرض نقلة المباراة</button>
          <button class="premium-btn" id="modelExample" type="button" hidden>اعرض فرع الحساب</button>
          <button class="premium-btn primary" id="modelAdvance" type="button" hidden>المحطة التالية</button>
        </div>
        <p id="modelConclusion" hidden></p>
        <div class="training-links mid-nav">
          <a id="modelLesson">راجع الافتتاح</a>
          <a id="modelSource" target="_blank" rel="noopener">سجلّ المباراة</a>
        </div>
      </div>
    </div>
  </div>`;
document.querySelector('main footer').before(panel);

for (const game of modelGames) {
  const card = document.createElement('article');
  card.className = 'unit-card guide-card';
  card.innerHTML = `<h3 lang="en" dir="ltr">${game.opening}</h3><p lang="en" dir="ltr">${game.title} · ${game.event}</p><p>${game.focus}</p>
    <a href="#model-games/${game.id}">ادرس المباراة</a>`;
  $('modelCards').append(card);
}

function currentStop() {
  return active.stops[stopIndex];
}

function drawBoard() {
  const board = $('modelBoard');
  const columns = flipped ? [...files].reverse() : [...files];
  const ranks = flipped ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1];
  const history = chess.history({verbose:true});
  const last = history.at(-1);
  $('modelLast').textContent = last ? `آخر نقلة · ${last.san}` : 'الوضع الأول';
  $('modelTurn').textContent = chess.turn()==='w' ? 'دور الأبيض' : 'دور الأسود';
  $('modelNotation').textContent = example ? `فرع تعليمي · ${currentStop().example.join(' ')}` :
    `${ply}/${line.length} · ${history.slice(-7).map(move=>move.san).join(' ')}`;
  board.replaceChildren();
  for (const [rowIndex, rank] of ranks.entries()) {
    for (const [columnIndex, file] of columns.entries()) {
      const square = file + rank, piece = chess.get(square), cell = document.createElement('button');
      cell.type = 'button';
      cell.dataset.square = square;
      cell.className = (files.indexOf(file) + rank) % 2 ? 'dark' : '';
      if (last?.from===square || last?.to===square) cell.classList.add('safe-last');
      if (selected===square) cell.classList.add('selected');
      cell.setAttribute('aria-label', square+(piece?` ${pieces[piece.type]} ${piece.color==='w'?'أبيض':'أسود'}`:''));
      cell.innerHTML = (piece?`<img class="piece" src="pieces/${piece.color+piece.type.toUpperCase()}.svg" alt="" draggable="false">`:'') +
        (columnIndex===0?`<small class="rank">${rank}</small>`:'') + (rowIndex===7?`<small class="file">${file}</small>`:'');
      cell.onclick = () => chooseSquare(square);
      board.append(cell);
    }
  }
}

function render() {
  chess = new Chess();
  for (const san of line.slice(0,ply)) chess.move(san);
  const stop = currentStop();
  if (example) for (const san of stop.example) chess.move(san);
  drawBoard();
  const attempt = attempts.get(stop.ply);
  const atDecision = ply===stop.ply && !attempt;
  const answered = ply>stop.ply && Boolean(attempt);
  const nextStop = active.stops[stopIndex+1];
  $('modelPrompt').textContent = stop.prompt;
  $('modelStopTitle').textContent = stop.title;
  $('modelHint').textContent = atDecision?'جرّب النقلة بنفسك على الرقعة.':ply<stop.ply?'تابع النقلات لحد ما توصل لوضع القرار.':'تابع اللعب وشوف إزاي الوضع اتغيّر.';
  $('modelStatus').textContent = '';
  $('modelAnswer').hidden = !answered;
  $('modelReveal').hidden = !atDecision;
  $('modelPrev').disabled = ply===0 || example;
  $('modelNext').disabled = atDecision || ply===line.length || example;
  $('modelExample').hidden = !answered || !stop.example;
  $('modelExample').textContent = example?'ارجع للمباراة':'اعرض فرع الحساب';
  $('modelAdvance').hidden = !answered || (!nextStop && ply===line.length);
  $('modelAdvance').textContent = nextStop?'المحطة التالية':'شوف نهاية المباراة';
  $('modelConclusion').hidden = ply!==line.length || example;
  $('modelConclusion').textContent = `النتيجة ${active.result} · ${active.finish}`;
  if (answered) {
    const san = line[stop.ply];
    $('modelPlayed').textContent = attempt.move ? `نقلتك: ${attempt.move} · نقلة المباراة: ${san}` : `نقلة المباراة: ${san}`;
    $('modelExplanation').textContent = stop.note;
    const compare = attempt.move && attempt.move !== san;
    $('modelComparison').hidden = !compare;
    $('modelComparison').textContent = compare ? stop.alternatives[attempt.move] ?? 'نقلة قانونية. قارن فكرتها بالهدف اللي حققته نقلة المباراة.' : '';
  }
  [...$('modelStops').children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===stopIndex)));
}

function positionAt(next) {
  ply = next;
  selected = null;
  example = false;
  render();
}

function chooseSquare(square) {
  const stop = currentStop();
  if (ply!==stop.ply || attempts.has(stop.ply) || example) return;
  if (chess.get(square)?.color===chess.turn()) {
    selected = selected===square ? null : square;
    drawBoard();
    $('modelBoard').querySelector(`[data-square="${square}"]`).focus({preventScroll:true});
    return;
  }
  if (!selected) return;
  const move = chess.moves({square:selected,verbose:true}).find(candidate=>candidate.to===square);
  if (!move) {
    $('modelStatus').textContent = 'النقلة مش قانونية في الوضع الحالي. اختار مربع تاني.';
    return;
  }
  reveal(move.san);
}

function reveal(move = '') {
  const stop = currentStop();
  if (ply!==stop.ply || attempts.has(stop.ply)) return;
  attempts.set(stop.ply,{move});
  positionAt(stop.ply+1);
}

function navigate(next) {
  if (next>line.length || next<0 || example) return;
  if (next>ply && ply===currentStop().ply && !attempts.has(currentStop().ply)) return;
  const matching = active.stops.findIndex(stop=>stop.ply===next);
  if (matching!==-1) stopIndex = matching;
  positionAt(next);
}

function selectStop(index) {
  stopIndex = index;
  const stop = currentStop();
  flipped = stop.ply%2===1;
  positionAt(stop.ply + (attempts.has(stop.ply)?1:0));
}

function load(game) {
  active = game;
  line = game.line.split(' ');
  attempts = new Map();
  flipped = false;
  $('modelTitle').textContent = game.title;
  $('modelEvent').textContent = `${game.opening} · ${game.event}`;
  $('modelLesson').href = game.lesson;
  $('modelSource').href = game.source;
  $('modelStops').replaceChildren();
  game.stops.forEach((stop,index)=>{
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'premium-btn';
    button.textContent = ['الافتتاح','منتصف اللعب','الحسم'][index];
    button.onclick = ()=>selectStop(index);
    $('modelStops').append(button);
  });
  selectStop(0);
}

$('modelReveal').onclick = () => reveal();
$('modelPrev').onclick = () => navigate(ply-1);
$('modelNext').onclick = () => navigate(ply+1);
$('modelFirst').onclick = () => { stopIndex=0; positionAt(0); };
$('modelFlip').onclick = () => { flipped=!flipped;drawBoard(); };
$('modelExample').onclick = () => {
  ply = currentStop().ply+1;
  example = !example;
  render();
};
$('modelAdvance').onclick = () => {
  if (active.stops[stopIndex+1]) selectStop(stopIndex+1);
  else positionAt(line.length);
};

function route() {
  const match = location.hash.match(/^#model-games(?:\/([a-z]+))?$/);
  panel.hidden = !match;
  if (!match) return;
  const game = modelGames.find(item=>item.id===match[1]);
  document.body.classList.add('training-view');
  document.body.dataset.section = 'model-games';
  $('homeDashboard').hidden = true;
  document.querySelector('.workspace').hidden = true;
  $('modelList').hidden = Boolean(game);
  $('modelListLink').hidden = !game;
  $('modelStudy').hidden = !game;
  if (game) load(game);
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
route();

keepView('model', () => panel.hidden || $('modelStudy').hidden || !active ? null : {stopIndex, ply, flipped}, saved => {
  if (!saved || !Number.isInteger(saved.stopIndex) || !Number.isInteger(saved.ply) || saved.ply<0 || !active?.stops[saved.stopIndex] || saved.ply>line.length) return;
  stopIndex=saved.stopIndex; flipped=saved.flipped; positionAt(saved.ply);
});
