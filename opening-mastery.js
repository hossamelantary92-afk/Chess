import {Chess} from './chess.js';
import {squareAt, paintSquare} from './board-cells.js';
import {catalog, firstMoves, openingChoices, positionKey, buildTree} from './opening-mastery-data.js?v=4';

const $ = id => document.getElementById(id);
const tree = buildTree();
const key = 'rook-opening-mastery';
let stored;
try { stored = JSON.parse(localStorage.getItem(key) ?? '{}'); } catch { stored = {}; }
const valid = value => value && ['w', 'b'].includes(value.color)
  && firstMoves.includes(value.first) && openingChoices(value.color, value.first).includes(value.id);
const query = new URLSearchParams(location.search);
const linkedId = query.get('opening');
const linkedColor = query.get('color') === 'b' ? 'b' : 'w';
const linkedFirst = firstMoves.find(first => openingChoices('b', first).includes(linkedId)) ?? 'e4';
const linked = {color: linkedColor, first: linkedFirst, id: linkedId, line: query.get('line') ?? '', ply: 0, mode: query.get('mode')};
const state = valid(linked) ? linked : valid(stored?.view) ? stored.view : {color: 'w', first: 'e4', id: '0', line: '', ply: 0};
if (valid(linked)) history.replaceState(history.state, '', location.pathname);
const saved = Array.isArray(stored?.saved) ? stored.saved.filter(valid) : [];
let activeId = catalog.has(state.activeId) ? state.activeId : state.id;
let activeLine = catalog.get(activeId).lines.find(line => line.id === state.line) ?? catalog.get(activeId).lines[0];
let chess, ply, lastMove, selected, practice = state.mode === 'test';
let attempts = practice ? Math.max(0, Number(state.attempts) || 0) : 0;
let correct = practice ? Math.min(attempts, Math.max(0, Number(state.correct) || 0)) : 0;
let finished = practice && Boolean(state.finished);
let setupCollapsed = Boolean(state.setupCollapsed);
const board = $('mastery-board');
const pieceNames = {p: 'بيدق', r: 'رخ', n: 'حصان', b: 'فيل', q: 'وزير', k: 'ملك'};

function persist() {
  try {
    localStorage.setItem(key, JSON.stringify({view: {...state, activeId, line: activeLine.id, ply, mode: practice ? 'test' : 'learn', attempts, correct, finished, setupCollapsed}, saved}));
    return true;
  } catch { return false; }
}

function setOptions(select, values, selectedValue, label) {
  select.replaceChildren(...values.map(value => new Option(label(value), value)));
  select.value = selectedValue;
}

function lineIdentity(id, line) {
  const category = catalog.get(id);
  const opening = catalog.get(line.openingId) ?? category;
  return {opening, category, variation: line.variationName ?? line.name};
}
function renderSetup() {
  $('setup-fields').hidden = setupCollapsed;
  $('setup-summary').hidden = !setupCollapsed;
  $('toggle-setup').setAttribute('aria-expanded', String(!setupCollapsed));
  $('setup-toggle-label').textContent = setupCollapsed ? 'تعديل' : 'طي';
  $('toggle-setup').setAttribute('aria-label', setupCollapsed ? 'تغيير الإعدادات' : 'طي الإعدادات');
  const identity = lineIdentity(activeId, activeLine);
  $('setup-summary').textContent = (state.color === 'w' ? 'White' : 'Black · '+state.first) + ' · ' + identity.opening.name + ' · ' + identity.variation;
}
function setSetupCollapsed(value) { setupCollapsed = value; renderSetup(); persist(); }
function renderPicker() {
  for (const button of $('mastery-color').children) {
    button.setAttribute('aria-pressed', button.dataset.color === state.color);
  }
  $('first-move-field').hidden = state.color === 'w';
  setOptions($('first-move'), firstMoves, state.first, move => move);
  setOptions($('opening'), openingChoices(state.color, state.first), state.id, id => catalog.get(id).name);
}

function renderOpeningInfo(opening) {
  const moves = activeLine.moves;
  const ltr = value => '\u2066' + value + '\u2069';
  $('opening-context').textContent = 'بداية الأبيض: ' + ltr(moves[0]) + ' · رد الأسود النموذجي: ' + ltr(moves[1] ?? '—');
  const profile = opening.profile;
  $('profile').textContent = profile?.[0] ?? '';
  $('profile').title = profile?.[1] ?? '';
  const fields = profile ? [['أسلوب اللعب', profile[1]], ['الميزة', profile[2]], ['خد بالك', profile[3]]] : [];
  $('trade-offs').replaceChildren(...fields.flatMap(([label, value]) => [element('dt', label), element('dd', value)]));
  $('trade-offs').hidden = !fields.length;
}

function element(tagName, value) {
  const node = document.createElement(tagName);
  node.textContent = value;
  return node;
}

function button(label, onclick) {
  const node = element('button', label);
  node.type = 'button';
  node.onclick = onclick;
  return node;
}

function renderSaved() {
  $('saved-openings').replaceChildren(...saved.map((entry, index) => {
    const row = document.createElement('div');
    const color = entry.color === 'w' ? 'White' : `Black · ${entry.first}`;
    const label = `${catalog.get(entry.id).name} · ${color}`;
    const remove = button('شيل', () => {
      saved.splice(index, 1);
      renderSaved();
      $('save-status').textContent = persist() ? 'الاختيار اتشال.' : 'تعذّر الحفظ في المتصفح.';
    });
    remove.setAttribute('aria-label', `حذف ${label}`);
    remove.title = 'حذف من المكتبة';
    remove.className = 'repertoire-remove';
    remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg>';
    const load = button('', () => { choose(entry); document.querySelector('.mastery-setup')?.scrollIntoView({block:'start'}); });
    load.className = 'repertoire-entry';
    const mark = element('span', entry.color === 'w' ? 'W' : 'B');
    mark.className = 'repertoire-mark '+(entry.color === 'w' ? 'white-mark' : 'black-mark');
    const copy = element('span','');
    copy.append(element('strong',catalog.get(entry.id).name),element('small',color));
    load.append(mark,copy);
    row.append(load, remove);
    return row;
  }));
  if (!saved.length) $('saved-openings').append(element('p', 'اختياراتك هتظهر هنا بعد الحفظ.'));
}

function choose(entry) {
  Object.assign(state, entry);
  activeId = state.id;
  activeLine = catalog.get(activeId).lines[0];
  renderPicker();
  restartMode(practice);
}

function restartMode(test) {
  practice = test;
  attempts = correct = 0;
  finished = false;
  const start = test && state.color === 'b' ? Math.min(1, activeLine.moves.length) : 0;
  go(start, test ? 'دورك. اختار القطعة والمربع من غير ما تشوف النقلات الجاية.' : '');
}
function explanation() {
  if (!ply) return catalog.get(activeId).summary;
  const note = activeLine.notes?.[ply];
  if (note) return note;
  return (lastMove?.san ?? '') + ' — ' + ({p:'راجع تأثير البيدق على المركز وخطوط القطع.',n:'راجع المربعات اللي الحصان بقى يسيطر عليها.',b:'تابع قطر الفيل والهدف منه.',r:'راجع العمود أو الصف اللي الرخ بيدعمه.',q:'حدّد هدف الوزير بعد النقلة.',k:'راجع أمان الملك بعد النقلة.'}[lastMove?.piece] ?? 'راجع أثر النقلة على الوضع.');
}
function go(target, message = '', result = '') {
  ply = Math.max(0, Math.min(Number.isInteger(target) ? target : 0, activeLine.moves.length));
  chess = new Chess();
  lastMove = null;
  for (const san of activeLine.moves.slice(0, ply)) lastMove = chess.move(san);
  selected = null;
  render(message, result);
  persist();
}

function renderBoard() {
  const legal = practice && !finished && selected ? chess.moves({square: selected, verbose: true}).map(move => move.to) : [];
  for (let index = 0; index < 64; index++) {
    const squareIndex = state.color === 'b' ? 63 - index : index;
    const file = squareIndex % 8;
    const row = Math.floor(squareIndex / 8);
    const square = 'abcdefgh'[file] + (8 - row);
    const piece = chess.get(square);
    const cell = squareAt(board, index);
    cell.className = ['tile', (file + row) % 2 && 'shaded', selected === square && 'picked',
      legal.includes(square) && 'legal', (lastMove?.from === square || lastMove?.to === square) && 'recent'].filter(Boolean).join(' ');
    if (index % 8 === 0) cell.dataset.rank = square[1]; else delete cell.dataset.rank;
    if (index >= 56) cell.dataset.file = square[0]; else delete cell.dataset.file;
    cell.setAttribute('aria-label', piece ? `${square} · ${pieceNames[piece.type]} ${piece.color === 'w' ? 'أبيض' : 'أسود'}` : square);
    cell.setAttribute('aria-disabled', String(!practice || finished));
    cell.tabIndex = practice && !finished ? 0 : -1;
    cell.onclick = () => tap(square);
    paintSquare(cell, piece ? `<img src="pieces/${piece.color}${piece.type.toUpperCase()}.svg" alt="" draggable="false">` : '');
  }
}

function tap(square) {
  if (!practice || finished || chess.turn() !== state.color) return;
  if (chess.get(square)?.color === chess.turn()) {
    selected = selected === square ? null : square;
    renderBoard();
    return;
  }
  if (!selected) return;
  const move = chess.moves({square: selected, verbose: true}).find(move => move.to === square && (!move.promotion || move.promotion === 'q'));
  selected = null;
  if (!move) { renderBoard(); $('move-note').textContent = 'النقلة دي غير قانونية. جرّب تاني.'; $('move-note').dataset.result = 'retry'; return; }
  attempts++;
  const expected = activeLine.moves[ply];
  if (move.san !== expected) {
    render('نقلة قانونية، لكنها مش النقلة المطلوبة في التفريعة دي. جرّب تاني. ده مش معناه إنها غلط في مباراة حقيقية.', 'retry');
    persist();
    return;
  }
  correct++;
  const note = activeLine.notes?.[ply + 1] ?? '';
  const reply = activeLine.moves[ply + 1];
  const next = Math.min(activeLine.moves.length, ply + 1 + Number(Boolean(reply)));
  finished = next >= activeLine.moves.length;
  // If the selected line ends on the opponent's move, it is played automatically too.
  go(next, (finished ? 'أحسنت! خلّصت اختبار الخط. ' : 'صحيح! ') + move.san + (reply ? ' · رد الخصم: ' + reply : '') + (note ? ' · ' + note : ''), 'correct');
}

function render(message, result = '') {
  const opening = catalog.get(activeId);
  setOptions($('opening-line'), opening.lines.map(line => line.id), activeLine.id,
    id => opening.lines.find(line => line.id === id).name);
  $('line-field').hidden = opening.lines.length <= 1;
  renderSetup();
  const identity = lineIdentity(activeId, activeLine);
  const displayOpening = identity.opening;
  renderOpeningInfo(displayOpening);
  $('active-opening').textContent = displayOpening.name;
  $('active-category').textContent = identity.category.name;
  $('active-category').hidden = identity.category === displayOpening;
  $('active-variation').textContent = identity.variation;
  $('training-mode-label').textContent = practice ? 'TEST' : 'LEARN';
  $('progress-fill').style.width = (activeLine.moves.length ? 100 * ply / activeLine.moves.length : 0) + '%';
  renderBoard();
  $('previous-ply').disabled = ply === 0 || practice;
  $('next-ply').disabled = ply === activeLine.moves.length || practice;
  $('learn-mode').setAttribute('aria-pressed', String(!practice));
  $('test-mode').setAttribute('aria-pressed', String(practice));
  $('learn-controls').hidden = practice;
  $('test-controls').hidden = !practice;
  $('test-score').textContent = 'صحيح: \u2066' + correct + ' / ' + attempts + '\u2069' + (finished ? ' · اكتمل الاختبار' : '');
  $('turn-status').textContent = finished ? 'اختبار مكتمل' : ply === activeLine.moves.length ? 'اكتمل الخط' : (practice ? 'دورك · ' : 'الدور · ') + (chess.turn() === 'w' ? 'White' : 'Black');
  $('line-progress').textContent = ply + ' / ' + activeLine.moves.length;
  $('move-note').dataset.result = result;
  $('move-note').textContent = message || (practice ? (finished ? 'اكتمل الاختبار. راجع الخط أو أعد الاختبار.' : 'العب النقلة التالية من الذاكرة.') : explanation());
  $('opening-explanation').hidden = practice && !finished;
  $('move-list').replaceChildren(...activeLine.moves.slice(0, practice ? ply : undefined).map((san, index) => {
    const chip = button(`${index % 2 ? '…' : Math.floor(index / 2) + 1 + '.'}${san}`, () => go(index + 1));
    chip.disabled = practice;
    if (index + 1 === ply) chip.setAttribute('aria-current', 'step');
    return chip;
  }));
  // At the starting position, do not suggest unrelated first moves. On our turn
  // limit the alternatives to the selected opening; on the opponent's turn,
  // keep valid deviations and transpositions from this position.
  const opponentTurn = chess.turn() !== state.color;
  const options = practice || ply === 0 ? [] : [...(tree.get(positionKey(chess))?.values() ?? [])];
  const choices = options.map(entries => opponentTurn ? entries : entries.filter(entry => entry.id === activeId)).filter(entries => entries.length);
  const meaningful = choices.length > 1 || (choices.length === 1 && choices[0][0].move.san !== activeLine.moves[ply]);
  $('response-panel').hidden = !meaningful;
  const atFork = !practice && ply === activeLine.moves.length && meaningful;
  $('response-panel').dataset.atEnd = String(atFork);
  $('next-ply').disabled = practice || (ply === activeLine.moves.length && !atFork);
  $('next-label').textContent = atFork ? 'Choose reply' : 'Next';
  if (atFork) $('turn-status').textContent = 'اختار الرد التالي';
  $('response-heading').textContent = opponentTurn ? (chess.turn() === 'w' ? 'White Responses' : 'Black Responses') : 'Alternative Lines';
  $('response-caption').textContent = atFork ? 'اختار نقلة من الفروع التالية عشان تكمّل التدريب.' : opponentTurn ? 'جرّب رد مختلف للخصم وشوف إزاي الخطة بتتغيّر.' : 'اختار تفريعة بديلة في نفس الافتتاحية.';
  function switchBranch(entry, target, note) {
    activeId = entry.id;
    activeLine = entry.line;
    if (openingChoices(state.color, state.first).includes(activeId)) { state.id = activeId; renderPicker(); }
    go(target, note);
  }
  $('tree-branches').replaceChildren(...(meaningful ? choices : []).map(entries => {
    const next = entries.find(entry => entry.line === activeLine) ?? entries.find(entry => entry.id === activeId) ?? entries[0];
    const row = document.createElement('div');
    row.dataset.main = String(next.move.san === activeLine.moves[ply]);
    const copy = document.createElement('div');
    const target = lineIdentity(next.id, next.line);
    const history = activeLine.moves.slice(0, ply).join(' ');
    const alternate = entries.find(entry => entry.line.moves.slice(0, entry.ply - 1).join(' ') !== history);
    const title = element('strong', target.opening.name);
    title.dir = 'ltr';
    const variation = element('span',target.variation);
    variation.className = 'branch-variation';
    variation.dir = 'ltr';
    copy.append(title, variation, element('small',next.line.notes?.[next.ply] ?? next.line.idea ?? target.variation));
    if (alternate) {
      const switchOrder = button('Transposition', () => {
        switchBranch(alternate, alternate.ply - 1, 'وصلت لنفس الوضع بترتيب نقلات مختلف.');
      });
      switchOrder.lang = 'en';
      copy.append(switchOrder);
    }
    const jump = button(next.move.san, () => {
      switchBranch(next, next.ply);
    });
    jump.dir = 'ltr';
    jump.setAttribute('aria-label', 'اعرض '+next.move.san+' · '+target.opening.name);
    jump.className = 'branch-move';
    row.append(copy, jump);
    return row;
  }));
  $('opening-summary').textContent = displayOpening.summary;
  $('line-idea').textContent = activeLine.idea && activeLine.idea !== displayOpening.summary ? activeLine.idea : '';
  $('line-idea').hidden = !$('line-idea').textContent;
  $('white-plan').textContent = activeLine.white ?? '';
  $('black-plan').textContent = activeLine.black ?? '';
  $('white-plan-card').hidden = !activeLine.white;
  $('black-plan-card').hidden = !activeLine.black;
  $('opening-source').hidden = !displayOpening.source;
  if (displayOpening.source) $('opening-source').href = displayOpening.source;
  $('review-question').hidden = !activeLine.question;
  $('review-prompt').textContent = activeLine.question ?? '';
  $('review-answer').textContent = activeLine.answer ?? '';
  $('review-question').open = false;
  const decision = activeLine.decision;
  $('decision-review').hidden = !decision || practice;
  $('decision-prompt').textContent = decision?.prompt ?? '';
  $('decision-feedback').textContent = '';
  $('decision-options').replaceChildren(...(decision?.choices ?? []).map(([san,reason]) => {
    const option = button(san, () => { $('decision-feedback').textContent = reason; });
    option.dir = 'ltr'; return option;
  }));
  $('decision-jump').onclick = () => go(activeLine.start ?? 0);
  const links = [];
  function addLink(label,href,external=false) { const a=element('a',label);a.href=href;if(external){a.target='_blank';a.rel='noopener noreferrer';}links.push(a); }
  const video=activeLine.video ?? displayOpening.video;
  if(video) addLink(video[0],video[1],true);
  const model={0:'italian',2:'london',4:'french'}[displayOpening.index];
  if(model) addLink('Model Game','index.html#model-games/'+model);
  if(activeLine.related) addLink(activeLine.related[1],'opening-mastery.html?opening='+encodeURIComponent(activeLine.related[0])+'&color='+state.color);
  addLink('Position Evaluation','index.html#position-evaluation');
  $('opening-links').replaceChildren(...links);
}

$('mastery-color').onclick = event => {
  const color = event.target.closest('[data-color]')?.dataset.color;
  if (color && color !== state.color) choose({color, first: state.first, id: openingChoices(color, state.first)[0]});
};
$('first-move').onchange = event => choose({color: 'b', first: event.target.value, id: openingChoices('b', event.target.value)[0]});
$('opening').onchange = event => choose({color: state.color, first: state.first, id: event.target.value});
$('opening-line').onchange = event => {
  activeLine = catalog.get(activeId).lines.find(line => line.id === event.target.value);
  restartMode(practice);
};
$('save-opening').onclick = () => {
  const {id, first, color} = state;
  if (!saved.some(entry => entry.id === id && entry.color === color && (color === 'w' || entry.first === first))) saved.push({id, first, color});
  renderSaved();
  $('save-status').textContent = persist() ? 'الاختيار اتحفظ.' : 'تعذّر الحفظ في المتصفح.';
};
$('previous-ply').onclick = () => go(ply - 1);
$('next-ply').onclick = () => {
  if (ply < activeLine.moves.length) go(ply + 1);
  else if (!$('response-panel').hidden) $('response-panel').scrollIntoView({block:'nearest',behavior:'smooth'});
};
$('toggle-setup').onclick = () => setSetupCollapsed(!setupCollapsed);
function selectMode(test) {
  if (practice !== test) restartMode(test);
  if (typeof matchMedia === 'function' && matchMedia('(max-width:800px)').matches) setSetupCollapsed(true);
}
$('learn-mode').onclick = () => selectMode(false);
$('test-mode').onclick = () => selectMode(true);
$('retry-test').onclick = () => restartMode(true);
$('start-ply').onclick = () => go(0);

renderPicker();
renderSaved();
if (practice && (state.ply == null || (state.color === 'b' && state.ply === 0))) restartMode(true);
else go(state.ply);
