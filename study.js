import {keepView} from './refresh.js';
import {Chess} from './chess.js';
import {drawDiagram} from './diagram.js';
import {groups,examples} from './study-lines.js';

const $ = id => document.getElementById(id);
let lessons;
const names = {r:'رخ',b:'فيل',n:'حصان',p:'بيدق',q:'وزير',k:'ملك'};
const board = $('studyBoard');
let setupLength, title, game, moves, ply, selected, side, last;let mode="learn";function setMode(next, restart=true){mode=next;for(const [id,value] of [["learnMode","learn"],["practiceMode","practice"],["quizMode","quiz"]])$(id).setAttribute("aria-pressed",String(mode===value));$("explanation").hidden=mode!=="learn";$("lead").hidden=mode==="quiz";$("exercise").hidden=mode==="learn";$("next").hidden=mode==="quiz"&&ply===0;if(mode==="learn")$("explanation").open=true;if(restart)reset()}for(const [id,value] of [["learnMode","learn"],["practiceMode","practice"],["quizMode","quiz"]])$(id).onclick=()=>setMode(value);
for (const [group,titles] of Object.entries(groups)) {
  const section = document.createElement('details');
  const heading = document.createElement('summary');
  heading.lang='en'; heading.textContent=group; section.append(heading);
  for (const title of titles) {
    const a=document.createElement('a');
    a.href='#'+encodeURIComponent(title); a.textContent=title; a.lang='en';
    section.append(a);
  }
  $('catalog').append(section);
}
function render() {
  drawDiagram(board,game.fen(),last,side==='b');
  for(const tile of board.children) {
    const sq=tile.dataset.square,p=game.get(sq);
    tile.setAttribute('role','button');
    tile.tabIndex=ply===0 ? 0 : -1;
    tile.setAttribute('aria-disabled',String(ply!==0));
    tile.setAttribute('aria-pressed',String(sq===selected));
    tile.setAttribute('aria-label',sq+(p?' '+names[p.type]+' '+(p.color==='w'?'أبيض':'أسود'):''));
  }
  $('next').disabled=ply>=moves.length;$('next').hidden=mode==='quiz'&&ply===0;
  $('next').textContent=ply?'النقلة التالية':'اعرض النقلة';
}
function selectSquare(square){
  if(selected) board.querySelector('[data-square="'+selected+'"]').setAttribute('aria-pressed','false');
  selected=square;
  if(square) board.querySelector('[data-square="'+square+'"]').setAttribute('aria-pressed','true');
}
function handleSquare(event){
  const tile=event.target.closest('[data-square]');
  if(tile && ply===0) pick(tile.dataset.square);
}
board.onclick=handleSquare;
board.onkeydown=event=>{
  if(event.key==='Enter'||event.key===' '){
    event.preventDefault();
    if(!event.repeat)handleSquare(event);
  }
};
function pick(sq) {
  if(ply!==0)return;
  if(game.get(sq)?.color===side){
    selectSquare(selected===sq ? null : sq);
    $('message').textContent=selected?'اختار المربع اللي هتنقل عليه.':'اختار القطعة اللي هتلعب بيها.';
    return;
  }
  const candidates=selected ? game.moves({square:selected,verbose:true}).filter(m=>m.to===sq) : [];
  const move=candidates.find(m=>m.san===moves[0]) || candidates[0];
  if(!move){$('message').textContent='اختار قطعة من لونك، وبعدها مربع تقدر تروح له.';return}
  if(move.san===moves[0]){advance(true);return}
  if(moves[0].endsWith('#') && move.san.endsWith('#')) {
    last=game.move(move.san); ply=moves.length; selected=null;
    $('message').textContent='أحسنت، دي كمان كش مات · '+move.san;render();return;
  }
  $('message').textContent='النقلة قانونية. جرّب تحقق الهدف المكتوب جنب الرقعة.';selectSquare(null);
}
function advance(solved=false){
  if(ply>=moves.length)return;
  last=game.move(moves[ply++]);selected=null;
  $('message').textContent=(solved?'أحسنت · ':'')+moves.slice(0,ply).join(' · ')+(ply<moves.length?' — اضغط «النقلة التالية» عشان تتابع.':'');
  render();
}
function reset(){
  const [fen,setup,line,question]=examples[title][Number($('variant').value)||0];
  game=fen==='start'?new Chess():new Chess(fen);
  last=null;
  if(setup) for(const m of setup.split(' '))last=game.move(m);
  setupLength=game.history().length; side=game.turn(); moves=line.split(' '); ply=0; selected=null;
  $('question').textContent=(side==='w'?'دور الأبيض. ':'دور الأسود. ')+question;
  $('message').textContent='';render();
}
function openLesson(){
  try{title=decodeURIComponent(location.hash.slice(1))}catch{title=''}
  if(!Object.hasOwn(examples,title))title='Dutch Defense';
  $('lessonTitle').textContent=title;
  renderText();
  $('explanation').open=mode==='learn';
  $('variant').replaceChildren(...examples[title].map((_,i)=>new Option(String(i+1),String(i))));
  $('variantLabel').hidden=examples[title].length===1;
  for(const a of $('catalog').querySelectorAll('a')){
    if(a.textContent===title){a.setAttribute('aria-current','page');a.parentElement.open=true}
    else a.removeAttribute('aria-current');
  }
  setMode(mode);
}
$('variant').onchange=reset;$('next').onclick=()=>advance();$('again').onclick=reset;
addEventListener('hashchange',openLesson);openLesson();

function renderText(){
  if(!lessons)return;
  const [intro,...text]=lessons[title]||['الشرح غير متاح لهذا الدرس.'];$('lead').textContent=intro;
  $('prose').replaceChildren(...text.map(line=>{const p=document.createElement('p');p.textContent=line;return p}));
}
fetch('./study-text.json').then(response=>{
  if(!response.ok)throw new Error();
  return response.json();
}).then(data=>{lessons=data;renderText()}).catch(()=>{
  $('lead').textContent='الشرح ما اتحمّلش. تقدر تجرّب الموقف أو تحدّث الصفحة عشان تقرأه.';
});
$('catalog').addEventListener('click',event=>{
  const link=event.target.closest('a');
  if(!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button!==0)return;
  event.preventDefault();
  if(location.hash!==link.hash){
    history.pushState(null,'',link.hash);
    openLesson();
  }
  const heading=$('lessonTitle');
  heading.tabIndex=-1;
  heading.focus({preventScroll:true});
  heading.scrollIntoView({block:'start'});
});

keepView('lesson', () => ({variant:$('variant').value, history:game.history().slice(setupLength), ply, explanation:$('explanation').open,mode}), saved => {
  if (!examples[title][Number(saved.variant)]) return;
  $('variant').value=saved.variant; setMode(['learn','practice','quiz'].includes(saved.mode)?saved.mode:'learn');
  for (const move of saved.history) last=game.move(move);
  ply=saved.ply; render(); $('explanation').open=saved.explanation;
  $('message').textContent=saved.history.join(' · ');
});
