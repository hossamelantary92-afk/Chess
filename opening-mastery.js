import {Chess} from './chess.js';
import {squareAt, paintSquare} from './board-cells.js';
import {catalog, firstMoves, openingChoices, positionKey, buildTree} from './opening-mastery-data.js?v=2';

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
const board = $('mastery-board');
const pieceNames = {p: 'بيدق', r: 'رخ', n: 'حصان', b: 'فيل', q: 'وزير', k: 'ملك'};

function persist() {
  try {
    localStorage.setItem(key, JSON.stringify({view: {...state, activeId, line: activeLine.id, ply, mode: practice ? 'test' : 'learn', attempts, correct, finished}, saved}));
    return true;
  } catch { return false; }
}

function setOptions(select, values, selectedValue, label) {
  select.replaceChildren(...values.map(value => new Option(label(value), value)));
  select.value = selectedValue;
}

function renderPicker() {
  for (const button of $('mastery-color').children) {
    button.setAttribute('aria-pressed', button.dataset.color === state.color);
  }
  $('first-move-field').hidden = state.color === 'w';
  setOptions($('first-move'), firstMoves, state.first, move => move);
  setOptions($('opening'), openingChoices(state.color, state.first), state.id, id => catalog.get(id).name);
  const opening = catalog.get(state.id);
  $('opening-context').textContent = state.color === 'b' ? 'الرد على ' + state.first + ' · ' + opening.lines[0].moves.slice(0, 2).join(' ') : 'بداية الأبيض: ' + opening.lines[0].moves[0] + ' · رد الأسود النموذجي: ' + (opening.lines[0].moves[1] ?? '—');
  const profile = opening.profile;
  $('profile').textContent = profile ? profile.slice(0, 2).join(' · ') : opening.summary;
  const fields = profile ? [['الميزة', profile[2]], ['خد بالك', profile[3]]] : [];
  $('trade-offs').replaceChildren(...fields.flatMap(([label, value]) => [element('dt', label), element('dd', value)]));
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
    remove.setAttribute('aria-label', `شيل ${label}`);
    row.append(button(label, () => choose(entry)), remove);
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
    id => `${opening.name} · ${opening.lines.find(line => line.id === id).name}`);
  renderBoard();
  $('previous-ply').disabled = ply === 0 || practice;
  $('next-ply').disabled = ply === activeLine.moves.length || practice;
  $('learn-mode').setAttribute('aria-pressed', String(!practice));
  $('test-mode').setAttribute('aria-pressed', String(practice));
  $('learn-controls').hidden = practice;
  $('test-controls').hidden = !practice;
  $('test-score').textContent = 'صحيح: ' + correct + ' / ' + attempts + (finished ? ' · اكتمل الاختبار' : '');
  $('turn-status').textContent = finished ? 'اختبار مكتمل' : ply === activeLine.moves.length ? 'اكتمل الخط' : (practice ? 'دورك · ' : 'الدور · ') + (chess.turn() === 'w' ? 'White' : 'Black');
  $('line-progress').textContent = ply + ' / ' + activeLine.moves.length;
  $('move-note').dataset.result = result;
  $('move-note').textContent = message || (practice ? (finished ? 'اكتمل الاختبار. راجع الخط أو أعد الاختبار.' : 'العب النقلة التالية من الذاكرة.') : explanation());
  for (const id of ['profile','trade-offs','opening-context','opening-explanation']) $(id).hidden = practice && !finished;
  $('move-list').replaceChildren(...activeLine.moves.slice(0, practice ? ply : undefined).map((san, index) => {
    const chip = button(`${index % 2 ? '…' : Math.floor(index / 2) + 1 + '.'}${san}`, () => go(index + 1));
    chip.disabled = practice;
    if (index + 1 === ply) chip.setAttribute('aria-current', 'step');
    return chip;
  }));
  const choices = practice ? [] : [...(tree.get(positionKey(chess))?.values() ?? [])];
  $('tree-branches').replaceChildren(...choices.map(entries => {
    const next = entries.find(entry => entry.line === activeLine) ?? entries[0];
    const row = document.createElement('div');
    const copy = document.createElement('div');
    const target = catalog.get(next.id);
    const history = activeLine.moves.slice(0, ply).join(' ');
    const alternate = entries.find(entry => entry.line.moves.slice(0, entry.ply - 1).join(' ') !== history);
    copy.append(element('strong', target.name), element('small',
      next.line.notes?.[next.ply] ?? next.line.idea ?? next.line.name));
    if (alternate) {
      const switchOrder = button('Transposition', () => {
        activeId = alternate.id;
        activeLine = alternate.line;
        go(alternate.ply - 1, 'وصلت لنفس الوضع بترتيب نقلات مختلف.');
      });
      switchOrder.lang = 'en';
      copy.append(switchOrder);
    }
    const jump = button(next.move.san, () => {
      activeId = next.id;
      activeLine = next.line;
      go(next.ply);
    });
    jump.dir = 'ltr';
    row.append(copy, jump);
    return row;
  }));
  $('tree-branches').previousElementSibling.hidden = practice;
  $('tree-branches').hidden = practice;
  $('opening-summary').textContent = opening.summary;
  $('line-idea').textContent = activeLine.idea ?? opening.summary;
  $('white-plan').textContent = activeLine.white ? `White · ${activeLine.white}` : '';
  $('black-plan').textContent = activeLine.black ? `Black · ${activeLine.black}` : '';
  $('opening-source').hidden = !opening.source;
  if (opening.source) $('opening-source').href = opening.source;
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
  const video=activeLine.video ?? opening.video;
  if(video) addLink(video[0],video[1],true);
  const model={0:'italian',2:'london',4:'french'}[opening.index];
  if(model) addLink('Model Game','index.html#model-games/'+model);
  if(activeLine.related) addLink(activeLine.related[1],'opening-mastery.html?opening='+encodeURIComponent(activeLine.related[0])+'&color='+state.color);
  addLink('Position Evaluation','index.html#position-evaluation');
  $('opening-links').replaceChildren(...links);
}

$('mastery-color').onclick = event => {
  const color = event.target.closest('[data-color]')?.dataset.color;
  if (color) choose({color, first: state.first, id: openingChoices(color, state.first)[0]});
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
$('next-ply').onclick = () => go(ply + 1);
$('learn-mode').onclick = () => { if (practice) restartMode(false); };
$('test-mode').onclick = () => { if (!practice) restartMode(true); };
$('retry-test').onclick = () => restartMode(true);
$('start-ply').onclick = () => go(0);

renderPicker();
renderSaved();
if (practice && (state.ply == null || (state.color === 'b' && state.ply === 0))) restartMode(true);
else go(state.ply);
