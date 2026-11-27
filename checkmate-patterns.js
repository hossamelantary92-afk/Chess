import {moveSound,playSound} from './rook-sound.js?v=324';
import {squareAt, paintSquare} from './board-cells.js';
import {Chess} from './chess.js';
import {patterns} from './checkmate-patterns-data.js?v=210';

import {mateInTwo} from './mate-in-two-data.js?v=212';

import {decisionTest} from './decision-test-data.js?v=2';
import {defenses} from './mate-defense-data.js';

const mateInThree = [{title:'Queen and King – Mate in Three',fen:"7k/8/8/4K3/8/8/8/3Q4 w - - 0 1",tree:{"Kf6":{"Kh7":{"Qd7+":{"Kg8":{"Qg7#":{}},"Kh8":{"Qg7#":{}},"Kh6":{"Qh3#":{}}},"Qd8":{"Kh6":{"Qh8#":{}}},"Qg4":{"Kh8":{"Qg7#":{}},"Kh6":{"Qg6#":{},"Qh4#":{},"Qh3#":{}}},"Qg1":{"Kh8":{"Qg7#":{}},"Kh6":{"Qg6#":{},"Qh2#":{},"Qh1#":{}}}},"Kg8":{"Kg6":{"Kh8":{"Qd8#":{}},"Kf8":{"Qd8#":{}}},"Qd7":{"Kh8":{"Qg7#":{}},"Kf8":{"Qc8#":{},"Qd8#":{},"Qf7#":{}}},"Qg4+":{"Kh8":{"Qg7#":{}},"Kh7":{"Qg7#":{}},"Kf8":{"Qc8#":{}}},"Qh5":{"Kf8":{"Qf7#":{},"Qh8#":{}}},"Qh1":{"Kf8":{"Qa8#":{},"Qh8#":{}}}}},"Qd7":{"Kg8":{"Kf6":{"Kh8":{"Qg7#":{}},"Kf8":{"Qc8#":{},"Qd8#":{},"Qf7#":{}}}}},"Qg4":{"Kh7":{"Kf6":{"Kh8":{"Qg7#":{}},"Kh6":{"Qg6#":{},"Qh4#":{},"Qh3#":{}}}}},"Qg1":{"Kh7":{"Kf6":{"Kh8":{"Qg7#":{}},"Kh6":{"Qg6#":{},"Qh2#":{},"Qh1#":{}}}}}},explain:'قرّب الملك وضيّق مساحة الهروب، ثم احسب ردود الخصم قبل الكش النهائي.'}];
const $ = id => document.getElementById(id);
const names = {p:'بيدق', n:'حصان', b:'فيل', r:'رخ', q:'وزير', k:'ملك'};
const panel = document.createElement('section');
panel.id = 'matePatternsPanel';
panel.hidden = true;
panel.innerHTML = `
  <nav class="training-links mid-nav"><a href="#home">الرئيسية</a></nav>
  <div class="lesson-head"><h2 lang="en">Checkmate Patterns</h2></div>
  <p>ادرس شكل المات، وجرّبه في وضع جديد. في التدريب المختلط، اسم النمط يظهر بعد الحل.</p><details class="unit-card" id="mateFoundations"><summary>مبادئ الكش مات</summary><article><h3>الكش ليس ماتًا</h3><ul><li>ابدأ بتحديد القطعة التي تعطي الكش.</li><li>افحص ردود الملك، وأخذ قطعة الكش، وحجب الخط إذا كان ممكنًا.</li><li>كش الحصان لا يُحجب؛ والكش المزدوج يتطلب تحريك الملك.</li></ul><details><summary>أي رد لا يصلح وحده ضد كش حصان؟</summary><p>حجب الكش بقطعة — الحصان يقفز؛ لا يوجد خط بينه وبين الملك يمكن حجبه.</p></details></article><article><h3>مات الصف الأخير</h3><ul><li>الملك المحبوس ببيادقه قد يتعرض لمات رخ أو وزير على الصف الأخير.</li><li>لا تفترض المات إذا أمكن الحجب أو أخذ قطعة الهجوم.</li><li>فتح مربع تنفّس قد يفيد، لكنه يجب أن يكون آمنًا وألا يسمح بخطر أهم.</li></ul><details><summary>لماذا قد تكون h3 مفيدة أحيانًا؟</summary><p>لتوفير مربع هروب للملك إذا كان آمنًا — مربع التنفس علاج محتمل لمشكلة محددة، وليس قاعدة آلية في كل وضع.</p></details></article><article><h3>التضحية تحتاج حسابًا</h3><ul><li>لا تُقلّد تضحيات الأبطال من غير تحقق من وصول القطع ومنع الهروب.</li><li>قبل التضحية احسب الأخذ والرفض، ثم تابع النقلات الإجبارية.</li><li>القطعة الأقل قيمة قد تعطي المات إذا تعاونت معها بقية القطع.</li></ul><details><summary>وجدت تضحية وزير جميلة لكن الخصم يستطيع رفضها بأمان. ما القرار؟</summary><p>أراجع الحساب ولا أعتبرها فوزًا إجباريًا — الخصم غير ملزم بقبول التضحية؛ يجب فحص البدائل.</p></details></article></details>
  <details class="rook-mode-settings"><summary>إعدادات تدريب الكش مات</summary><div class="training-links mid-nav rook-mode-grid" aria-label="طريقة التدريب">
    <button type="button" class="premium-btn" id="mateStudyMode" aria-pressed="true" lang="en">Study</button>
    <button type="button" class="premium-btn" id="mateMixMode" aria-pressed="false" lang="en">Mixed Practice</button>
    <button type="button" class="premium-btn" id="mateTwoMode" lang="en">Mate in Two</button>
    <button type="button" class="premium-btn" id="mateThreeMode" lang="en">Mate in Three</button>
    <button type="button" class="premium-btn" id="mateDefendMode" lang="en">Defend Against Mate</button>
    <button type="button" class="premium-btn" id="mateDecisionMode" lang="en">Attack or Defend?</button>
    <button type="button" class="premium-btn" id="mateTestMode" lang="en">Decision Test</button>
    <select id="matePatternPicker" class="premium-btn" aria-label="اختار نمط المات"></select>
  </div></details>
  <div class="safety-layout">
    <div class="board-area">
      <div class="board-top"><span id="matePatternTurn"></span><span id="matePatternMove" dir="ltr"></span></div>
      <div class="frame"><div id="matePatternBoard" aria-label="رقعة تدريب أنماط المات"></div></div>
    </div>
    <div class="coach">
      <h3 id="matePatternTitle" lang="en" dir="ltr" tabindex="-1"></h3>
      <p id="matePatternPrompt"></p>
      <div id="mateDecisionChoices" class="training-links mid-nav" hidden>
        <button type="button" class="premium-btn" data-task="two">أجهّز مات في نقلتين</button>
        <button type="button" class="premium-btn" id="improveChoice" data-task="improve" lang="en">Improve a Piece</button>
        <button type="button" class="premium-btn" data-task="defend">أمنع مات في نقلة</button>
      </div>
      <p id="matePatternStatus" role="status" aria-live="polite"></p>
      <div id="matePatternReview" class="unit-card" hidden>
        <p id="matePatternExplain"></p>
        <p id="matePatternDefense"></p>
      </div>
      <div class="training-links mid-nav">
        <button type="button" class="premium-btn" id="mateShowExample">اعرض المثال</button>
        <button type="button" class="premium-btn primary" id="matePatternNext">جرّب بنفسك</button>
        <button type="button" class="premium-btn" id="matePatternRepeat" hidden>أعد المحاولة</button>
      </div>
    </div>
  </div>`;
document.querySelector('main footer').before(panel);
const picker = $('matePatternPicker');

patterns.forEach((pattern, index) => {
  const option = document.createElement('option');
  option.value = index;
  option.textContent = pattern.title;
  picker.append(option);
});

let order = [...patterns];
let index = 0;
let mode = 'study';
let practice = false;
let complete = false;
let selected;
let chess;
let answer;
let side;
let replies;
let branch = 0;
let decisionPending = false;
let threeNode = null;

function isDecisionMode() {
  return mode === 'decision' || mode === 'test';
}

function currentTask() {
  return isDecisionMode() ? order[index].task : mode;
}

function board() {
  const files = side === 'w' ? 'abcdefgh' : 'hgfedcba';
  const ranks = side === 'w' ? '87654321' : '12345678';
  const target = $('matePatternBoard');
  const last = chess.history({verbose:true}).at(-1);
  let cellIndex = 0;
  $('matePatternTurn').textContent = complete ? (chess.isCheckmate() ? 'كش مات' : currentTask() === 'improve' ? 'تم تحسين القطعة' : 'تم الدفاع') : side === 'w' ? 'دور الأبيض' : 'دور الأسود';
  $('matePatternMove').textContent = last?.san ?? '';
  for (const rank of ranks) {
    for (const [column, file] of [...files].entries()) {
      const square = file + rank;
      const piece = chess.get(square);
      const cell = squareAt(target, cellIndex++);
      cell.type = 'button';
      cell.dataset.square = square;
      cell.className = ('abcdefgh'.indexOf(file) + Number(rank)) % 2 ? 'dark' : '';
      if (last?.from === square || last?.to === square) cell.classList.add('safe-last');
      if (selected === square) cell.classList.add('selected');
      if (complete && chess.isCheckmate() && piece?.type === 'k' && piece.color === chess.turn()) cell.classList.add('selected');
      cell.setAttribute('aria-label', square + (piece ? ` ${names[piece.type]} ${piece.color === 'w' ? 'أبيض' : 'أسود'}` : ''));
      paintSquare(cell, (piece ? `<img class="piece" src="pieces/${piece.color + piece.type.toUpperCase()}.svg" alt="" draggable="false">` : '') +
        (column === 0 ? `<small class="rank">${rank}</small>` : '') +
        (rank === ranks.at(-1) ? `<small class="file">${file}</small>` : ''));
      cell.disabled = complete || decisionPending;
      cell.onclick = () => select(square);

    }
  }
}

function render(feedback = '') {
  const pattern = order[index];
  const mixed = mode !== 'study';
  const two = currentTask() === 'two';
  const three = mode === 'three';
  $('mateThreeMode').setAttribute('aria-pressed',String(three));
  const defend = currentTask() === 'defend';
  $('improveChoice').hidden = mode !== 'test';
  $('mateTestMode').setAttribute('aria-pressed', String(mode === 'test'));
  $('mateDecisionMode').setAttribute('aria-pressed', String(mode === 'decision'));
  $('mateDecisionChoices').hidden = !decisionPending;
  const lost = defend && complete && chess.isCheckmate() && chess.turn() === side;
  $('mateDefendMode').setAttribute('aria-pressed', String(mode === 'defend'));
  $('mateTwoMode').setAttribute('aria-pressed', String(mode === 'two'));
  picker.hidden = mixed;
  $('mateStudyMode').setAttribute('aria-pressed', String(!mixed));
  $('mateMixMode').setAttribute('aria-pressed', String(mode === 'mixed'));
  $('matePatternTitle').textContent = mixed && (!complete || two) ? `Position ${index + 1} / ${order.length}` : pattern.title;
  $('matePatternPrompt').textContent = decisionPending ? 'افحص كشّاتك وتهديدات خصمك. إيه الأولوية هنا؟' : defend ? (complete ? (lost ? 'شوف المات على الرقعة ثم أعد المحاولة.' : 'منعت المات الفوري.') : 'افحص كشّات الخصم، وحدّد مربع المات، والعب نقلة تمنع المات في الرد الجاي.') : mixed ? (complete ? `حلّيت الموقف ${index + 1} من ${order.length}.` : two ? (replies ? 'نفّذ المات بعد رد الخصم.' : 'اختار نقلة تضمن المات في نقلتك التالية قدّام كل رد.') : 'دور على مات في نقلة واحدة.') :
    practice ? 'طبّق نفس الفكرة في الوضع الجديد. دور على مات في نقلة.' : pattern.clue;
  if (decisionPending && mode === 'test') {
    $('matePatternPrompt').textContent = 'افحص تهديدات الطرفين ونشاط قطعك. إيه الأولوية هنا؟';
  } else if (currentTask() === 'improve') {
    $('matePatternPrompt').textContent = complete ? 'شوف إيه اللي اتغيّر بعد نقلتك.' : pattern.goal;
  }
  if(three) $('matePatternPrompt').textContent = complete?'أكملت المات.':`حقق المات خلال ${3-Math.floor(chess.history().length/2)} نقلات أو أقل.`;
  $('matePatternStatus').textContent = feedback;
  $('matePatternReview').hidden = !complete;
  $('matePatternExplain').textContent = complete ? (two ? [pattern.explain, chess.history().join(' · ')].filter(Boolean).join(' — ') : pattern.explain) : '';
  $('matePatternDefense').textContent = complete ? (two ? Object.entries(replies).map(([reply, mates]) => reply + ' → ' + mates.join(' / ')).join(' | ') : (pattern.defense ?? '')) : '';
  $('mateShowExample').hidden = mixed || practice || complete;
  $('matePatternRepeat').hidden = !complete;
  $('matePatternRepeat').textContent = two && replies && Object.keys(replies).length > 1 ? 'جرّب رد تاني' : 'أعد المحاولة';
  $('matePatternNext').hidden = (mixed || practice) && !complete || lost;
  $('matePatternNext').textContent = mixed ? (index + 1 === order.length ? 'ابدأ جولة جديدة' : 'الموقف التالي') :
    practice ? 'النمط التالي' : 'جرّب بنفسك';
  board();
}

function open() {
  const pattern = order[index];
  decisionPending = isDecisionMode();
  replies = null;
  threeNode = mode==='three'?pattern.tree:null;
  const [fen, move] = mode==='three'?[pattern.fen,'']: ['defend', 'improve'].includes(currentTask()) ? [pattern.fen, pattern.example] : currentTask() === 'two' ? [pattern.fen, Object.keys(pattern.keys)[0]] : mode === 'mixed' || practice ? pattern.practice : pattern.lesson;
  chess = new Chess(fen);
  side = chess.turn();
  answer = move;
  complete = false;
  selected = null;
  picker.value = patterns.indexOf(pattern);
  render();
}

function solve(move, feedback) {
  chess.move(move);
  complete = true;
  selected = null;
  render(feedback);
  $('matePatternTitle').focus({preventScroll:true});
}

function select(square) {
  if (complete) return;
  if (chess.get(square)?.color === side) {
    selected = selected === square ? null : square;
    board();
    $('matePatternBoard').querySelector(`[data-square="${square}"]`).focus({preventScroll:true});
    return;
  }
  if (!selected) return;
  const candidates = chess.moves({square:selected, verbose:true}).filter(item => item.to === square);
  const move = candidates.find(item => item.san === answer) ?? candidates.find(item => item.san.endsWith('#')) ?? candidates.find(item => item.promotion === 'q') ?? candidates[0];
  if(mode==='three' && move){
    if(!Object.hasOwn(threeNode,move.san)){ $('matePatternStatus').textContent='النقلة لا تضمن المات في العدد المتبقي. احسب ردود الخصم.';return; }
    const responses=threeNode[move.san];moveSound(chess.move(move.san));selected=null;
    if(chess.isCheckmate()){complete=true;render('أحسنت، كش مات.');return;}
    const options=Object.keys(responses);const reply=options[branch%options.length];chess.move(reply);threeNode=responses[reply];render('رد الخصم · '+reply);return;
  }
  if (currentTask() === 'improve' && move) {
    if (move.san === answer) solve(answer, 'أحسنت، النقلة حقّقت هدف الخطة.');
    else $('matePatternStatus').textContent = 'نقلة قانونية. جرّب نقلة تحقق الهدف المحدد في السؤال.';
    return;
  }
  if (currentTask() === 'defend' && move) {
    moveSound(chess.move(move.san));
    const mate = chess.moves().find(reply => reply.endsWith('#'));
    if (mate) chess.move(mate);
    selected = null;
    complete = true;
    render(mate ? `بعد ${move.san} الخصم قدر يلعب ${mate}` : `دفاع صحيح · ${move.san}`);
    $('matePatternTitle').focus({preventScroll:true});
    return;
  }
  if (currentTask() === 'two' && move) {
    if (replies && move.san.endsWith('#')) {
      solve(move.san, 'أحسنت، حضرت الشبكة وكمّلت المات.');
    } else if (!replies && Object.hasOwn(order[index].keys,move.san)) {
      answer=move.san;
      chess.move(answer);
      replies = order[index].keys[answer];
      const options = Object.keys(replies);
      const reply = options[branch % options.length];
      chess.move(reply);
      selected = null;
      render('رد الخصم · ' + reply);
    } else {
      $('matePatternStatus').textContent = replies ? 'افحص مربعات هروب الملك وجرّب نقلة تدي مات.' : (order[index].traps?.[move.san] ?? 'الخصم عنده رد يمنع المات في النقلة التالية. جرّب تحضير تاني.');
    }
    return;
  }
  if (move?.san.endsWith('#')) {
    solve(move.san, 'أحسنت، دي كش مات.');
    return;
  }
  $('matePatternStatus').textContent = move ? 'النقلة قانونية، لكن لسه فيه رد. راجع الهروب أو أخذ قطعة الكش أو حجب الخط.' :
    'النقلة دي مش قانونية. جرّب مربع تاني.';
}

function chooseMode(nextMode) {
  mode = nextMode;
  practice = false;
  branch = 0;
  order = mode === 'three' ? [...mateInThree] : mode === 'defend' ? [...defenses] : mode === 'two' ? mateInTwo.map((position,i)=>({...position,title:position.title ?? `Mate in Two ${i+1}`})) : [...patterns];
  if (mode === 'test') order = [...decisionTest];
  if (mode === 'decision') {
    order = [
      ...mateInTwo.slice(-4).map((position,i) => ({...position, title:position.title ?? `Mate in Two ${i+5}`, task:'two'})),
      ...defenses.map(position => ({...position, task:'defend'}))
    ];
  }
  if (mode !== 'study') {
    for (let last = order.length - 1; last > 0; last--) {
      const slot = Math.floor(Math.random() * (last + 1));
      [order[slot], order[last]] = [order[last], order[slot]];
    }
  }
  index = 0;
  open();
}

$('mateThreeMode').onclick = () => chooseMode('three');
$('mateTestMode').onclick = () => chooseMode('test');
$('mateDecisionMode').onclick = () => chooseMode('decision');
for (const button of $('mateDecisionChoices').querySelectorAll('button')) {
  button.onclick = () => {
    if (button.dataset.task !== currentTask()) {
      render('راجع التهديدات المباشرة ونشاط القطع، ثم اختار تاني.');
      return;
    }
    decisionPending = false;
    render('قرار صحيح. نفّذ فكرتك على الرقعة.');
    $('matePatternTitle').focus({preventScroll:true});
  };
}
$('mateDefendMode').onclick = () => chooseMode('defend');
$('mateTwoMode').onclick = () => chooseMode('two');
$('mateStudyMode').onclick = () => chooseMode('study');
$('mateMixMode').onclick = () => chooseMode('mixed');
$('mateShowExample').onclick = () => solve(answer, 'راجع إزاي القطع قفلت كل ردود الملك.');
$('matePatternRepeat').onclick = () => {
  branch++;
  open();
  $('matePatternTitle').focus({preventScroll:true});
};
picker.onchange = () => {
  index = Number(picker.value);
  practice = false;
  open();
};
$('matePatternNext').onclick = () => {
  branch = 0;
  if (mode !== 'study' && index + 1 === order.length) {
    chooseMode(mode);
  } else {
    if (mode !== 'study' || practice) index = (index + 1) % order.length;
    if (mode === 'study') practice = !practice;
    open();
  }
  $('matePatternTitle').focus({preventScroll:true});
};

function route() {
  panel.hidden = location.hash !== '#checkmate-patterns';
  if (panel.hidden) return;
  document.body.classList.add('training-view');
  document.body.dataset.section = 'checkmate-patterns';
  $('homeDashboard').hidden = true;
  document.querySelector('.workspace').hidden = true;
  open();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();

import {keepView} from './refresh.js';
keepView('mates', () => panel.hidden ? null : {
  mode, titles:order.map(item=>item.title), index, practice, branch, decisionPending,
  moves:chess.history(), complete, replies, answer
}, saved => {
  if(!saved||!['study','mixed','two','three','defend','test','decision'].includes(saved.mode)||!Array.isArray(saved.titles)||!Array.isArray(saved.moves)||!Number.isInteger(saved.index)||saved.index<0||saved.index>=saved.titles.length)return;
  chooseMode(saved.mode);
  const byTitle = new Map(order.map(item=>[item.title,item]));
  if (!saved.titles.every(title=>byTitle.has(title))) return;
  order=saved.titles.map(title=>byTitle.get(title)); index=saved.index;
  practice=saved.practice; branch=saved.branch; open();
  try { for (const move of saved.moves) {if(mode==='three'){if(!threeNode?.[move])throw Error('Invalid saved branch');threeNode=threeNode[move];}chess.move(move,{strict:true});} } catch {open();return;}
  complete=saved.complete; replies=saved.replies; answer=saved.answer;
  decisionPending=saved.decisionPending; render();
});
