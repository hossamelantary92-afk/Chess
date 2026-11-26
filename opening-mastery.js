import {Chess} from './chess.js';
import {squareAt, paintSquare} from './board-cells.js';
import {catalog, firstMoves, openingChoices, familyChoices, normalizeSelection, studyLines, essentialLines, matchingLines, positionKey, buildTree} from './opening-mastery-data.js?v=7';

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
const linked = normalizeSelection({color: linkedColor, first: linkedFirst, id: linkedId, line: query.get('line') ?? '', ply: 0, mode: query.get('mode')});
const restored = normalizeSelection(stored?.view);
const state = valid(linked) ? linked : valid(restored) ? restored : {color: 'w', first: 'e4', id: '0', line: '', ply: 0};
if (valid(linked)) history.replaceState(history.state, '', location.pathname);
const saved = Array.isArray(stored?.saved) ? stored.saved.map(normalizeSelection).filter(valid) : [];
let activeId = catalog.has(state.activeId) ? state.activeId : state.id;
let activeLine = catalog.get(activeId).lines.find(line => line.id === state.line) ?? catalog.get(activeId).lines[0];
if(activeId==='open-game'&&state.id==='open-game'){
  const canonical=studyLines(state.id,state.color).find(e=>e.line.moves.join(' ')===activeLine.moves.join(' '));
  if(canonical){activeId=canonical.id;activeLine=canonical.line;}
}
let mode = ['learn','test','dynamic'].includes(state.mode) ? state.mode : 'learn';
let chess, ply, lastMove, selected, practice = mode !== 'learn';
const mistakes = Array.isArray(stored?.mistakes) ? stored.mistakes.map(m=>({...m,origin:normalizeSelection(m.origin)})).filter(m=>valid(m.origin)&&catalog.has(m.activeId)&&Number.isInteger(m.ply)&&Array.isArray(m.prefix)&&m.ply===m.prefix.length&&catalog.get(m.activeId).lines.some(l=>l.id===m.line&&l.moves.length>m.ply&&m.prefix.every((san,i)=>l.moves[i]===san))) : [];
let reviewTarget = typeof state.reviewTarget==='string'?state.reviewTarget:null;
if(reviewTarget&&stored?.view?.id!==state.id)reviewTarget=reviewTarget.replace('|'+stored.view.id+'|','|'+state.id+'|');
const mistakeKey=m=>m.origin.color+'|'+m.origin.id+'|'+m.prefix.join(' ');
let attempts = practice ? Math.max(0, Number(state.attempts) || 0) : 0;
let correct = practice ? Math.min(attempts, Math.max(0, Number(state.correct) || 0)) : 0;
let finished = practice && Boolean(state.finished);
const mobileLayout = typeof matchMedia==='function' && matchMedia('(max-width:800px)').matches;
let setupCollapsed = state.focusLayoutVersion===1 ? Boolean(state.setupCollapsed) : mobileLayout;
let showAllLines=false;
const board = $('mastery-board');
const pieceNames = {p: 'بيدق', r: 'رخ', n: 'حصان', b: 'فيل', q: 'وزير', k: 'ملك'};

function persist() {
  try {
    localStorage.setItem(key, JSON.stringify({view: {...state, activeId, line: activeLine.id, ply, mode, attempts, correct, finished, setupCollapsed, focusLayoutVersion:1, reviewTarget}, saved, mistakes}));
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
  $('setup-toggle-label').textContent = setupCollapsed ? 'تغيير' : 'تم';
  $('toggle-setup').setAttribute('aria-label', setupCollapsed ? 'تغيير الإعدادات' : 'طي الإعدادات');
  $('setup-summary').textContent = (state.color === 'w' ? 'White' : 'Black · '+state.first) + ' · ' + catalog.get(state.id).name;
}
function setSetupCollapsed(value) { setupCollapsed = value; renderSetup(); persist(); }
function renderPicker() {
  for (const button of $('mastery-color').children) {
    button.setAttribute('aria-pressed', button.dataset.color === state.color);
  }
  $('first-move-field').hidden = state.color === 'w';
  $('opening-field-caption').textContent=state.color==='w'?'اختار افتتاحيتك بالأبيض':'اختار دفاعك بالأسود';
  setOptions($('first-move'), firstMoves, state.first, move => move);
  const families=familyChoices(state.color,state.first);
  // One native group per family; all original opening identifiers remain selectable.
  const groups=families.map(family=>{
    const group=document.createElement('optgroup');
    group.label=family.label;
    group.append(...family.openings.map(id=>{
      const opening=catalog.get(id),san=opening.lines[0].moves[state.color==='w'?0:1];
      return new Option(opening.name+' · '+(state.color==='w'?'1.':'1...')+san,id);
    }));
    return group;
  });
  $('opening').replaceChildren(...groups);
  $('opening').value=state.id;
  $('learning-order-note').textContent=state.color==='w'?'ابدأ بالإيطالي لو هتلعب e4 أو لندن لو هتلعب d4. اتعلم خط واحد وخططه الأول. لو الأسود غيّر رده، اختار الرد من قائمة التفريعات أو جرّب Dynamic. مش مطلوب تحفظ كل الافتتاحيات.':state.first==='e4'?'ابدأ بـ Open Game أو Caro–Kann. اتعلم الدفاع ضد ردود الأبيض المختلفة قبل الانتقال لدفاع جديد.':state.first==='d4'?'ابدأ بـ Queen’s Gambit Declined، واتعلم الدفاع ضد London كمان، وبعد كده جرّب Slav وKing’s Indian وDutch.':'ابدأ بأول اختيار في القائمة، واتدرّب على خطوطه قبل الانتقال للدفاع التالي.';
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
    const savedName=catalog.get(entry.activeId??entry.id)?.name??catalog.get(entry.id).name;
    const label = `${savedName} · ${color}`;
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
    copy.append(element('strong',savedName),element('small',color));
    load.append(mark,copy);
    row.append(load, remove);
    return row;
  }));
  if (!saved.length) $('saved-openings').append(element('p', 'اختياراتك هتظهر هنا بعد الحفظ.'));
}

function choose(entry) {
  showAllLines=false;
  Object.assign(state, entry);
  const requested=catalog.get(entry.activeId)?.lines.find(l=>l.id===(entry.line??''));
  const first=studyLines(state.id,state.color)[0];
  activeId=requested?entry.activeId:first.id;
  activeLine=requested??first.line;
  renderPicker();
  restartMode(mode);
}

function pickLine(entries) {
  // Prefer a playable continuation over a line that has already ended.
  return entries.reduce((best,e)=>!best||e.line.moves.length>best.line.moves.length?e:best,null);
}
function useEntry(entry) { activeId=entry.id; activeLine=entry.line; }
function randomOpponent(prefix) {
  const choices=[...new Set(matchingLines(state.id,prefix,state.color).map(e=>e.line.moves[prefix.length]).filter(Boolean))];
  return choices.length?choices[Math.floor(Math.random()*choices.length)]:null;
}
function restartMode(nextMode) {
  mode=nextMode; practice=mode!=='learn';
  attempts = correct = 0;
  finished = false;
  reviewTarget=null;
  if(mode==='dynamic') {
    const prefix=[];
    if(state.color==='b') {const reply=randomOpponent(prefix); if(reply)prefix.push(reply);}
    const entry=pickLine(matchingLines(state.id,prefix,state.color));
    if(!entry) {mode='test'; practice=true; activeId=state.id; activeLine=catalog.get(activeId).lines[0];}
    else {useEntry(entry);go(prefix.length,'دورك. الخصم هيغيّر ردوده حسب المسار المدروس.');return;}
  }
  const start = practice && state.color === 'b' ? Math.min(1, activeLine.moves.length) : 0;
  go(start, practice ? 'دورك. اختار القطعة والمربع من غير ما تشوف النقلات الجاية.' : '');
}
function recordMistake(san) {
  const reviewing=mistakes.find(m=>mistakeKey(m)===reviewTarget);
  if(reviewing){reviewing.san=san;renderReview();return;}
  const origin={id:state.id,first:state.first,color:state.color};
  const prefix=activeLine.moves.slice(0,ply);
  const entry={origin,activeId,line:activeLine.id,ply,prefix,san};
  const existing=mistakes.findIndex(m=>m.origin.id===origin.id&&m.origin.color===origin.color&&m.prefix.join(' ')===prefix.join(' '));
  if(existing>=0)mistakes.splice(existing,1);
  mistakes.unshift(entry); if(mistakes.length>40)mistakes.length=40;
  renderReview();
}
function renderReview() {
  $('review-summary').textContent=mistakes.length?mistakes.length+' موقف محتاج مراجعة. اختار موقف وجرّب النقلة مرة تانية.':'مفيش أخطاء مسجلة للمراجعة حاليًا.';
  $('review-items').replaceChildren(...mistakes.slice(0,10).map(m=>{
    const row=element('div','');
    const copy=element('span','');
    const line=catalog.get(m.activeId).lines.find(l=>l.id===m.line);
    copy.append(element('strong',lineIdentity(m.activeId,line).opening.name),element('small',(m.origin.color==='w'?'White':'Black')+' · '+(m.ply+1)+' · '+m.san));
    row.append(copy,button('Review',()=>reviewMistake(m)));return row;
  }));
}
function reviewMistake(m) {
  Object.assign(state,m.origin);
  activeId=m.activeId; activeLine=catalog.get(activeId).lines.find(l=>l.id===m.line);
  mode='test';practice=true;finished=false;attempts=correct=0;reviewTarget=mistakeKey(m);
  renderPicker();go(m.ply,'راجع الموقف اللي أخطأت فيه. العب النقلة المطلوبة.');
  document.querySelector('.mastery-training')?.scrollIntoView({block:'start'});
}
function resolveMistake(prefix,san) {
  // A retry in the original session is not a separate review. Keep errors
  // until the player explicitly returns to the position from Opening Review.
  if(!reviewTarget)return;
  const i=mistakes.findIndex(m=>mistakeKey(m)===reviewTarget);
  if(i>=0){
    const m=mistakes[i],line=catalog.get(m.activeId).lines.find(l=>l.id===m.line);
    if(m.prefix.join(' ')===prefix.join(' ')&&line?.moves[m.ply]===san){mistakes.splice(i,1);reviewTarget=null;renderReview();}
  }else reviewTarget=null;
}
function dynamicMove(san) {
  const prefix=activeLine.moves.slice(0,ply);
  const after=[...prefix,san];
  if(!matchingLines(state.id,after,state.color).length) {
    recordMistake(san);render('النقلة قانونية، لكن مش من الردود المدروسة في المسار ده. جرّب تاني.','retry');persist();return;
  }
  resolveMistake(prefix,san);correct++;
  const reply=randomOpponent(after);if(reply)after.push(reply);
  const candidates=matchingLines(state.id,after,state.color),entry=pickLine(candidates);
  useEntry(entry);
  finished=!candidates.some(e=>e.line.moves.length>after.length);
  go(after.length,(finished?'أحسنت! خلّصت المسار. ':'صحيح! ')+san+(reply?' · رد الخصم: '+reply:''),'correct');
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
  if(mode==='dynamic'){dynamicMove(move.san);return;}
  const expected = activeLine.moves[ply];
  if (move.san !== expected) {
    recordMistake(move.san);
    render('نقلة قانونية، لكنها مش النقلة المطلوبة في التفريعة دي. جرّب تاني. ده مش معناه إنها غلط في مباراة حقيقية.', 'retry');
    persist();
    return;
  }
  resolveMistake(activeLine.moves.slice(0,ply),move.san);
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
  const entries=studyLines(state.id,state.color);
  if(!entries.some(e=>e.id===activeId&&e.line.id===activeLine.id))entries.unshift({id:activeId,line:activeLine,opponentResponse:activeId!==state.id});
  const entryKey=e=>e.id+':'+e.line.id;
  const optionLabel=e=>{
    const info=lineIdentity(e.id,e.line);
    return e.id===state.id?info.variation:info.opening.name+' · '+info.variation;
  };
  const essentials=essentialLines(state.id,state.color,entries);
  // Preserve the selected line (including old sessions or a branch reached on the board).
  const selectedEntry=entries.find(e=>e.id===activeId&&e.line.id===activeLine.id);
  const visible=showAllLines?entries:[...new Set([...essentials,selectedEntry].filter(Boolean))];
  const primary=visible.filter(e=>!e.opponentResponse), responses=visible.filter(e=>e.opponentResponse);
  $('toggle-all-lines').hidden=entries.length<=essentials.length;
  $('toggle-all-lines').textContent=showAllLines?'الأساسية فقط':'كل التفريعات';
  $('toggle-all-lines').setAttribute('aria-pressed',String(showAllLines));
  const groups=[];
  for(const [label,items] of [['Main lines',primary],['Other Black replies',responses]]){
    if(!items.length)continue;
    const g=document.createElement('optgroup');g.label=label;
    g.append(...items.map(e=>new Option(!showAllLines&&e.opponentResponse?lineIdentity(e.id,e.line).opening.name+' · ...'+e.line.moves[1]:optionLabel(e),entryKey(e))));groups.push(g);
  }
  $('opening-line').replaceChildren(...groups);
  $('opening-line').value=activeId+':'+activeLine.id;
  $('line-field-caption').textContent=state.color==='w'?'التفريعة / رد الأسود':'الخط / رد الأبيض';
  $('line-field').hidden = mode==='dynamic'||entries.length <= 1;
  renderSetup();
  const identity = lineIdentity(activeId, activeLine);
  const displayOpening = identity.opening;
  renderOpeningInfo(displayOpening);
  let shownOpening=displayOpening.name,shownCategory=state.id!==activeId?(state.color==='w'?'White repertoire · '+catalog.get(state.id).name:catalog.get(state.id).name):identity.category.name,shownVariation=identity.variation;
  if(mode==='dynamic') {
    const candidates=matchingLines(state.id,activeLine.moves.slice(0,ply),state.color);
    const names=[...new Set(candidates.map(e=>lineIdentity(e.id,e.line).opening.name))];
    shownOpening=state.id==='open-game'&&(ply<5||names.length!==1)?'Open Game':names.length===1?names[0]:catalog.get(state.id).name;
    shownCategory=state.id==='open-game'?'Open Game':catalog.get(state.id).name;
    const identified=candidates.length===1&&ply>=Math.max(5,(activeLine.start??0)+1);
    const notation=identity.variation.match(/(?:\d+\.{1,3}|\.{3})\s*([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8][+#]?)/g)??[];
    const nameSafe=notation.every(token=>activeLine.moves.slice(0,ply).includes(token.replace(/^\d*\.+\s*/,'')));
    shownVariation=finished||(identified&&nameSafe)?identity.variation:'Dynamic Responses';
    if(!finished)$('profile').textContent='';
  }
  $('active-opening').textContent = shownOpening;
  $('active-category').textContent = shownCategory;
  $('active-category').hidden = shownCategory === shownOpening;
  $('active-variation').textContent = shownVariation;

  $('progress-fill').style.width = (mode==='dynamic'?(finished?100:0):(activeLine.moves.length ? 100 * ply / activeLine.moves.length : 0)) + '%';
  $('progress-fill').parentElement?.classList.toggle('dynamic-progress',mode==='dynamic'&&!finished);
  renderBoard();
  $('previous-ply').disabled = ply === 0 || practice;
  $('next-ply').disabled = ply === activeLine.moves.length || practice;
  $('learn-mode').setAttribute('aria-pressed', String(!practice));
  $('test-mode').setAttribute('aria-pressed', String(mode==='test'));
  $('dynamic-mode').setAttribute('aria-pressed', String(mode==='dynamic'));
  $('session-result').hidden=!practice||!finished;
  $('session-result-title').textContent=mode==='dynamic'?'Dynamic Session Complete':'Test Complete';
  $('session-result-text').textContent='دقة المحاولات: '+(attempts?Math.round(100*correct/attempts):0)+'% · '+correct+' إجابة صحيحة من '+attempts+' محاولة.';
  const pendingMistake=mistakes.find(m=>m.origin.id===state.id&&m.origin.color===state.color)??mistakes.find(m=>m.origin.color===state.color);
  $('review-play').hidden=!pendingMistake;
  $('review-play').onclick=()=>{if(pendingMistake)reviewMistake(pendingMistake);};
  $('learn-controls').hidden = practice;
  $('test-controls').hidden = !practice;
  $('test-score').textContent = 'صحيح: \u2066' + correct + ' / ' + attempts + '\u2069' + (finished ? ' · اكتمل الاختبار' : '');
  $('turn-status').textContent = finished ? 'اختبار مكتمل' : ply === activeLine.moves.length ? 'اكتمل الخط' : (practice ? 'دورك · ' : 'الدور · ') + (chess.turn() === 'w' ? 'White' : 'Black');
  $('line-progress').textContent = mode==='dynamic'&&!finished ? String(ply)+' plies' : ply + ' / ' + activeLine.moves.length;
  $('move-note').dataset.result = result;
  $('move-note').textContent = message || (practice ? (finished ? 'اكتمل الاختبار. راجع الخط أو أعد الاختبار.' : mode==='dynamic'?'العب ردك على الوضع الحالي.':'العب النقلة التالية من الذاكرة.') : explanation());
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
  const scoped=studyLines(state.id,state.color);
  const allowed=entry=>scoped.some(e=>e.id===entry.id&&e.line===entry.line)||entry.id===activeId;
  const choices = options.map(entries => entries.filter(entry=>allowed(entry)&&(opponentTurn||entry.id===activeId))).filter(entries => entries.length);
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
  $('quick-check').hidden=!activeLine.question;
  $('key-point').textContent=activeLine.notes?.[activeLine.start+1]??activeLine.idea??displayOpening.summary;
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
  const [id,...parts]=event.target.value.split(':');
  const line=catalog.get(id)?.lines.find(l=>l.id===parts.join(':'));
  if(!line)return;
  activeId=id;activeLine=line;restartMode(mode);
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
$('toggle-all-lines').onclick = () => {showAllLines=!showAllLines;render($('move-note').textContent,$('move-note').dataset.result??'');};
function selectMode(nextMode) {
  if(mode!==nextMode) {
    if(mode==='dynamic'&&nextMode!=='dynamic') renderPicker();
    restartMode(nextMode);
  }
  if (typeof matchMedia === 'function' && matchMedia('(max-width:800px)').matches) setSetupCollapsed(true);
}
$('learn-mode').onclick = () => selectMode('learn');
$('test-mode').onclick = () => selectMode('test');
$('dynamic-mode').onclick = () => selectMode('dynamic');
$('retry-test').onclick = () => restartMode(mode);
$('review-learn').onclick = () => selectMode('learn');
$('start-ply').onclick = () => go(0);

renderPicker();
renderSaved();
renderReview();
if (mode==='dynamic'&&(!Number.isInteger(state.ply)||!matchingLines(state.id,activeLine.moves.slice(0,state.ply),state.color).length||(state.color==='b'&&state.ply===0))) restartMode(mode);
else if (practice && (state.ply == null || (state.color === 'b' && state.ply === 0))) restartMode(mode);
else go(state.ply);
