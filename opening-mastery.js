import {Chess} from './chess.js';
import {squareAt, paintSquare} from './board-cells.js';
import {catalog, firstMoves, openingChoices, positionKey, buildTree} from './opening-mastery-data.js';

const $ = id => document.getElementById(id);
const tree = buildTree();
const key = 'rook-opening-mastery';
let stored;
try { stored = JSON.parse(localStorage.getItem(key) ?? '{}'); } catch { stored = {}; }
const valid = value => value && ['w', 'b'].includes(value.color)
  && firstMoves.includes(value.first) && openingChoices(value.color, value.first).includes(value.id);
const state = valid(stored?.view) ? stored.view : {color: 'w', first: 'e4', id: '0', line: '', ply: 0};
const saved = Array.isArray(stored?.saved) ? stored.saved.filter(valid) : [];
let activeId = catalog.has(state.activeId) ? state.activeId : state.id;
let activeLine = catalog.get(activeId).lines.find(line => line.id === state.line) ?? catalog.get(activeId).lines[0];
let chess, ply, lastMove, selected, practice = false;
const board = $('mastery-board');
const pieceNames = {p: 'بيدق', r: 'رخ', n: 'حصان', b: 'فيل', q: 'وزير', k: 'ملك'};

function persist() {
  try {
    localStorage.setItem(key, JSON.stringify({view: {...state, activeId, line: activeLine.id, ply}, saved}));
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
  practice = false;
  renderPicker();
  go(0);
}

function go(target, message = '') {
  ply = Math.max(0, Math.min(Number.isInteger(target) ? target : 0, activeLine.moves.length));
  chess = new Chess();
  lastMove = null;
  for (const san of activeLine.moves.slice(0, ply)) lastMove = chess.move(san);
  selected = null;
  render(message);
  persist();
}

function renderBoard() {
  const legal = practice && selected ? chess.moves({square: selected, verbose: true}).map(move => move.to) : [];
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
    cell.setAttribute('aria-disabled', String(!practice));
    cell.tabIndex = practice ? 0 : -1;
    cell.onclick = () => tap(square);
    paintSquare(cell, piece ? `<img src="pieces/${piece.color}${piece.type.toUpperCase()}.svg" alt="" draggable="false">` : '');
  }
}

function tap(square) {
  if (!practice) return;
  if (chess.get(square)?.color === chess.turn()) {
    selected = selected === square ? null : square;
    renderBoard();
    return;
  }
  if (!selected) return;
  const move = chess.moves({square: selected, verbose: true}).find(move => move.to === square && (!move.promotion || move.promotion === 'q'));
  selected = null;
  const candidates = move && tree.get(positionKey(chess))?.get(move.san);
  if (!candidates?.length) {
    renderBoard();
    $('move-note').textContent = move ? 'النقلة قانونية، ولسه مفيش فرع مشروح ليها هنا.' : 'المربع ده مش متاح للقطعة دي.';
    return;
  }
  const choice = candidates.find(candidate => candidate.line === activeLine) ?? candidates[0];
  const note = choice.line.notes?.[choice.ply] ?? choice.line.idea ?? catalog.get(choice.id).summary;
  activeId = choice.id;
  activeLine = choice.line;
  const reply = activeLine.moves[choice.ply];
  const next = choice.ply + Number(Boolean(reply));
  if (next >= activeLine.moves.length) practice = false;
  go(next, `${move.san} · ${note}${reply ? ' رد الخصم ' + reply + '.' : ''}`);
}

function render(message) {
  const opening = catalog.get(activeId);
  setOptions($('opening-line'), opening.lines.map(line => line.id), activeLine.id,
    id => `${opening.name} · ${opening.lines.find(line => line.id === id).name}`);
  renderBoard();
  $('previous-ply').disabled = ply === 0 || practice;
  $('next-ply').disabled = ply === activeLine.moves.length || practice;
  $('train-line').textContent = practice ? 'End Practice' : 'Train This Branch';
  $('move-note').textContent = message || activeLine.notes?.[ply] || activeLine.idea || opening.summary;
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
  $('line-idea').textContent = activeLine.idea ?? opening.summary;
  $('white-plan').textContent = activeLine.white ? `White · ${activeLine.white}` : '';
  $('black-plan').textContent = activeLine.black ? `Black · ${activeLine.black}` : '';
  $('opening-source').hidden = !opening.source;
  if (opening.source) $('opening-source').href = opening.source;
}

$('mastery-color').onclick = event => {
  const color = event.target.closest('[data-color]')?.dataset.color;
  if (color) choose({color, first: state.first, id: openingChoices(color, state.first)[0]});
};
$('first-move').onchange = event => choose({color: 'b', first: event.target.value, id: openingChoices('b', event.target.value)[0]});
$('opening').onchange = event => choose({color: state.color, first: state.first, id: event.target.value});
$('opening-line').onchange = event => {
  activeLine = catalog.get(activeId).lines.find(line => line.id === event.target.value);
  practice = false;
  go(activeLine.start ?? 0);
};
$('save-opening').onclick = () => {
  const {id, first, color} = state;
  if (!saved.some(entry => entry.id === id && entry.color === color && (color === 'w' || entry.first === first))) saved.push({id, first, color});
  renderSaved();
  $('save-status').textContent = persist() ? 'الاختيار اتحفظ.' : 'تعذّر الحفظ في المتصفح.';
};
$('previous-ply').onclick = () => go(ply - 1);
$('next-ply').onclick = () => go(ply + 1);
$('train-line').onclick = () => {
  practice = !practice;
  const start = ply < activeLine.moves.length ? ply : activeLine.start ?? 0;
  const target = practice && start % 2 !== Number(state.color === 'b') ? start + 1 : start;
  if (target >= activeLine.moves.length) practice = false;
  go(target, practice ? 'دورك. اختار القطعة وبعدها المربع.' : '');
};

renderPicker();
renderSaved();
go(state.ply);
