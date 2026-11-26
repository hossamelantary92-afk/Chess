import {Chess} from './chess.js';
import {squareAt, paintSquare} from './board-cells.js';
import {catalog, firstMoves, openingChoices, familyChoices, normalizeSelection, studyLines, essentialLines, replyGroup, matchingLines, positionKey, buildTree} from './opening-mastery-data.js?v=192';

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
const linked = linkedId ? normalizeSelection({color: linkedColor, first: linkedFirst, id: linkedId, line: query.get('line') ?? '', ply: 0, mode: query.get('mode')}) : null;
// Restore the last lesson unless an explicit lesson link overrides it.
// Explicit lesson links still open their requested color and opening.
const restored = normalizeSelection(stored?.view);
const state = valid(linked) ? linked : valid(restored) ? restored : {color: 'w', first: 'e4', id: '0', line: '', ply: 0, mode: 'learn'};
if (valid(linked)) history.replaceState(history.state, '', location.pathname);
const saved = Array.isArray(stored?.saved) ? stored.saved.map(normalizeSelection).filter(valid) : [];
let activeId = studyLines(state.id,state.color).some(e=>e.id===state.activeId) ? state.activeId : state.id;
let activeLine = catalog.get(activeId).lines.find(line => line.id === state.line) ?? catalog.get(activeId).lines[0];
if(activeId==='open-game'&&state.id==='open-game'){
  const canonical=studyLines(state.id,state.color).find(e=>e.line.moves.join(' ')===activeLine.moves.join(' '));
  if(canonical){activeId=canonical.id;activeLine=canonical.line;}
}
let mode = ['learn','test','dynamic'].includes(state.mode) ? state.mode : 'learn';
let chess, ply, lastMove, selected, practice = mode !== 'learn';
const mistakes = Array.isArray(stored?.mistakes) ? stored.mistakes.map(m=>({...m,origin:normalizeSelection(m.origin)})).filter(m=>valid(m.origin)&&catalog.has(m.activeId)&&Number.isInteger(m.ply)&&Array.isArray(m.prefix)&&m.ply===m.prefix.length&&catalog.get(m.activeId).lines.some(l=>l.id===m.line&&l.moves.length>m.ply&&m.prefix.every((san,i)=>l.moves[i]===san))) : [];
let reviewTarget = typeof state.reviewTarget==='string'?state.reviewTarget:null;

const mistakeKey=m=>m.origin.color+'|'+m.origin.id+'|'+m.prefix.join(' ');
let attempts = practice ? Math.max(0, Number(state.attempts) || 0) : 0;
let correct = practice ? Math.min(attempts, Math.max(0, Number(state.correct) || 0)) : 0;
let finished = practice && Boolean(state.finished);
const mobileLayout = typeof matchMedia==='function' && matchMedia('(max-width:800px)').matches;
let setupCollapsed = state.focusLayoutVersion===1 ? Boolean(state.setupCollapsed) : mobileLayout;
let showAllLines=false;
const performance=stored?.performance&&typeof stored.performance==='object'&&!Array.isArray(stored.performance)?stored.performance:{};
let hintLevel=practice?Math.min(4,Math.max(0,Number(state.hintLevel)||0)):0;
let positionDirty=practice&&Boolean(state.positionDirty);
let visualEnabled=stored?.visualEnabled!==false;
let middleAnswer=null;
const starter=[
 {id:'0',color:'w',first:'e4',note:'الأساس بالأبيض'},
 {id:'open-game',color:'b',first:'e4',note:'الدفاع الأساسي ضد e4'},
 {id:'qgd',color:'b',first:'d4',note:'ضد جامبيت الوزير'},
 {id:'london-black',color:'b',first:'d4',note:'ضد لندن'},
 {id:'2',color:'w',first:'d4',note:'بديل بالأبيض'},
 {id:'5',color:'b',first:'e4',note:'بديل دفاعي'}
];
const board = $('mastery-board');
const pieceNames = {p: 'بيدق', r: 'رخ', n: 'حصان', b: 'فيل', q: 'وزير', k: 'ملك'};

function persist() {
  try {
    localStorage.setItem(key, JSON.stringify({view: {...state, activeId, line: activeLine.id, ply, mode, attempts, correct, finished, setupCollapsed, focusLayoutVersion:1, reviewTarget,hintLevel,positionDirty}, saved, mistakes,performance,visualEnabled}));
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

// Isolate chess notation from surrounding RTL Arabic prose.
function chessText(value) {
  return String(value ?? '').replace(/(?<![\w])(?:\d+\s*\.(?:\.\.)?\s*)?(?:O-O-O|O-O|[KQRBN](?:[a-h1-8]{0,2})x?[a-h][1-8]|[a-h]x[a-h][1-8]|[a-h][1-8])(?:=[QRBN])?[+#]?(?![\w])/g, token => '\u2066'+token+'\u2069');
}

function renderOpeningInfo(opening) {
  const moves = activeLine.moves;
  const ltr = value => '\u2066' + value + '\u2069';
  $('opening-context').textContent = 'بداية الأبيض: ' + ltr(moves[0]) + ' · رد الأسود النموذجي: ' + ltr(moves[1] ?? '—');
  const profile = opening.profile;
  $('profile').textContent = profile?.[0] ?? '';
  $('profile').title = profile?.[1] ?? '';
  const fields = profile ? [['أسلوب اللعب', profile[1]], ['الميزة', profile[2]], ['خد بالك', profile[3]]] : [];
  $('trade-offs').replaceChildren(...fields.flatMap(([label, value]) => [element('dt', label), element('dd', chessText(value))]));
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
  hintLevel=0;positionDirty=false;middleAnswer=null;
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
  mode='test';practice=true;finished=false;attempts=correct=0;hintLevel=0;positionDirty=false;middleAnswer=null;reviewTarget=mistakeKey(m);
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
function scorePosition(san){
  if(reviewTarget)return;
  const k=state.color+'|'+state.id+'|'+mode;
  const positions=performance[k]??(performance[k]={});
  const prefix=activeLine.moves.slice(0,ply).join(' ');
  positions[prefix+'|'+san]=positionDirty||hintLevel?0:1;
  // A wrong or assisted attempt cannot become clean by immediately retrying.
  renderScores();
}
function coverage(id,color,modeName){
  const targets=new Set();
  const sidePly=color==='w'?0:1;
  for(const e of essentialLines(id,color)){
    for(let i=sidePly;i<e.line.moves.length;i+=2){
      const prefix=e.line.moves.slice(0,i).join(' ');
      targets.add(prefix+'|'+e.line.moves[i]);
    }
  }
  const answers=performance[color+'|'+id+'|'+modeName]??{};
  let correct=0,seen=0;
  for(const k of targets){if(answers[k]===0||answers[k]===1){seen++;correct+=answers[k];}}
  return {correct,seen,total:targets.size};
}
function renderScores(){
  const entries=[...starter,...saved,{id:state.id,color:state.color,first:state.first}];
  const seen=new Set();
  $('mastery-scores').replaceChildren(...entries.filter(e=>{const k=e.color+'|'+e.id;if(seen.has(k))return false;seen.add(k);return true;}).map(e=>{
    const fixed=coverage(e.id,e.color,'test'),dynamic=coverage(e.id,e.color,'dynamic');
    const score=Math.round(100*(.6*fixed.correct/Math.max(1,fixed.total)+.4*dynamic.correct/Math.max(1,dynamic.total)));
    const row=element('div','');row.className='mastery-score-row';
    const title=element('div','');title.className='mastery-score-heading';
    title.append(element('strong',catalog.get(e.id).name+' · '+(e.color==='w'?'White':'Black')),element('span',fixed.seen+dynamic.seen?score+'%':'Not tested'));
    const track=element('div','');track.className='mastery-score-track';const fill=element('span','');fill.style.width=score+'%';track.append(fill);
    const meta=element('small','Test '+fixed.correct+'/'+fixed.total+' · Dynamic '+dynamic.correct+'/'+dynamic.total);meta.dir='ltr';
    row.append(title,track,meta);return row;
  }));
}
function renderStarter(){
  $('starter-items').replaceChildren(...starter.map(e=>{
    const b=button('',()=>{choose(e);restartMode('learn');if(mobileLayout)setSetupCollapsed(true);document.querySelector('.mastery-training')?.scrollIntoView({block:'start'});});
    b.append(element('strong',catalog.get(e.id).name),element('small',e.note));return b;
  }));
}
function dynamicMove(san) {
  const prefix=activeLine.moves.slice(0,ply);
  const after=[...prefix,san];
  if(!matchingLines(state.id,after,state.color).length) {
    positionDirty=true;recordMistake(san);render('النقلة قانونية، لكن مش من الردود المدروسة في المسار ده. جرّب تاني.','retry');persist();return;
  }
  scorePosition(san);resolveMistake(prefix,san);correct++;hintLevel=0;positionDirty=false;
  const reply=randomOpponent(after);if(reply)after.push(reply);
  const candidates=matchingLines(state.id,after,state.color),entry=pickLine(candidates);
  useEntry(entry);
  finished=!candidates.some(e=>e.line.moves.length>after.length);
  go(after.length,(finished?'أحسنت! خلّصت المسار. ':'صحيح! ')+san+(reply?' · رد الخصم: '+reply:''),'correct');
}
function explanation() {
  if (!ply) return 'اضغط Next لبدء الافتتاحية ومتابعة هدف كل نقلة.';
  const note = activeLine.notes?.[ply];
  if (note) return note;
  return (lastMove?.san ?? '') + ' — ' + ({p:'راجع تأثير البيدق على المركز وخطوط القطع.',n:'راجع المربعات اللي الحصان بقى يسيطر عليها.',b:'تابع قطر الفيل والهدف منه.',r:'راجع العمود أو الصف اللي الرخ بيدعمه.',q:'حدّد هدف الوزير بعد النقلة.',k:'راجع أمان الملك بعد النقلة.'}[lastMove?.piece] ?? 'راجع أثر النقلة على الوضع.');
}
function go(target, message = '', result = '') {
  middleAnswer=null;
  ply = Math.max(0, Math.min(Number.isInteger(target) ? target : 0, activeLine.moves.length));
  chess = new Chess();
  lastMove = null;
  for (const san of activeLine.moves.slice(0, ply)) lastMove = chess.move(san);
  selected = null;
  render(message, result);
  persist();
}

function expectedMove(){
  if(!practice||finished||chess.turn()!==state.color)return null;
  return chess.moves({verbose:true}).find(m=>m.san===activeLine.moves[ply])??null;
}
function hintCopy(move){
  if(!move)return '';
  const goal=({p:'فكّر في السيطرة على المركز أو تغيير بنية البيادق.',n:'فكّر في تطوير قطعة والسيطرة على مربعات جديدة.',b:'فكّر في زيادة النشاط على الأقطار.',r:'فكّر في الاستفادة من الأعمدة أو الصفوف.',q:'فكّر في زيادة الضغط أو تنسيق القطع.',k:'راجع أمان الملك وتهديدات الخصم.'})[move.piece];
  if(hintLevel===1)return goal;
  if(hintLevel===2)return 'القطعة: '+pieceNames[move.piece];
  if(hintLevel===3)return 'المربع المطلوب: \u2066'+move.to+'\u2069';
  return 'النقلة في الخط المدروس: \u2066'+move.san+'\u2069';
}
function point(square){
  const file='abcdefgh'.indexOf(square[0]),rank=Number(square[1]);
  const x=state.color==='w'?file:7-file,y=state.color==='w'?8-rank:rank-1;
  return [x*40+20,y*40+20];
}
function renderArrow(move){
  const svg=$('visual-arrows');
  if(!move){svg.innerHTML='';return;}
  const [x,y]=point(move.from),[tx,ty]=point(move.to),dx=tx-x,dy=ty-y,len=Math.hypot(dx,dy);
  if(!len){svg.innerHTML='';return;}
  const ux=dx/len,uy=dy/len,ex=tx-ux*8,ey=ty-uy*8,bx=ex-ux*12,by=ey-uy*12;
  svg.innerHTML='<path d="M'+(x+ux*7)+' '+(y+uy*7)+' L'+bx+' '+by+'" stroke="#537e32" stroke-width="5" stroke-linecap="round" opacity=".85" fill="none"/><path d="M'+ex+' '+ey+' L'+(bx-uy*6)+' '+(by+ux*6)+' L'+(bx+uy*6)+' '+(by-ux*6)+' Z" fill="#537e32" opacity=".9"/>';
}
function renderBoard() {
  const teaching=!practice&&visualEnabled&&lastMove;
  const centers=[],targets=[];
  const hint=practice&&hintLevel>=3?expectedMove():null;
  renderArrow(teaching?lastMove:hintLevel>=4?hint:null);
  const legal = practice && !finished && selected ? chess.moves({square: selected, verbose: true}).map(move => move.to) : [];
  for (let index = 0; index < 64; index++) {
    const squareIndex = state.color === 'b' ? 63 - index : index;
    const file = squareIndex % 8;
    const row = Math.floor(squareIndex / 8);
    const square = 'abcdefgh'[file] + (8 - row);
    const piece = chess.get(square);
    const center=teaching&&['d4','e4','d5','e5'].includes(square)&&chess.attackers(square,lastMove.color).includes(lastMove.to);
    const target=teaching&&piece&&piece.color!==lastMove.color&&chess.attackers(square,lastMove.color).includes(lastMove.to);
    if(center&&!target)centers.push(square);
    if(target)targets.push(square);
    const cell = squareAt(board, index);
    cell.className = ['tile', (file + row) % 2 && 'shaded', selected === square && 'picked',
      legal.includes(square) && 'legal', (lastMove?.from === square || lastMove?.to === square) && 'recent',
      center&&!target&&'teach-center', target&&'teach-target',
      hint?.to===square&&'hint-target'].filter(Boolean).join(' ');
    if (index % 8 === 0) cell.dataset.rank = square[1]; else delete cell.dataset.rank;
    if (index >= 56) cell.dataset.file = square[0]; else delete cell.dataset.file;
    cell.setAttribute('aria-label', piece ? `${square} · ${pieceNames[piece.type]} ${piece.color === 'w' ? 'أبيض' : 'أسود'}` : square);
    cell.setAttribute('aria-disabled', String(!practice || finished));
    cell.tabIndex = practice && !finished ? 0 : -1;
    cell.onclick = () => tap(square);
    paintSquare(cell, piece ? `<img src="pieces/${piece.color}${piece.type.toUpperCase()}.svg" alt="" draggable="false">` : '');
  }
  const ltr=value=>'\u2066'+value+'\u2069';
  $('visual-legend').textContent=teaching?[
    'السهم: '+ltr(lastMove.from+' → '+lastMove.to),
    centers.length?'الأخضر: سيطرة على '+ltr(centers.sort().join('، ')):'',
    targets.length?'الذهبي: قطع خصم يهاجمها بعد النقلة على '+ltr(targets.sort().join('، ')):''
  ].filter(Boolean).join(' · '):'السهم: مسار النقلة · الأخضر: السيطرة على المركز · الذهبي: قطع الخصم المهاجَمة بعد النقلة';
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
  if (!move) { renderBoard(); $('move-note').textContent = chessText('النقلة دي غير قانونية. جرّب تاني.'); $('move-note').dataset.result = 'retry'; return; }
  attempts++;
  if(mode==='dynamic'){dynamicMove(move.san);return;}
  const expected = activeLine.moves[ply];
  if (move.san !== expected) {
    positionDirty=true;recordMistake(move.san);
    render('نقلة قانونية، لكنها مش النقلة المطلوبة في التفريعة دي. جرّب تاني. ده مش معناه إنها غلط في مباراة حقيقية.', 'retry');
    persist();
    return;
  }
  scorePosition(move.san);resolveMistake(activeLine.moves.slice(0,ply),move.san);
  correct++;hintLevel=0;positionDirty=false;
  const note = activeLine.notes?.[ply + 1] ?? '';
  const reply = activeLine.moves[ply + 1];
  const next = Math.min(activeLine.moves.length, ply + 1 + Number(Boolean(reply)));
  finished = next >= activeLine.moves.length;
  // If the selected line ends on the opponent's move, it is played automatically too.
  go(next, (finished ? 'أحسنت! خلّصت اختبار الخط. ' : 'صحيح! ') + move.san + (reply ? ' · رد الخصم: ' + reply : '') + (note ? ' · ' + note : ''), 'correct');
}

const strategicPositions={"r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R b KQkq -":{"prompt":"أي قرار يؤمّن الملك الأسود مباشرة قبل التفكير في كسر المركز؟","choices":["O-O","d5"],"correct":0,"reasons":["التبييت قانوني ويؤمّن الملك نسبيًا؛ بعدها قيّم فتح المركز.","d5 كسر مركزي يستحق الحساب، لكنه لا يؤمّن الملك مباشرة."]},"r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -":{"prompt":"أي نقلة تطوّر فيل f8 وتجهز التبييت؟","choices":["b5","Be7"],"correct":1,"reasons":["b5 يكسب مساحة ويهاجم الفيل لكنه لا يطوّر فيل f8.","Be7 يخرج الفيل ويجهز التبييت."]},"rnbqkb1r/pppn1ppp/4p3/3pP3/3P1P2/2N5/PPP3PP/R1BQKBNR b KQkq -":{"prompt":"أي كسر يهاجم قاعدة سلسلة بيادق الأبيض على d4 مباشرة؟","choices":["c5","f6"],"correct":0,"reasons":["c5 يهاجم d4، قاعدة السلسلة d4–e5.","f6 يهاجم رأس السلسلة e5 لا قاعدتها."]},"rn1qkbnr/pp2pppp/2p5/5b2/3P4/6N1/PPP2PPP/R1BQKBNR b KQkq -":{"prompt":"الحصان g3 يهاجم الفيل f5. أي نقلة تحفظ الفيل دون تبادله؟","choices":["e6","Bg6"],"correct":1,"reasons":["e6 لا يزيل الفيل من هجوم الحصان.","Bg6 يحفظ الفيل ويتيح استكمال التطوير."]},"r1bq1rk1/ppp2pbp/2np1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - -":{"prompt":"أي نقلة تغلق التوتر بين بيدقي d4 وe5 وتكسب مساحة؟","choices":["d5","dxe5"],"correct":0,"reasons":["d5 يغلق التوتر المباشر ويهاجم حصان c6؛ بعدها قيّم اللعب على الجناحين.","dxe5 يزيل التوتر بالتبادل لا بإغلاق المركز."]},"rnbq1rk1/ppp1b1pp/3ppn2/5p2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -":{"prompt":"أي نقلة تنافس مركز الأبيض مباشرة ببيدق e؟","choices":["Kh8","e5"],"correct":1,"reasons":["Kh8 لا يهاجم المركز.","e5 ينافس d4؛ احسب التبادلات قبل التنفيذ."]},"r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ -":{"prompt":"أي نقلة تطوّر فيل f1 وتجهز التبييت؟","choices":["Bd3","a3"],"correct":0,"reasons":["Bd3 يطوّر الفيل ويفتح طريق التبييت.","a3 لا يطوّر الفيل."]},"rnbqk2r/ppp2ppp/3bpn2/3p4/3P4/4PNB1/PPP2PPP/RN1QKB1R b KQkq -":{"prompt":"أي نقلة تعرض تبادل الفيلين على g3؟","choices":["c5","Bxg3"],"correct":1,"reasons":["c5 يضغط على d4 لكنه لا يبادل الفيلين.","Bxg3 يزيل فيل الأبيض النشط مقابل فيلك؛ قيّم أثر استرداد البيدق."]}};
function renderMiddlegame(){
  const complete=ply===activeLine.moves.length&&(!practice||finished);
  const authoredPlan=state.color==='w'?activeLine.white:activeLine.black;
  const plan=authoredPlan??'راجع التهديدات والكش والأخذ أولًا، وبعدها قيّم أمان الملك وتطوير القطع والمركز قبل اختيار خطة.';
  $('middlegame-check').hidden=!complete;
  if(!complete)return;
  const checks=[
    ['Threats','هل يوجد كش أو أخذ أو تهديد مباشر؟ افحص نقلات الطرفين قبل وضع خطة.'],
    ['King Safety','هل الملكان آمنان؟ هل فتح المركز يخدمك أم يعرّض ملكك للخطر؟'],
    ['Pawn Structure','حدد البيادق الضعيفة والأعمدة المفتوحة وكسر المركز الممكن. احسب التبادلات قبل دفع البيدق.'],
    ['Worst Piece','حدد أقل قطعك نشاطًا وابحث عن مربع آمن يحسن دورها دون خسارة مادة.'],
    ['Candidate Moves','اختر نقلتين أو ثلاثًا تحقق هدفك، واحسب أقوى رد متوقع قبل الاختيار.']
  ];
  $('middlegame-checklist').replaceChildren(...checks.map(([label,detail])=>{
    const li=document.createElement('li');const strong=document.createElement('strong');strong.textContent=label;li.append(strong,document.createTextNode(' — '+detail));return li;
  }));
  $('middlegame-turn').textContent=chess.turn()===state.color?'دورك الآن: طبّق التقييم قبل اختيار النقلة.':'دور الخصم الآن: توقّع رده قبل تنفيذ خطتك.';
  const strategic=strategicPositions[positionKey(chess)];
  $('strategic-position').hidden=!strategic;
  if(strategic){
    $('strategic-prompt').textContent=strategic.prompt;
    $('strategic-options').replaceChildren(...strategic.choices.map((san,i)=>button(san,()=>{$('strategic-feedback').textContent=(i===strategic.correct?'أحسنت! ':'راجع الهدف. ')+strategic.reasons[i];})));
    $('strategic-feedback').textContent='';
  }
  $('middlegame-prompt').textContent=authoredPlan?'الخط خلص. أنهي خطة تعليمية أنسب للون اللي بتلعب بيه؟':'الخط التدريبي خلص، حتى لو الافتتاحية لسه مستمرة. إيه أول خطوة في تقييم الوضع؟';
  const wrongPlans=['حرّك الوزير مبكرًا بحثًا عن هجوم، حتى لو باقي القطع لسه مش متطورة.','ادفع بيادق جناح الملك من غير حساب تهديد الخصم أو أمان ملكك.'];
  const choices=[...wrongPlans];choices.splice((activeLine.moves.length+Number(state.color==='b'))%3,0,plan);
  $('middlegame-options').replaceChildren(...choices.map(choice=>{
    const b=button(choice,()=>{middleAnswer=choice;renderMiddlegame();});
    if(middleAnswer===choice)b.dataset.answer=choice===plan?'correct':'retry';
    return b;
  }));
  $('middlegame-feedback').textContent=middleAnswer===null?'':middleAnswer===plan?(authoredPlan?'أحسنت! دي خطة تعليمية مناسبة للخط ده. حدد القطعة التي تحتاج تحسينًا، واختر كسر المركز فقط إذا كان آمنًا بعد حساب الرد.':'أحسنت! التقييم الأول يساعدك تختار خطة مناسبة بدل حفظ نقلات زيادة.'):'راجع أمان الملك وتطوير القطع وبنية البيادق. اختار الخطة المرتبطة بالوضع.';
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
  $('toggle-all-lines').hidden=entries.length<=essentials.length;
  $('toggle-all-lines').textContent=showAllLines?'الأساسية فقط':'كل التفريعات';
  $('toggle-all-lines').setAttribute('aria-pressed',String(showAllLines));
  const grouped=new Map();
  const ordered=visible.map(e=>({e,route:replyGroup(state.id,state.color,e)})).sort((a,b)=>Number(Boolean(a.route.external))-Number(Boolean(b.route.external))||(a.route.rank??0)-(b.route.rank??0));
  for(const {e,route} of ordered){
    const key=route.external?'external':'main';
    const label=route.external?route.label:state.color==='w'?'ردود الأسود داخل الافتتاحية':'ردود الأبيض وخطوط الدفاع';
    if(!grouped.has(key))grouped.set(key,{label,items:[]});
    grouped.get(key).items.push({e,route});
  }
  const groups=[...grouped.values()].map(group=>{
    const g=document.createElement('optgroup');g.label=group.label;
    g.append(...group.items.map(({e,route})=>{
      const info=lineIdentity(e.id,e.line);
      let label=optionLabel(e);
      if(route.external)label=info.opening.name+(showAllLines?' · '+info.variation:'');
      else if(state.color==='w'&&state.id==='0'&&e.id==='0'&&e.line.moves[5]==='Bc5'&&!showAllLines)label=info.variation;
      if(route.move&&!label.startsWith(route.move+' '))label=route.move+' · '+label;
      return new Option(label,entryKey(e));
    }));
    return g;
  });
  $('opening-line').replaceChildren(...groups);
  $('opening-line').value=activeId+':'+activeLine.id;
  $('line-field-caption').textContent=state.color==='w'?'رد الأسود والتفريعة':'رد الأبيض والخط';
  $('line-field').hidden = mode==='dynamic'||entries.length <= 1;
  const selectedRoute=selectedEntry?replyGroup(state.id,state.color,selectedEntry):null;
  const moveText=selectedRoute?.move?' ('+'\u2066'+selectedRoute.move+'\u2069'+')':'';
  $('line-context').textContent=selectedRoute?.external
    ? (['0','1','9'].includes(state.id)?'دفاع مختلف قبل دخول الافتتاحية':'مسار مختلف للرد على بداية الأبيض')+moveText+'.'
    : selectedRoute?.key.startsWith('inside:')?'الافتتاحية بدأت بالفعل؛ ده رد الأسود داخلها'+moveText+'.'
    : selectedRoute?.key.startsWith('white:')?'رد الأبيض هو اللي بيحدد المسار التالي'+moveText+'.'
    : '';
  $('line-context').hidden=!$('line-context').textContent;
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
  $('visual-tools').hidden=practice;
  $('visual-toggle').setAttribute('aria-pressed',String(visualEnabled));
  $('visual-legend').hidden=!visualEnabled;
  $('hint-tools').hidden=!practice||finished;
  $('hint-button').disabled=hintLevel>=4;
  $('hint-count').textContent=hintLevel+' / 4';
  $('hint-text').hidden=!practice||finished||!hintLevel;
  $('hint-text').textContent=hintCopy(expectedMove());
  renderMiddlegame();
  renderScores();
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
  $('move-note').textContent = chessText(message || (practice ? (finished ? 'اكتمل الاختبار. راجع الخط أو أعد الاختبار.' : mode==='dynamic'?'العب ردك على الوضع الحالي.':'العب النقلة التالية من الذاكرة.') : explanation()));
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
  $('opening-summary').textContent = chessText(displayOpening.summary);
  $('opening-mistakes').replaceChildren(...(displayOpening.commonMistakes??[]).map(t=>{const li=document.createElement('li');li.textContent=chessText(t);return li;}));
  $('opening-mistakes-card').hidden=practice||!displayOpening.commonMistakes?.length;
  $('line-idea').textContent = chessText(activeLine.idea && activeLine.idea !== displayOpening.summary ? activeLine.idea : '');
  $('line-idea').hidden = !$('line-idea').textContent;
  $('white-plan').textContent = chessText(activeLine.white ?? '');
  $('black-plan').textContent = chessText(activeLine.black ?? '');
  $('white-plan-card').hidden = !activeLine.white;
  $('black-plan-card').hidden = !activeLine.black;
  $('opening-source').hidden = !displayOpening.source;
  if (displayOpening.source) $('opening-source').href = displayOpening.source;
  $('quick-check').hidden=!activeLine.question;
  $('key-point').textContent=chessText(activeLine.notes?.[activeLine.start+1]??activeLine.idea??displayOpening.summary);
  $('review-question').hidden = !activeLine.question;
  $('review-prompt').textContent = chessText(activeLine.question ?? '');
  $('review-answer').textContent = chessText(activeLine.answer ?? '');
  $('review-question').open = false;
  const decision = activeLine.decision;
  $('decision-review').hidden = !decision || practice;
  $('decision-prompt').textContent = chessText(decision?.prompt ?? '');
  $('decision-feedback').textContent = '';
  $('decision-options').replaceChildren(...(decision?.choices ?? []).map(([san,reason]) => {
    const option = button(san, () => { const correct=decision.choices.findIndex(c=>c[0]===san)===decision.correct; $('decision-feedback').textContent = (Number.isInteger(decision.correct)?(correct?'أحسنت! ':'راجع الفكرة. '):'')+reason; });
    option.dir = /[\u0600-\u06ff]/.test(san)?'rtl':'ltr'; return option;
  }));
  $('decision-jump').onclick = () => go(decision?.ply ?? activeLine.start ?? 0);
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
$('visual-toggle').onclick=()=>{visualEnabled=!visualEnabled;render($('move-note').textContent,$('move-note').dataset.result??'');persist();};
$('hint-button').onclick=()=>{if(!expectedMove()||hintLevel>=4)return;hintLevel++;positionDirty=true;render($('move-note').textContent,$('move-note').dataset.result??'');persist();};

renderPicker();
renderSaved();
renderReview();
renderStarter();
if (mode==='dynamic'&&(!Number.isInteger(state.ply)||state.ply<0||state.ply>activeLine.moves.length||!matchingLines(state.id,activeLine.moves.slice(0,state.ply),state.color).length||(state.color==='b'&&state.ply===0))) restartMode(mode);
else if (practice && (state.ply == null || (state.color === 'b' && state.ply === 0))) restartMode(mode);
else go(Number.isInteger(state.ply)?Math.max(0,Math.min(activeLine.moves.length,state.ply)):0);

// Safari can restore a closed/navigated-away page from its back-forward cache.
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
