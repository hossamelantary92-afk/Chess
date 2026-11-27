import {moveSound,playSound} from './rook-sound.js?v=323';
import {squareAt, paintSquare} from './board-cells.js';
import {Chess} from './chess.js';
import {lessons} from './middlegame-data.js?v=277';
import {positions, priorities, reviews} from './position-evaluation.js?v=199';

import {activityLessons} from './piece-activity-data.js';
import {openingChoices, trapLessons} from './opening-traps-data.js';

import {rapidLessons} from './practical-decisions-data.js';

const $ = id => document.getElementById(id);
const files = 'abcdefgh';
const pieceNames = {p:'بيدق', n:'حصان', b:'فيل', r:'رخ', q:'وزير', k:'ملك'};
const moveKey = 'rook-middlegame-solved';
const planKey = 'rook-middlegame-followups';
const evaluationKey = 'rook-position-evaluation';
const activityKey = 'rook-piece-activity';
const trapKey = 'rook-opening-traps';
const rapidKey = 'rook-practical-decisions';

function loadProgress(key, items = lessons) {
  try {
    const ids = JSON.parse(localStorage.getItem(key));
    return new Set(Array.isArray(ids) ? ids.filter(id => items.some(item => item.id === id)) : []);
  } catch {
    return new Set();
  }
}

const solved = loadProgress(moveKey);
const followedUp = loadProgress(planKey);
const evaluated = loadProgress(evaluationKey, positions);
const activityCompleted = loadProgress(activityKey, activityLessons);
const trapCompleted = loadProgress(trapKey, trapLessons);
const rapidCompleted = loadProgress(rapidKey, rapidLessons);

function saveProgress(progress, key) {
  progress.add(lesson.id);
  try { localStorage.setItem(key, JSON.stringify([...progress])); } catch {}
}

let lesson = lessons[0];
let chess;
let side;
let selected = null;
let lastMove;
let phase = 'plan';
let followup = null;
let section = 'middlegame';
let evaluation = false;
let activity = false;
let traps = false;
let rapid = false;
let trapPly = 0;
let initialPosition;
let playedMove;
let reviewLine = null;
let reviewPly = 0;

function currentItems() {
  return evaluation ? positions : activity ? activityLessons : traps ? trapLessons : rapid ? rapidLessons : lessons;
}

const panel = document.createElement('section');
panel.id = 'middlegamePanel';
panel.hidden = true;
panel.innerHTML = `
  <div class="focus-heading"><a class="premium-btn" href="#home">الرئيسية</a></div>
  <div class="lesson-head"><h2 id="midHeading" lang="en">Middlegame</h2><span class="level" id="midProgress"></span></div>
  <p id="midIntro"></p><details id="midFoundations" class="unit-card"><summary>مبادئ اتخاذ القرار وأمان القطع</summary><article><h3>فحص ما قبل النقلة</h3><ul><li>ابدأ بتهديد الخصم: هل هناك كش أو قطعة يمكن أخذها؟</li><li>بعد اختيار نقلتك، تخيّل الوضع الناتج وافحص مربعات هجوم الخصم.</li><li>فحص الأمان مهم حتى لو رأيت كشًا أو قطعة مجانية؛ قد تترك ماتًا على ملكك.</li></ul><p dir="ltr">Re3</p><p>مثال أصلي: بيدق d5 يهاجم الرخ e4. Re3 أحد مخارج الرخ الآمنة.</p><details><summary>رأيت فرصة لأخذ بيدق. ما الفحص الأخير؟</summary><p>أتأكد من أمان الملك والقطعة بعد الأخذ — ربح بيدق لا يفيد إذا كانت النقلة تترك الملك في خطر أو تخسر قطعة.</p></details></article><article><h3>القطعة المحمية وغير المحمية</h3><ul><li>المحمية لها قطعة صديقة تستطيع الرد بالأخذ، بشرط أن يكون الرد قانونيًا.</li><li>وجود مدافع لا يعني دائمًا أن الأخذ سيئ؛ احسب قيمة التبادل والتهديدات.</li><li>الملك لا يحمي قطعة إذا كان أخذه سيضعه في كش.</li></ul><p dir="ltr">Rxd4</p><p>مثال أصلي: الرخ الأسود غير محمي؛ Rxd4 يأخذه بأمان.</p><details><summary>هل كل قطعة تبدو محمية آمنة دائمًا؟</summary><p>لا، يجب حساب الأخذ والرد القانوني — العدد والقيمة والتثبيت وقانونية رد المدافع كلها تؤثر في الأمان.</p></details></article><article><h3>حسّن أسوأ قطعة</h3><ul><li>إذا لم يوجد تكتيك عاجل، ابحث عن القطعة الأقل تأثيرًا.</li><li>قارن لها مربعًا أفضل وخط سير آمنًا، ولا تحرّكها لمجرد الحركة.</li><li>الخطة الجيدة تربط القطع بهدف: ضغط على بيدق، عمود، أو مربع مهم.</li></ul><p dir="ltr">d4 d5 Nf3 Nf6 Bf4 e6 e3 Bd6</p><p>مثال أصلي: بعد تطوير القطع اسأل عن خطة ومربع مناسب بدل نقل الوزير بلا هدف.</p><details><summary>لا يوجد تهديد مباشر. ما سؤال عملي لبناء خطة؟</summary><p>كيف أحسن أقل قطعة نشاطًا؟ — تحسين القطع خطوة عملية عندما لا توجد نقلة إجبارية أهم.</p></details></article><article><h3>التبديل عند التفوق</h3><ul><li>التبديل قد يقلل فرص هجوم الخصم، لكنه ليس جيدًا دائمًا لمجرد أنك متقدم.</li><li>قبل التبديل افحص النهاية الناتجة ونشاط الملك وبنية البيادق.</li><li>لا تحوّل فوزًا واضحًا إلى نهاية متعادلة أو خنق بسبب قاعدة محفوظة.</li></ul><p dir="ltr">Qg7#</p><p>مثال أصلي: حين يوجد مات مباشر، لا نبحث عن مكسب مادي أقل.</p><details><summary>أنت متقدم ماديًا. هل كل تبديل مفيد؟</summary><p>لا؛ قيّم النهاية الناتجة أولًا — فائدة التبديل تتحدد بالوضع الناتج وإمكانية تحويل الأفضلية.</p></details></article></details>
  <details id="midChecklist" class="unit-card mid-checklist" hidden>
    <summary lang="en">Evaluation Checklist</summary>
    <ul>
      <li><strong>التهديدات.</strong> آخر نقلة هاجمت إيه أو فتحت أنهي خط؟ افحص الكشّات والأخذ للطرفين.</li>
      <li><strong>الوضع.</strong> قارن المادة، أمان الملكين، نشاط القطع، وشكل البيادق. إيه العامل اللي يغيّر قرارك هنا؟</li>
      <li><strong>الحساب.</strong> قارن نقلتين مرشحتين. احسب أقوى رد عملي للخصم، وقيّم الرقعة بعد التبادل قبل تنفيذ القرار.</li>
    </ul>
  </details>
  <details id="openingChoices" class="unit-card mid-checklist" hidden>
    <summary lang="en">Opening Choices</summary>
    <div id="openingChoiceList"></div>
  </details>
  <label class="mid-picker"><span id="midPickerLabel">الدرس</span> <select id="midLesson"></select></label>
  <div class="safety-layout">
    <div class="board-area">
      <div class="board-top"><span id="midTurn"></span><span id="midLast"></span></div>
      <div class="frame"><div id="middleBoard" aria-label="رقعة تدريب منتصف اللعب"></div></div>
    </div>
    <div class="coach">
      <h3 id="midTitle" lang="en" dir="ltr"></h3>
      <p class="mid-level" id="midLevel" lang="en" hidden></p>
      <p id="midContext"></p>
      <p id="midStep"></p>
      <div id="midPlans" role="group" aria-label="اختيار الخطة"></div>
      <div id="midFeedback" role="status"></div>
      <div class="safety-actions">
        <button class="premium-btn" id="midHint" hidden>تلميح</button>
        <button class="premium-btn" id="midExample" hidden>شوف نقلة نموذجية</button>
        <button class="primary premium-btn" id="midOpponent" hidden>شوف رد الخصم</button>
        <button class="premium-btn" id="midTrap" hidden>شوف خط الوقوع في الفخ</button>
        <button class="premium-btn" id="midRetry">أعد الموقف</button>
        <button class="primary premium-btn" id="midNext">الموقف التالي</button>
      </div>
      <section id="midReview" class="unit-card mid-review" aria-labelledby="midReviewTitle" hidden>
        <h4 id="midReviewTitle" lang="en">Review the Position</h4>
        <p id="midReviewTheme" class="mid-level" lang="en"></p>
        <p id="midTakeaway"></p>
        <div id="midReviewLines" class="training-links" role="group" aria-label="فروع للتحليل"></div>
        <div id="midReviewControls" hidden>
          <p id="midReviewMoves" dir="ltr" aria-live="polite"></p>
          <p id="midReviewNote"></p>
          <div class="training-links">
            <button class="premium-btn" id="midReviewPrev">النقلة السابقة</button>
            <button class="premium-btn" id="midReviewNext">النقلة التالية</button>
            <button class="premium-btn" id="midReviewReset">ارجع لإجابتك</button>
          </div>
        </div>
        <a id="midReviewSource" target="_blank" rel="noopener" hidden></a>
      </section>
    </div>
  </div>`;
document.querySelector('main footer').before(panel);
for (const [title, choices] of openingChoices) {
  const group = document.createElement('section');
  group.innerHTML = `<h3 lang="en" dir="ltr">${title}</h3><ul>${choices.map(([name, description, href]) =>
    `<li><a href="${href}" lang="en" dir="ltr">${name}</a> · ${description}</li>`).join('')}</ul>`;
  $('openingChoiceList').append(group);
}

for (const [route, title, count, description] of [
  ['middlegame', 'Middlegame', `${lessons.length} دروس`, 'اختار خطة ونفّذها على الرقعة'],
  ['opening-traps', 'Opening Choices & Traps', `${trapLessons.length} مواقف`, 'قارن ردود الافتتاح وتدرّب على تفادي الفخاخ'],
  ['practical-decisions', 'Practical Decisions', `${rapidLessons.length} مواقف`, 'دافع تحت الضغط وقرّر إمتى تستخدم وقتك'],
  ['piece-activity', 'Piece Activity', `${activityLessons.length} دروس`, 'نشّط قطعك وخلّيها تشتغل مع بعض'],
  ['position-evaluation', 'Position Evaluation', `${positions.length} موقفًا`, 'دفاع، تكتيك، ولا خطة؟']
]) {
  const card = document.createElement('button');
  card.className = 'home-card';
  card.dataset.learningCard = route;
  card.innerHTML = `<div class="home-card-top"><b>♜</b><span>${count}</span></div><h3 lang="en">${title}</h3><small>${description}</small>`;
  card.onclick = () => { location.hash = route; };
  $('homeCards').append(card);
}

function updateProgress() {
  $('midProgress').textContent = evaluation ? `${evaluated.size}/${positions.length} مواقف اتحلّت` : activity ? `${activityCompleted.size}/${activityLessons.length} نقلات متابعة اتحلّت` : traps ? `${trapCompleted.size}/${trapLessons.length} مواقف اتحلّت` : rapid ? `${rapidCompleted.size}/${rapidLessons.length} مواقف اتحلّت` : `${solved.size}/${lessons.length} نقلات أولى · ${followedUp.size}/${lessons.length} نقلات متابعة`;
}

function load(item) {
  lesson = item;
  lastMove = null;
  playedMove = null;
  chess = new Chess(item.fen);
  for (const san of item.line.trim().split(/\s+/).filter(Boolean)) lastMove = chess.move(san);
  side = chess.turn();
  initialPosition = {fen:chess.fen(), lastMove};
  reviewLine = null;
  $('midReview').hidden = true;
  selected = null;
  phase = 'plan';
  trapPly = 0;
  $('midTrap').hidden = !traps;
  $('midTrap').textContent = 'شوف خط الوقوع في الفخ';
  followup = null;
  $('midOpponent').hidden = true;
  $('midLesson').value = item.id;
  $('midTitle').textContent = item.title;
  $('midLevel').hidden = !evaluation && section !== 'middlegame';
  $('midLevel').textContent = section === 'middlegame' ? `${item.category} · ${item.level}` : item.level ?? '';
  $('midContext').hidden = evaluation;
  $('midContext').textContent = item.context ?? '';
  $('midStep').textContent = evaluation ? 'إيه الأولوية في الوضع ده؟' : 'اختار الخطة الأنسب للموقف';
  $('midFeedback').textContent = '';
  $('midHint').hidden = true;
  $('midExample').hidden = true;
  $('midPlans').replaceChildren();
  const choices = evaluation ? priorities : item.plans;
  choices.forEach((plan, index) => {
    const button = document.createElement('button');
    button.className = 'premium-btn';
    button.textContent = plan;
    button.onclick = () => choosePlan(index);
    $('midPlans').append(button);
  });
  draw();
  updateProgress();
}

function choosePlan(index) {
  if (index !== lesson.correct) {
    $('midFeedback').textContent = evaluation
      ? 'راجع آخر نقلة. هل فيه تهديد عاجل، أو فرصة لمكسب مباشر، أو وقت لتحسين وضعك؟'
      : 'راجع آخر نقلة ووضع قطعك. أنهي خطة بتعالج المشكلة اللي على الرقعة؟';
    return;
  }
  phase = 'move';
  for (const [i, button] of [...$('midPlans').children].entries()) {
    button.disabled = true;
    button.setAttribute('aria-pressed', String(i === index));
  }
  $('midStep').textContent = evaluation ? lesson.task : 'نفّذ نقلة تخدم الخطة على الرقعة';
  $('midFeedback').textContent = evaluation ? lesson.reason : 'اختيار مناسب. اضغط القطعة اللي عايز تحرّكها وبعدها مربع الوصول.';
  $('midHint').hidden = false;
  $('midExample').hidden = false;
}

function draw() {
  const board = $('middleBoard');
  const columns = side === 'b' ? [...files].reverse() : [...files];
  const rows = side === 'b' ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1];
  const targets = new Set(selected ? chess.moves({square:selected, verbose:true}).map(move => move.to) : []);
  $('midTurn').textContent = phase === 'done' ? 'النقلة على الرقعة' : chess.turn() === 'w' ? 'دور الأبيض' : 'دور الأسود';
  $('midLast').textContent = `آخر نقلة · ${lastMove.san}`;
  let cellIndex = 0;
  for (const [rowIndex, rank] of rows.entries()) {
    for (const [columnIndex, file] of columns.entries()) {
      const square = file + rank;
      const piece = chess.get(square);
      const button = squareAt(board, cellIndex++);
      button.type = 'button';
      button.className = (files.indexOf(file) + rank) % 2 ? 'dark' : '';
      if (square === selected) button.classList.add('selected');
      if (targets.has(square)) button.classList.add('legal');
      if (square === lastMove.from || square === lastMove.to) button.classList.add('safe-last');
      button.setAttribute('aria-label', square + (piece ? ` ${pieceNames[piece.type]} ${piece.color === 'w' ? 'أبيض' : 'أسود'}` : ''));
      paintSquare(button, (piece ? `<img class="piece" src="pieces/${piece.color + piece.type.toUpperCase()}.svg" alt="" draggable="false">` : '') +
        (columnIndex === 0 ? `<small class="rank">${rank}</small>` : '') +
        (rowIndex === 7 ? `<small class="file">${file}</small>` : ''));
      button.onclick = () => play(square);

    }
  }
}

function play(square) {
  if (phase === 'plan') {
    $('midFeedback').textContent = 'اختار القرار الأول، وبعدها جرّب نقلة على الرقعة.';
    return;
  }
  if (phase !== 'move' && phase !== 'followup') return;
  if (chess.get(square)?.color === chess.turn()) {
    selected = selected === square ? null : square;
    draw();
    return;
  }
  if (!selected) return;
  const move = chess.moves({square:selected, verbose:true}).find(candidate => candidate.to === square);
  if (!move) {
    $('midFeedback').textContent = 'النقلة دي غير قانونية في الوضع الحالي. راجع حركة القطعة وأمان الملك.';
    return;
  }
  if (!Object.hasOwn(currentReplies(), move.san)) {
    $('midFeedback').textContent = `${move.san} نقلة قانونية. جرّب نقلة تنفّذ هدف الدرس بشكل أوضح، أو افتح التلميح.`;
    return;
  }
  finish(move.san, true);
}

function currentReplies() {
  return phase === 'followup' ? followup.moves : lesson.replies;
}

function finish(san, completed) {
  const first = phase === 'move';
  const explanation = currentReplies()[san];
  lastMove = chess.move(san);moveSound(lastMove);
  selected = null;
  if (evaluation) {
    phase = 'done';
    $('midStep').textContent = completed ? 'قرار مناسب للموقف' : 'نقلة نموذجية';
    if (completed) saveProgress(evaluated, evaluationKey);
    playedMove = san;
    showReview();
  } else if (first) {
    followup = lesson.followups[san];
    phase = 'reply';
    $('midOpponent').hidden = false;
    $('midStep').textContent = 'خد لحظة تتوقع رد الخصم';
    if (completed && !activity && !traps && !rapid) saveProgress(solved, moveKey);
  } else {
    phase = 'done';
    $('midStep').textContent = completed ? 'نقلة متابعة بتخدم الخطة' : 'نقلة متابعة نموذجية';
    if (completed) {
      if (activity) saveProgress(activityCompleted, activityKey);
      else if (traps) saveProgress(trapCompleted, trapKey);
      else if (rapid) saveProgress(rapidCompleted, rapidKey);
      else saveProgress(followedUp, planKey);
    }
  }
  $('midFeedback').textContent = `${san} · ${explanation}`;
  $('midHint').hidden = true;
  $('midExample').hidden = true;
  draw();
  updateProgress();
}

function showReview() {
  const review = reviews[lesson.id];
  $('midReview').hidden = false;
  $('midReviewTheme').textContent = review.theme;
  $('midTakeaway').textContent = review.takeaway;
  $('midReviewControls').hidden = true;
  $('midReviewLines').replaceChildren();
  for (const [label, line, note] of review.lines) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'premium-btn';
    button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.onclick = () => {
      for (const other of $('midReviewLines').children) other.setAttribute('aria-pressed', String(other === button));
      reviewLine = line.split(' ');
      reviewPly = 1;
      $('midReviewNote').textContent = note;
      $('midReviewControls').hidden = false;
      drawReview();
    };
    $('midReviewLines').append(button);
  }
  $('midReviewSource').hidden = !lesson.source;
  if (lesson.source) {
    $('midReviewSource').href = lesson.source.href;
    $('midReviewSource').textContent = lesson.source.label;
  }
}

function drawReview() {
  chess = new Chess(initialPosition.fen);
  lastMove = initialPosition.lastMove;
  for (const san of reviewLine.slice(0, reviewPly)) lastMove = chess.move(san);
  $('midReviewMoves').textContent = `${reviewPly}/${reviewLine.length} · ${reviewLine.slice(0, reviewPly).join(' ')}`;
  $('midReviewPrev').disabled = reviewPly === 0;
  $('midReviewNext').disabled = reviewPly === reviewLine.length;
  draw();
}

$('midReviewPrev').onclick = () => { if(reviewLine && reviewPly>0){reviewPly--; drawReview();} };
$('midReviewNext').onclick = () => { if(reviewLine && reviewPly<reviewLine.length){reviewPly++; drawReview();} };
$('midReviewReset').onclick = () => {
  chess = new Chess(initialPosition.fen);
  lastMove = chess.move(playedMove);
  reviewLine = null;
  $('midReviewControls').hidden = true;
  for (const button of $('midReviewLines').children) button.setAttribute('aria-pressed', 'false');
  draw();
};

$('midOpponent').onclick = () => {
  if (phase !== 'reply' || !followup) return;
  lastMove = chess.move(followup.opponent);moveSound(lastMove);
  phase = 'followup';
  $('midOpponent').hidden = true;
  $('midStep').textContent = followup.question;
  $('midFeedback').textContent = 'راجع آخر نقلة للخصم ونفّذ قرارك على الرقعة.';
  $('midHint').hidden = false;
  $('midExample').hidden = false;
  draw();
};

$('midTrap').onclick = () => {
  const moves = lesson.trap.split(' ');
  if (trapPly === moves.length) {
    load(lesson);
    return;
  }
  if (trapPly === 0) {
    chess = new Chess(initialPosition.fen);
    selected = null;
    phase = 'trap';
    $('midPlans').replaceChildren();
    $('midOpponent').hidden = true;
    $('midHint').hidden = true;
    $('midExample').hidden = true;
  }
  lastMove = chess.move(moves[trapPly++]);moveSound(lastMove);
  const finished = trapPly === moves.length;
  $('midStep').textContent = `خط الفخ · ${trapPly}/${moves.length}`;
  $('midFeedback').textContent = finished ? lesson.consequence : 'بصّ على الرقعة وتوقّع النقلة اللي جاية.';
  $('midTrap').textContent = finished ? 'ارجع للتدريب' : 'كمّل خط الفخ';
  draw();
};

$('midLesson').onchange = event => { location.hash = `${section}/${event.target.value}`; };
$('midRetry').onclick = () => load(lesson);
$('midNext').onclick = () => {
  const items = currentItems();
  const index = (items.indexOf(lesson) + 1) % items.length;
  location.hash = `${section}/${items[index].id}`;
};
$('midHint').onclick = () => { $('midFeedback').textContent = phase === 'followup' ? followup.hint : lesson.hint; };
$('midExample').onclick = () => { if (phase === 'move' || phase === 'followup') finish(Object.keys(currentReplies())[0], false); };

function route() {
  const match = location.hash.match(/^#(middlegame|position-evaluation|piece-activity|opening-traps|practical-decisions)(?:\/([a-z0-9-]+))?$/);
  panel.hidden = !match;
  if (!match) return;
  document.body.classList.add('training-view');
  document.body.dataset.section = 'middlegame';
  $('homeDashboard').hidden = true;
  document.querySelector('.workspace').hidden = true;
  section = match[1];
  evaluation = section === 'position-evaluation';
  activity = section === 'piece-activity';
  traps = section === 'opening-traps';
  rapid = section === 'practical-decisions';
  $('openingChoices').hidden = !traps;
  $('openingChoices').open = false;
  const items = currentItems();
  $('midHeading').textContent = evaluation ? 'Position Evaluation' : activity ? 'Piece Activity' : traps ? 'Opening Choices & Traps' : rapid ? 'Practical Decisions' : 'Middlegame';
  $('midIntro').textContent = evaluation
    ? 'شوف آخر نقلة للخصم، قيّم الوضع، وبعدها اختار الأولوية ونفّذ قرارك على الرقعة.'
    : activity ? 'حدّد القطعة اللي محتاجة دور. اختار خطتها، نفّذها، وبعد رد الخصم كمّل التنسيق على الرقعة.'
    : traps ? 'اختار ردّ يتعامل مع تهديد الخصم، وبعدها شوف خط الوقوع في الفخ نقلة بنقلة.'
    : rapid ? 'تدرّب على قرارات الـRapid: الدفاع تحت الضغط، الحفاظ على التفوّق، وتوزيع وقت التفكير.'
    : 'اقرأ الوضع، اختار خطة ونفّذ أول نقلة، وبعد رد الخصم قرّر تعمل إيه بعدها.';
  $('midChecklist').hidden = !evaluation;
  $('midFoundations').hidden = section !== 'middlegame';
  $('midPickerLabel').textContent = evaluation ? 'الموقف' : 'الدرس';
  $('midPlans').setAttribute('aria-label', evaluation ? 'اختيار الأولوية' : 'اختيار الخطة');
  const picker = $('midLesson');
  picker.replaceChildren();
  if (evaluation) {
    for (const level of ['Foundation', 'Intermediate', 'Advanced']) {
      const group = document.createElement('optgroup');
      group.label = level;
      group.append(...items.filter(item => item.level === level).map(item => new Option(item.title, item.id)));
      picker.append(group);
    }
  } else if (section === 'middlegame') {
    for (const category of new Set(items.map(item => item.category))) {
      const group = document.createElement('optgroup');
      group.label = category;
      group.append(...items.filter(item => item.category === category).map(item => new Option(`${followedUp.has(item.id) ? '✓ ' : ''}${item.title}`, item.id)));
      picker.append(group);
    }
  } else {
    picker.append(...items.map(item => new Option(item.title, item.id)));
  }
  load(items.find(item => item.id === match[2]) ?? items[0]);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
