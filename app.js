import {keepView} from './refresh.js';
import {squareAt, paintSquare} from './board-cells.js';
import {Chess} from './chess.js';
import {openingBranches} from './opening-branches.js?v=6';
import {openings} from './opening-library.js';
import {lessons as academyLessons} from './academy-data.js?v=2';
const $=s=>document.querySelector(s), files='abcdefgh';
const buttonIcons={home:'M3 10 12 3l9 7M5 9v12h14V9M9 21v-7h6v7',settings:'M4 7h16M4 17h16M8 4v6M16 14v6',next:'m9 6 9 6-9 6Z M5 6v12',previous:'m15 6-9 6 9 6Z M19 6v12',reset:'M4 10a8 8 0 1 1 1 8M4 4v6h6',flip:'M4 7h16l-4-4M20 17H4l4 4',grid:'M3 3h18v18H3ZM3 9h18M3 15h18M9 3v18M15 3v18',hint:'M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0l-1 3H9Z',play:'m9 5 11 7-11 7Z',chart:'M4 20V10M12 20V4M20 20v-7',close:'m6 6 12 12M6 18 18 6',check:'m5 12 4 4L19 6'};
function premiumButton(b,label,icon){b.classList.add('premium-btn');b.innerHTML=(icon?`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${buttonIcons[icon]}"/></svg>`:'')+`<span>${label}</span>`;return b}
function polishAction(b,text){const label=text.replace(/[←→↺⟳✓]/g,'').trim();const icon=/تلميح/.test(label)?'hint':/إعادة|جديد|المحاولة/.test(label)?'reset':/فهمت/.test(label)?'check':/تراجع/.test(label)?'previous':'play';return premiumButton(b,label,icon)}
const mates=[
['مات الصف الأخير','6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1','Re8#','البيادق تحبس الملك على الصف الأخير. استغل العمود المفتوح بالرخ.'],
['مات السُلّم','7k/R7/8/8/8/8/8/1R4K1 w - - 0 1','Rb8#','رخ يحرم الملك من صف الهروب، والآخر يوجّه الكش على الصف الأخير.'],
['مات الوزير المحمي','7k/8/5KQ1/8/8/8/8/8 w - - 0 1','Qg7#','قرّب الوزير من الملك، بشرط أن تكون القطعة محمية.'],
['المات المخنوق','6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1','Nf7#','قطع الخصم تحبس ملكه، والحصان يقفز ليعطي المات.'],
['مات أنستازيا','5r1k/4N1p1/8/8/8/8/R7/1K6 w - - 0 1','Rh2#','الحصان يسيطر على g6 وg8، والرخ يهاجم على عمود h.'],
['مات بقطعتين فيل','7k/5K2/7B/8/8/3B4/8/8 w - - 0 1','Bg7#','الفيلان يغطيان الأقطار والملك يمنع الهرب: وجّه فيل h6 إلى g7.'],
['مات الهدية على h7','5rk1/5ppp/8/7Q/8/3B4/8/6K1 w - - 0 1','Qxh7#','الفيل يحمي مربع h7. افحص حماية الوزير ومربعات هروب الملك.'],
['مات بالرّخ والملك','7k/5K2/8/8/8/8/8/R7 w - - 0 1','Rh1#','الملك يقطع مربعات الهروب، والرخ يوجّه الكش على حافة الرقعة.']];
const tactics=[
['الشوكة','6k1/4q3/8/5N2/8/8/8/6K1 w - - 0 1','Nxe7+','الحصان يأخذ الوزير ويعطي كش في الوقت نفسه. تعدّد التهديدات هو أساس الشوكة.'],
['التثبيت','4k3/4r3/8/8/8/8/8/K3R3 w - - 0 1','Rxe7+','الرخ الأسود مثبت أمام الملك، والأبيض يستطيع أخذه بالكش.'],
['السيخ','8/8/8/8/8/8/4k2r/K2R4 w - - 0 1','Re1+','ضع الرخ على عمود e. الملك يتعرض للكش، وخلفه رخ على e2؟ هنا الرخ على h2: هذا تدريب على الكش النشط.'],
['الهجوم المكتشف','4k3/8/8/8/8/4B3/8/K3R3 w - - 0 1','Bf4+','حرّك الفيل ليفتح خط الرخ نحو ملك الخصم.'],
['إزالة المدافع','6k1/5p2/6q1/8/2B5/8/8/K7 w - - 0 1','Bxf7+','خذ البيدق المدافع عن الوزير مع كش، ثم ابحث عن الخطوة التالية.'],
['كش مزدوج','4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1','Bb5+','الفيل والرخ يهاجمان الملك معًا بعد إخلاء عمود e.']];
// Each exercise uses a legal position and an explicit educational target.
tactics[0]=['الشوكة','6k1/8/4q3/8/5N2/8/8/6K1 w - - 0 1','Nxe6','خذ الوزير بالحصان. بعد النقلة يهاجم الحصان مربعي d8 وg7؛ تعرّف في الشرح على فكرة الهجوم المزدوج.'];
tactics[0]=['الشوكة','4k3/8/3q4/8/4N3/8/8/6K1 w - - 0 1','Nxd6+','الحصان يأخذ الوزير على d6 ويعطي كش للملك على e8.'];
tactics[2]=['السيخ','4r3/8/4k3/8/8/8/8/K2R4 w - - 0 1','Re1+','ضع الرخ على e1: الملك على e6 يتعرض للكش، والرخ على e8 خلفه.'];
tactics[4]=['إزالة المدافع','6k1/5p2/6q1/8/2B5/8/8/K7 w - - 0 1','Bxf7+','خذ بيدق f7 بالكش لإزالة قطعة تدافع عن g6. هذا تدريب على التعرف إلى المدافع، وليس تسلسلًا يضمن ربح الوزير.'];
const endings=[['مات بالوزير','7k/8/5KQ1/8/8/8/8/8 w - - 0 1','Qg7#','حاصر الملك تدريجيًا وقرّب ملكك. تجنب الخنق: إذا لم يكن الملك في كش ولا يملك نقلة قانونية فالوضع تعادل.'],['مات بالرخ','7k/5K2/8/8/8/8/8/R7 w - - 0 1','Rh1#','قرّب ملكك لدعم الرخ، وادفع الملك إلى الحافة. الرخ وحده يحتاج مساعدة الملك.'],['ترقية البيدق','7k/4P3/6K1/8/8/8/8/8 w - - 0 1','e8=Q#','أوصل البيدق إلى الصف الثامن. الترقية لوزير شائعة، لكنها ليست الاختيار الصحيح في كل وضع.'],['المعارضة','4k3/8/4K3/4P3/8/8/8/8 w - - 0 1','Kf6','الملكان بينهما مربع واحد. في هذا الوضع تحرّك إلى f6 لتهديد التقدم من الجناح. فكّر دائمًا في صاحب الدور ومربعات البيدق المفتاحية.']];
const basics=[['القطع وقيمتها','البيدق 1، الحصان والفيل نحو 3، الرخ 5، والوزير 9. دي قيم تقريبية؛ نشاط القطعة وأمان الملك قد يكونان أهم. الملك لا يُؤخذ: الهدف كش مات.'],['الحركة والكش','الفيل قطريًا، الرخ أفقيًا ورأسيًا، الوزير يجمع الحركتين، والحصان على شكل L ويقفز. الملك مربع واحد. ممنوع ترك ملكك في كش. جرّب تحريك القطع قانونيًا على الرقعة.'],['التبييت','يتحرك الملك مربعين نحو الرخ، ويقفز الرخ للجانب الآخر. يلزم ألا يكون أي منهما تحرك، وأن يخلو الطريق؛ ولا يجوز التبييت من كش أو عبر مربع مهاجَم أو إليه.'],['الترقية والأخذ بالتجاوز','البيدق يترقى عند بلوغ آخر صف إلى وزير أو رخ أو فيل أو حصان. الأخذ بالتجاوز متاح مباشرة بعد تقدم بيدق الخصم مربعين واستقراره بجانب بيدقك بالشروط القانونية.'],['التعادل','الخنق: لا نقلة قانونية والملك ليس في كش. توجد أيضًا أوضاع ميتة، واتفاق، ومطالبة بتكرار الوضع ثلاث مرات أو قاعدة 50 نقلة؛ تفاصيل المطالبة تختلف عن التعادل التلقائي.']];
// Keep lesson indices stable for saved progress and direct links.
const lessonOrder={
  openings:[3,0,1,9,6,4,5,8,10,11,12,2,7],
  endings:[1,0,3,2]
};
function lessonIndices(key,lessons){
  return lessonOrder[key]??lessons.map((_,index)=>index);
}
function nextLesson(){
  const order=lessonIndices(section,collection());
  idx=order[(order.indexOf(idx)+1)%order.length];
  load();
}
const paths=[['openings','♞','الافتتاحيات','OPENING LAB'],['tactics','♝','التكتيكات','TACTICS'],['endings','♜','النهايات','ENDGAMES'],['mates','♛','القفلات','CHECKMATE'],['basics','♙','الأساسيات','FIRST STEPS'],['vision','◈','إتقان الرقعة','BOARD VISION']];
let saved;try{saved=JSON.parse(localStorage.getItem('rook-progress')||'{}')}catch{saved={}}let stats={correct:0,attempts:0,lessons:[],times:[],weak:{},...saved};let section='openings',idx=0,chess=new Chess(),flipped=false,coords=true,selected=null,ply=0,practice=false,side='w',target='',visionMode='find',started=0,deadline=0,timer=null,score=0,visionHighlight='',total=0;
let visionResult=null,visionLocked=false,visionAdvance=null,visionFlash=null;
function completedAcademyLessons(){
  try{
    const savedAcademy=JSON.parse(localStorage.getItem('rook-academy')||'{}');
    const passed=new Set(Array.isArray(savedAcademy?.passed)?savedAcademy.passed:[]);
    return academyLessons.filter(lesson=>passed.has(lesson.id)).length;
  }catch{
    return 0;
  }
}
function completedLessons(){
  return new Set(Array.isArray(stats.lessons)?stats.lessons:[]).size+completedAcademyLessons();
}
function persist(){try{localStorage.setItem('rook-progress',JSON.stringify(stats))}catch{}$('#stats').textContent=`${completedLessons()} دروس مكتملة · ${stats.correct} إجابات صحيحة`}
function complete(){const key=section+':'+idx;if(!stats.lessons.includes(key))stats.lessons.push(key);persist()}
function feedback(t){$('#feedback').textContent=t}
function action(text,fn,primary=false){const b=document.createElement('button');polishAction(b,text);if(primary)b.classList.add('primary');b.onclick=fn;$('#actions').append(b);return b}
function renderPaths(){['#paths','#nav'].forEach((el,n)=>{$(el).innerHTML='';paths.slice(0,n?4:6).forEach(([key,icon,name,en])=>{const b=document.createElement('button');b.className=section===key?'active':'';b.setAttribute('aria-pressed',section===key); b.innerHTML=n?name:`<b>${icon}</b><span>${name}<small>${en}</small></span>`;b.onclick=()=>{section=key;idx=lessonOrder[key]?.[0]??0;load()};$(el).append(b)})})}
function collection(){return section==='openings'?openings:section==='mates'?mates:section==='tactics'?tactics:section==='endings'?endings:basics}
function load(){$('#pieceGlossary').hidden=section!=='basics'||idx!==0;clearVisionResponse();$('#extraAnswers')?.remove();clearInterval(timer);deadline=0;renderPaths();$('#selectors').innerHTML='';$('#extra').innerHTML='';$('#actions').innerHTML='';$('#moves').textContent='';feedback('');selected=null;ply=0;practice=false;visionHighlight='';const p=paths.find(x=>x[0]===section);$('#category').textContent=p[3];$('#title').textContent=p[2];if(section==='vision'){loadVision();return}const lessons=collection();lessonIndices(section,lessons).forEach(i=>{const b=document.createElement('button');b.textContent=lessons[i][0];b.className=i===idx?'active':'';b.setAttribute('aria-pressed',i===idx);b.onclick=()=>{idx=i;load()};$('#selectors').append(b)});const d=collection()[idx];chess=new Chess(section==='mates'||section==='tactics'||section==='endings'?d[1]:undefined);$('#task').textContent=d[0];$('#desc').textContent=section==='openings'?d[3]:section==='basics'?d[1]:d[3];if(section==='openings'){const sel=document.createElement('select');sel.innerHTML='<option value="w">أتدرّب بالأبيض</option><option value="b">أتدرّب بالأسود</option>';sel.value=side;sel.onchange=()=>{side=sel.value;resetOpening()};$('#extra').append(sel);action('شاهد النقلة ←',nextMove,true);action('تدرّب بنفسك',()=>{practice=true;resetOpening();feedback('دورك: العب النقلة المدروسة على الرقعة.')});action('تلميح',hint)}else if(section==='basics'){action('فهمت الدرس ✓',()=>{complete();feedback('أحسنت! جرّب الدرس التالي. خُد وقتك على الرقعة.');},true);action('تراجع نقلة',()=>{chess.undo();renderBoard()})}else{action('تلميح',hint);action('اعرض الحل',()=>{const move=chess.move(d[2]);if(move){renderBoard();feedback(`الحل: ${d[2]} — أعد التدريب لتجرب بنفسك.`);$('#actions').innerHTML='';action('أعد المحاولة',load,true)}})}renderBoard();persist()}
let openingBranchId='';
function openingBranch(){return openingBranches[idx]?.lines.find(branch=>branch.id===openingBranchId)}
function line(){return (openingBranch()?.moves??openings[idx][2]).split(' ')}
function resetOpening(){
  chess.reset();ply=0;selected=null;
  const moves=line();
  const start=practice&&openingBranchId?(openingBranch()?.start??0):0;
  for(;ply<start;ply++)chess.move(moves[ply]);
  if(practice&&chess.turn()!==side&&ply<moves.length)chess.move(moves[ply++]);
  flipped=side==='b';renderBoard();renderMoves();
}
function openingRoute(index,mode,branch=''){
  return `#train/openings/${index}/${mode?'practice':'learn'}${branch?'/'+branch:''}`;
}
function renderMoves(){$('#moves').innerHTML=line().map((m,i)=>`${i%2===0?Math.floor(i/2)+1+'. ':''}${i===ply-1?'<strong>'+m+'</strong>':m}`).join(' ')}
function nextMove(){if(ply>=line().length){complete();feedback('اكتمل الخط النموذجي. ابدأ التدريب لتثبيت النقلات.');return}chess.move(line()[ply++]);renderBoard();renderMoves();feedback(openingExplanation());if(ply===line().length)complete()}
function hint(){if(section==='openings'){feedback(`النقلة المدروسة: ${line()[ply]||'اكتمل الخط'}`)}else{const d=collection()[idx],m=new Chess(d[1]).move(d[2]);selected=m.from;renderBoard();feedback('القطعة المحددة هي بداية الحل. فكّر في المربع الذي ستذهب إليه.')}}
const glyph={wk:'♚',wq:'♛',wr:'♜',wb:'♝',wn:'♞',wp:'♟',bk:'♚',bq:'♛',br:'♜',bb:'♝',bn:'♞',bp:'♟'};
function renderBoard(){const fs=flipped?[...files].reverse():[...files],rs=flipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];let legal=[];if(selected&&section!=='vision')legal=chess.moves({square:selected,verbose:true}).map(m=>m.to);rs.forEach((r,ri)=>fs.forEach((f,fi)=>{const sq=f+r,b=squareAt($('#board'),ri*8+fi);const dark=(files.indexOf(f)+r)%2===1;let markup='';b.className=(dark?'dark ':'')+(sq===selected?'selected ':'')+(sq===visionHighlight?'target ':'')+(legal.includes(sq)?'legal':'')+(section==='vision'&&visionResult?.square===sq?' answer-'+visionResult.kind:'');b.setAttribute('aria-label',sq);b.setAttribute('role','gridcell');if(section!=='vision'){const p=chess.get(sq);if(p)markup=`<img class="piece ${p.color==='w'?'white':''}" src="pieces/${p.color+p.type.toUpperCase()}.svg" alt="${p.color==='w'?'أبيض':'أسود'} ${ {k:'ملك',q:'وزير',r:'رخ',b:'فيل',n:'حصان',p:'بيدق'}[p.type]}" draggable="false">`}if(coords&&(ri===7||fi===0))markup+=`${fi===0?'<small class="rank">'+r+'</small>':''}${ri===7?'<small class="file">'+f+'</small>':''}`;if(section==='vision'&&visionResult?.square===sq){markup+=`<span class="square-verdict" aria-hidden="true">${visionResult.kind==='correct'?'✓':'×'}</span>`;b.setAttribute('aria-label',sq+(visionResult.kind==='correct'?' — إجابة صحيحة':' — إجابة خاطئة'))}b.onclick=()=>clickSquare(sq);paintSquare(b,markup)}));$('#boardLabel').textContent=section==='vision'?(flipped?'منظور الأسود':'منظور الأبيض'):(chess.turn()==='w'?'الأبيض':'الأسود')+' يلعب'}
function clickSquare(sq){if(section==='vision'){if(visionMode==='find')answerVision(sq===target,sq);return}if(section==='openings'&&!practice){feedback('اختَر «شاهد النقلة» للشرح أو «تدرّب بنفسك» لتحريك القطع.');return}if(!selected){if(chess.get(sq)?.color===chess.turn()){selected=sq;renderBoard()}return}if(chess.get(sq)?.color===chess.turn()){selected=sq;renderBoard();return}let move;const previous=chess.fen();try{move=chess.move({from:selected,to:sq,promotion:'q'})}catch{}selected=null;if(!move){feedback('النقلة غير قانونية. اختَر قطعة ثم مربعًا مسموحًا.');renderBoard();return}if(section==='basics'){feedback(move.san);renderBoard();return}stats.attempts++;const expected=section==='openings'?line()[ply]:collection()[idx][2];if(move.san!==expected&&!(section==='mates'&&chess.isCheckmate())){chess.load(previous);const englundTrap=section==='openings'&&ply===6&&!openingBranchId&&expected==='Nc3'&&move.san==='Bf4'&&openings[idx][1]==='Englund Gambit';
feedback(englundTrap?'بعد Bf4، الأسود يقدر يلعب Qb4+ بكش ويهاجم الفيل على f4 وبيدق b2. جرّب تطوير الحصان إلى c3.':section==='openings'?'نقلة قانونية، لكنها خارج الخط الذي نتدرّب عليه. جرّب تاني أو اطلب تلميحًا.':'نقلة قانونية، لكن جرّب نقلة تحقق فكرة التمرين.');persist();renderBoard();return}stats.correct++;if(section==='openings'){ply++;if(ply<line().length){chess.move(line()[ply++])}renderMoves();if(ply>=line().length){complete();feedback('أحسنت! أتقنت هذا الخط. جرّبه باللون الآخر.')}else feedback('صحيح! الخصم ردّ، ودورك تكمل.')}else{complete();feedback(chess.isCheckmate()?'كش مات! قفلة ممتازة. ♛':'صحيح! نفّذت فكرة التمرين.');$('#actions').innerHTML='';action('التمرين التالي ←',nextLesson,true);action('إعادة',load)}persist();renderBoard()}
function loadVision(){$('#task').textContent='اعرف المربع من أول نظرة';$('#desc').textContent='تدرّب على إحداثيات الرقعة. ابدأ بالحروف والأرقام، ثم أخفِها وزوّد التحدي. مراجعتك تشمل المربعات اللي بتغلط فيها.';$('#extra').innerHTML='<select id="mode"><option value="find">فين المربع؟</option><option value="name">اسم المربع إيه؟</option><option value="color">لون المربع؟</option></select><select id="duration"><option value="0">تدريب حر</option><option value="30">تحدي 30 ثانية</option><option value="60">تحدي 60 ثانية</option></select><select id="orientation"><option value="w">منظور الأبيض</option><option value="b">منظور الأسود</option><option value="mix">منظور عشوائي</option></select>';$('#mode').value=visionMode;$('#mode').onchange=()=>{visionMode=$('#mode').value;newVision()};$('#orientation').onchange=newVision;action('ابدأ التدريب',startVision,true);action('السؤال التالي',newVision);newVision()}
function startVision(){clearInterval(timer);score=0;total=0;const dur=Number($('#duration').value);deadline=dur?Date.now()+dur*1000:0;newVision();if(dur)timer=setInterval(()=>{const remain=Math.ceil((deadline-Date.now())/1000);if(remain<=0){clearInterval(timer);clearVisionResponse();deadline=0;$('#task').textContent='انتهى التحدي!';$('#feedback').textContent=`${score} إجابات صحيحة من ${total} محاولات. اضغط ابدأ لتجربة جديدة.`;$('#extraAnswers')?.remove();target='';visionHighlight='';renderBoard()}else $('#boardLabel').textContent=`متبقي ${remain} ثانية · ${score} صحيح`},250)}
function newVision(){clearVisionResponse();const all=[...files].flatMap(f=>Array.from({length:8},(_,i)=>f+(i+1)));const weak=Object.keys(stats.weak).filter(k=>stats.weak[k]>0);target=Math.random()<.4&&weak.length?weak[Math.floor(Math.random()*weak.length)]:all[Math.floor(Math.random()*64)];const o=$('#orientation')?.value;flipped=o==='b'||(o==='mix'&&Math.random()<.5);visionHighlight=visionMode==='name'?target:'';started=Date.now();$('#task').textContent=visionMode==='find'?`فين المربع ${target}؟`:visionMode==='color'?`لون المربع ${target}؟`:'المربع المحدد اسمه إيه؟';$('#extraAnswers')?.remove();if(visionMode!=='find'){const box=document.createElement('div');box.id='extraAnswers';box.style.cssText='display:flex;gap:7px;flex-wrap:wrap;margin-top:12px';const options=visionMode==='color'?['فاتح','داكن']:[target,...all.filter(sq=>sq!==target).sort(()=>Math.random()-.5).slice(0,5)].sort(()=>Math.random()-.5);options.forEach(v=>{const b=document.createElement('button');b.textContent=v;b.onclick=()=>{const isDark=(files.indexOf(target[0])+Number(target[1]))%2===1;answerVision(visionMode==='name'?v===target:v===(isDark?'داكن':'فاتح'))};box.append(b)});$('#extra').after(box)}feedback('');renderBoard()}
function clearVisionResponse(){clearTimeout(visionAdvance);clearTimeout(visionFlash);visionAdvance=null;visionFlash=null;visionResult=null;visionLocked=false}
function answerVision(ok,square=target){if(!target||visionLocked)return;visionLocked=true;visionResult={square,kind:ok?'correct':'wrong'};stats.attempts++;total++;if(ok){stats.correct++;score++;stats.times.push(Date.now()-started);if(stats.times.length>500)stats.times.shift();stats.weak[target]=Math.max(0,(stats.weak[target]||0)-1);persist();feedback('صحيح! ✓');renderBoard();visionAdvance=setTimeout(()=>{if(section==='vision'&&target)newVision()},1200)}else{stats.weak[target]=(stats.weak[target]||0)+1;persist();feedback('إجابة غير صحيحة × — جرّب تاني.');renderBoard();visionFlash=setTimeout(()=>{visionResult=null;visionLocked=false;if(section==='vision')renderBoard()},1000)}}
$('#flip').onclick=()=>{flipped=!flipped;renderBoard()};$('#coords').onclick=()=>{coords=!coords;renderBoard()};$('#reset').onclick=()=>{if(section==='openings'&&practice)resetOpening();else load()};$('#progress').onclick=()=>{const avg=stats.times.length?(stats.times.reduce((a,b)=>a+b,0)/stats.times.length/1000).toFixed(1):'—';const weak=Object.entries(stats.weak).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]).join('، ')||'لا توجد بعد';$('#report').innerHTML=`الدروس المكتملة: <b>${completedLessons()}</b> · منها <b>${completedAcademyLessons()}</b> في مسار التأسيس<br>الإجابات الصحيحة: <b>${stats.correct}</b><br>دقة المحاولات: <b>${stats.attempts?Math.round(stats.correct/stats.attempts*100):0}%</b><br>متوسط وقت الإجابة الصحيحة للمربعات: <b>${avg} ثانية</b><br>مربعات للمراجعة: <b>${weak}</b>`;$('#modal').showModal()};$('#close').onclick=()=>$('#modal').close();$('#modal').onclick=e=>{if(e.target===$('#modal'))$('#modal').close()};
export {openings,mates,tactics,endings};

// Focused training and home navigation.
let isTraining=false, setupSection='openings', lastSession=null;
try{lastSession=JSON.parse(localStorage.getItem('rook-session')||'null')}catch{}
const pathSummary={openings:'اختار افتتاح ولون التدريب. لو الدرس فيه أكتر من خط، تقدر تختار تفريعة من داخل الدرس.',mates:'٨ قفلات لتتعرّف على أنماط كش مات.',tactics:'تدرّب على الشوكة والتثبيت والهجوم المكتشف.',vision:'احفظ المربعات من منظور الأبيض والأسود.',endings:'ابدأ بالمات بالرخ والوزير، ثم تدرّب على المعارضة وترقية البيدق.',basics:'ابدأ بالقواعد وحركة القطع والمفاهيم الأساسية.'};
const baseLoad=load,baseRenderBoard=renderBoard,baseFeedback=feedback,basePersist=persist;
function saveSession(){if(!isTraining)return;lastSession={section,idx,ply,side,practice,...(section==='openings'&&openingBranchId?{branch:openingBranchId}:{})};try{localStorage.setItem('rook-session',JSON.stringify(lastSession))}catch{}}
persist=function(){basePersist();renderHomeStats()};
feedback=function(t){baseFeedback(t);if(section==='openings')$('#moveCaption').textContent=t||'ابدأ بالنقلة الأولى وشاهد فكرتها على الرقعة.'};
function currentMove(){return chess.history({verbose:true}).at(-1)}
function paintArrow(){const svg=$('#arrows');svg.innerHTML='';$('#board').querySelectorAll('.last-from,.last-to').forEach(b=>b.classList.remove('last-from','last-to'));if(section==='vision')return;const m=currentMove();if(!m)return;$('#board').querySelector(`[aria-label="${m.from}"]`)?.classList.add('last-from');$('#board').querySelector(`[aria-label="${m.to}"]`)?.classList.add('last-to');const point=sq=>{let x=files.indexOf(sq[0]),y=8-Number(sq[1]);if(flipped){x=7-x;y=7-y}return [x*100+50,y*100+50]};const [x,y]=point(m.from),[xx,yy]=point(m.to);const dx=xx-x,dy=yy-y,len=Math.hypot(dx,dy),ex=xx-dx/len*21,ey=yy-dy/len*21;svg.innerHTML=`<defs><marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#e8b34e"/></marker></defs><line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="#3a230f" stroke-width="18" opacity=".35"/><line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="#e8b34e" stroke-width="11" stroke-linecap="round" opacity=".85" marker-end="url(#arrowhead)"/>`}
renderBoard=function(){baseRenderBoard();paintArrow();updatePlayback();updateOpeningPlan();saveSession()};
function openingExplanation(){
  const branch=openingBranch();
  if(!ply)return branch?'تابع النقلات من البداية أو اختار تفريعة مختلفة.':openings[idx][3];
  const note=branch?.notes?.[ply];
  if(note)return note;
  const main=openings[idx][2].split(' ');
  const matchesMain=!branch?.moves||line().slice(0,ply).every((san,index)=>san===main[index]);
  if(matchesMain&&openings[idx][4]?.[ply-1])return openings[idx][4][ply-1];
  const m=currentMove();
  return `${m?.san||line()[ply-1]} — ${{p:'راجع أثر دفع البيدق على المركز وخطوط القطع.',n:'افحص المربعات اللي الحصان بقى يسيطر عليها.',b:'تابع القطر الجديد للفيل وأهدافه.',r:'شوف الرخ بيدعم أنهي مربع أو عمود.',q:'حدّد الهدف اللي الوزير بقى يضغط عليه.',k:'راجع أمان الملك بعد النقلة.'}[m?.piece]||'راجع أثر النقلة على وضع القطع.'}`;
}
function jumpTo(n){if(practice&&isTraining)history.replaceState(null,'',openingRoute(idx,false,openingBranchId));practice=false;chess.reset();ply=0;selected=null;for(let i=0;i<Math.max(0,Math.min(n,line().length));i++){chess.move(line()[i]);ply++}renderBoard();renderMoves();feedback(openingExplanation());renderOpeningActions()}
renderMoves=function(){if(section!=='openings')return;$('#moves').innerHTML='';const start=document.createElement('button');start.textContent='البداية';start.className=ply===0?'current':'';start.onclick=()=>jumpTo(0);$('#moves').append(start);line().forEach((m,i)=>{const b=document.createElement('button');b.textContent=`${i%2===0?Math.floor(i/2)+1+'.':'…'} ${m}`;b.className=i===ply-1?'current':'';b.setAttribute('aria-label',`عرض الوضع بعد ${m} رقم ${i+1}`);b.onclick=()=>jumpTo(i+1);$('#moves').append(b)})};
function updatePlayback(){const box=$('#playback');box.innerHTML='';if(section!=='openings')return;const prev=document.createElement('button');premiumButton(prev,'السابق','previous');prev.disabled=ply===0;prev.onclick=()=>jumpTo(ply-1);const count=document.createElement('span');count.textContent=`النقلة ${ply} من ${line().length}`;const next=document.createElement('button');premiumButton(next,'التالي','next');next.classList.add('next-step');next.disabled=ply>=line().length;next.onclick=()=>{jumpTo(ply+1);if(ply===line().length)complete()};box.append(prev,count,next);box.hidden=practice;premiumButton($('#changeLesson'),'تغيير الدرس','settings');document.body.dataset.mode=practice?'practice':'learn'}
function renderOpeningBranches(){
  const opening=openingBranches[idx],branch=openingBranch();
  if(!branch)return;
  const video=branch.video??opening.video;
  const model={0:'italian',2:'london',4:'french'}[idx];
  const box=document.createElement('section');
  box.id='openingBranches';
  box.className='opening-branches';
  box.innerHTML=`
    <label for="openingBranchSelect">تفريعة الافتتاح</label>
    <select id="openingBranchSelect" lang="en" dir="ltr"></select>
    <p>${branch.idea}</p>
    ${branch.decision?`<button class="premium-btn" type="button" id="openingDecisionJump">اعرض وضع القرار</button>
    <section class="opening-decision unit-card" id="openingDecision" hidden aria-labelledby="openingDecisionTitle">
      <h3 id="openingDecisionTitle">اختبر قرارك</h3>
      <p>${branch.decision.prompt}</p>
      <div class="training-links" id="openingDecisionOptions" role="group" aria-label="النقلات المرشحة"></div>
      <p id="openingDecisionFeedback" role="status"></p>
      <button class="premium-btn" id="openingDecisionShow" type="button" hidden>اعرض النقلة على الرقعة</button>
    </section>`:''}
    <section class="opening-plan unit-card" id="openingPlan" hidden aria-labelledby="openingPlanTitle">
      <h3 id="openingPlanTitle" lang="en">Middlegame Plans</h3>
      <p><strong>بالأبيض</strong> ${branch.white}</p>
      <p><strong>بالأسود</strong> ${branch.black}</p>
      <details><summary>${branch.question}</summary><p>${branch.answer}</p></details>
      <div class="training-links">
        <a href="#position-evaluation">تدرّب على تقييم الوضع</a>
        ${model?`<a href="#model-games/${model}">ادرس مباراة من الافتتاح ده</a>`: ''}
        ${branch.related?`<a href="#train/openings/${branch.related[0]}">${branch.related[1]}</a>`: ''}
        <a href="${opening.source}" target="_blank" rel="noopener" lang="en">Opening Reference</a>
      </div>
      ${video?`<p class="opening-video"><a href="${video[1]}" target="_blank" rel="noopener" lang="en">${video[0]}</a></p>`:''}
    </section>`;
  const select=box.querySelector('select');
  for(const item of opening.lines)select.append(new Option(item.name,item.id));
  select.value=openingBranchId;
  select.onchange=()=>{location.hash=openingRoute(idx,practice,select.value)};
  if(branch.decision){
    const options=box.querySelector('#openingDecisionOptions');
    const feedback=box.querySelector('#openingDecisionFeedback');
    const play=box.querySelector('#openingDecisionShow');
    box.querySelector('#openingDecisionJump').onclick=()=>jumpTo(branch.start);
    play.onclick=()=>jumpTo(branch.start+1);
    branch.decision.choices.forEach(([san,reason],index)=>{
      const option=document.createElement('button');
      option.type='button';option.className='premium-btn';
      option.lang='en';option.dir='ltr';option.textContent=san;
      option.setAttribute('aria-pressed','false');
      option.onclick=()=>{
        const correct=index===branch.decision.correct;
        for(const candidate of options.children)candidate.setAttribute('aria-pressed',String(candidate===option));
        feedback.textContent=reason;
        play.hidden=!correct;
      };
      options.append(option);
    });
  }
  $('#actions').before(box);
  updateOpeningPlan();
}
function updateOpeningPlan(){
  const plan=$('#openingPlan');
  if(plan)plan.hidden=section!=='openings'||ply<line().length;
  const decision=$('#openingDecision'),jump=$('#openingDecisionJump');
  if(decision){
    const atDecision=ply===openingBranch()?.start;
    decision.hidden=practice||!atDecision;
    jump.hidden=practice||atDecision||!plan.hidden;
  }
}
function renderOpeningActions(){$('#actions').innerHTML='';if(practice){action('تلميح',hint);action('ابدأ من جديد',()=>{practice=true;resetOpening();feedback('دورك: العب النقلة المدروسة.');renderOpeningActions()});}else{action('اختبر نفسك',()=>{practice=true;history.replaceState(null,'',openingRoute(idx,true,openingBranchId));resetOpening();feedback('دورك: حرّك القطعة على الرقعة. الخصم هيرد تلقائيًا.');renderOpeningActions()},true)}action('جرّب الردود غير المتوقعة',()=>location.assign('training.html#trainer'));updatePlayback();$('#focusMode').textContent=practice?'اختبر نفسك':'وضع التعلّم'}
load=function(){$('#openingBranches')?.remove();if(section!=='openings'||!openingBranch())openingBranchId='';document.body.dataset.section=section;baseLoad();if(section==='openings'){$('#title').textContent=openings[idx][0];if(!$('#focusMode')){const m=document.createElement('span');m.id='focusMode';$('#boardLabel').after(m)}renderOpeningBranches();renderOpeningActions();renderMoves();feedback(openingExplanation())}else{$('#moveCaption').textContent='';$('#focusMode')?.remove();$('#playback').innerHTML=''}saveSession()};
const homeNumber=new Intl.NumberFormat('ar-EG');
const homePercentage=new Intl.NumberFormat('ar-EG',{style:'percent',maximumFractionDigits:0});
function renderHomeStats(){
  $('#homeCompleted').textContent=homeNumber.format(completedLessons());
  $('#homeCorrect').textContent=homeNumber.format(stats.correct);
  $('#homeAccuracy').textContent=stats.attempts?homePercentage.format(stats.correct/stats.attempts):'—';
  const sectionPath=lastSession&&paths.find(p=>p[0]===lastSession.section);
  $('#resumeTitle').textContent=sectionPath?`كمّل رحلتك في ${sectionPath[2]}`:'ابدأ بإتقان الرقعة';
  $('#resume').textContent=sectionPath?'كمّل تدريبك':'ابدأ التدريب';
}
function showHome(){clearVisionResponse();isTraining=false;clearInterval(timer);document.body.classList.remove('training-view');$('#homeDashboard').hidden=false;document.querySelector('.workspace').hidden=true;renderHomeStats();window.scrollTo(0,0)}
function showTraining(){isTraining=true;document.body.classList.add('training-view');$('#homeDashboard').hidden=true;document.querySelector('.workspace').hidden=false;$('#category').textContent=paths.find(p=>p[0]===section)[3];window.scrollTo(0,0);saveSession()}
function startSection(key,index=0,mode=false,restorePly,branch=''){section=key;idx=index;openingBranchId=branch;if(section==='openings')flipped=side==='b';load();showTraining();if(section==='openings'){practice=mode;if(practice){resetOpening();for(;ply<restorePly&&ply<line().length;){chess.move(line()[ply++])}if(ply<line().length&&chess.turn()!==side)chess.move(line()[ply++]);renderBoard();renderMoves();feedback('دورك: كمّل الخط على الرقعة.')}else jumpTo(restorePly??(openingBranchId?openingBranch()?.start:0)??0);renderOpeningActions()}saveSession()}
function showSetup(key){setupSection=key;const p=paths.find(p=>p[0]===key);$('#setupModal h2').textContent=p[2];$('#setupDesc').textContent=pathSummary[key];const col=key==='openings'?openings:key==='mates'?mates:key==='tactics'?tactics:key==='endings'?endings:key==='basics'?basics:[['حفظ مربعات الرقعة']];$('#setupLesson').innerHTML='';const order=key==='basics'?[1,0,2,3,4]:lessonIndices(key,col);order.forEach(i=>{const d=col[i];const o=document.createElement('option');o.value=i;o.textContent=d[0];$('#setupLesson').append(o)});$('#setupLesson').value=isTraining&&key===section?idx:(lessonOrder[key]?.[0]??0);$('#setupSide').value=side;$('#setupSideLabel').hidden=key!=='openings';$('#setupPractice').hidden=key!=='openings';$('#setupLearn').textContent=key==='openings'?'ابدأ التعلّم':'ابدأ التدريب';$('#setupModal').showModal()}
$('#setupClose').onclick=()=>$('#setupModal').close();$('#setupModal').onclick=e=>{if(e.target===$('#setupModal'))$('#setupModal').close()};function beginSetup(mode){
  side=$('#setupSide').value;
  const key=setupSection,index=Number($('#setupLesson').value);
  const branch=key==='openings'&&section===key&&idx===index?openingBranchId:'';
  const destination=key==='openings'?openingRoute(index,mode,branch):`#train/${key}/${index}/${mode?'practice':'learn'}`;
  $('#setupModal').close();
  if(location.hash===destination){startSection(key,index,mode,undefined,branch);return}
  if(lastSession&&lastSession.section===key&&lastSession.idx===index&&(lastSession.branch||'')===branch)lastSession={...lastSession,side};
  location.hash=destination;
}
$('#setupLearn').onclick=()=>beginSetup(false);$('#setupPractice').onclick=()=>beginSetup(true);$('#homeBack').onclick=()=>location.hash='home';$('.brand').onclick=e=>{e.preventDefault();location.hash='home'};$('#changeLesson').onclick=()=>showSetup(section);
$('#resume').onclick=()=>{const s=lastSession?{...lastSession}:{section:'openings',idx:lessonOrder.openings[0],ply:0,side:'w',practice:false};side=s.side;const dest=s.section==='openings'?openingRoute(s.idx,s.practice,s.branch):`#train/${s.section}/${s.idx}/${s.practice?'practice':'learn'}`;if(location.hash===dest){startSection(s.section,s.idx,s.practice,s.ply,s.branch)}else location.hash=dest};
paths.forEach(([key,icon,name,en])=>{const b=document.createElement('button');b.className='home-card';b.dataset.learningCard=key;const count=key==='openings'?openings.length:key==='mates'?mates.length:key==='tactics'?tactics.length:key==='endings'?endings.length:key==='basics'?basics.length:3;b.innerHTML=`<div class="home-card-top"><b>${icon}</b><span>${count} ${key==='vision'?'أنماط تدريب':'دروس'}</span></div><h3>${name}</h3><small>${en}</small>`;b.onclick=()=>showSetup(key);$('#homeCards').append(b)});
function route(){
  const match=location.hash.match(/^#train\/(openings|mates|tactics|vision|endings|basics)\/(\d+)\/(learn|practice)(?:\/([a-z0-9-]+))?$/);
  if(!match){showHome();return}
  const key=match[1],n=Number(match[2]),mode=match[3]==='practice';
  const max=key==='openings'?openings.length:key==='mates'?8:key==='tactics'?6:key==='endings'?4:key==='basics'?5:1;
  const index=Math.min(n,max-1);
  const branch=key==='openings'&&openingBranches[index]?.lines.some(item=>item.id===match[4])?match[4]:'';
  const resume=lastSession&&lastSession.section===key&&lastSession.idx===index&&lastSession.practice===mode&&(lastSession.branch||'')===branch?{...lastSession}:null;
  if(resume)side=resume.side;
  startSection(key,index,mode,resume?.ply,branch);
}
window.addEventListener('hashchange',route);renderHomeStats();route();

[['#homeBack','الرئيسية','home'],['#changeLesson','تغيير الدرس','settings'],['#progress','تقدّمي','chart'],['#flip','قلب الرقعة','flip'],['#coords','الإحداثيات','grid'],['#reset','إعادة','reset'],['#setupClose','إغلاق','close'],['#close','إغلاق','close']].forEach(([id,label,icon])=>premiumButton($(id),label,icon));

keepView('setup', () => $('#setupModal').open ? {section:setupSection, lesson:$('#setupLesson').value, side:$('#setupSide').value} : null, saved => {
  if (!paths.some(path=>path[0]===saved.section)) return;
  showSetup(saved.section); $('#setupLesson').value=saved.lesson; $('#setupSide').value=saved.side;
});
