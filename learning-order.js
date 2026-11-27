import './app.js?v=326';
import './safety.js?v=288';
import './tactics-lab.js?v=324';
import './academy.js?v=326';
import './fundamentals.js?v=324';
import './middlegame.js?v=324';
import './chess-guide.js?v=288';
import {groups as studyGroups} from './study-lines.js';
const home = document.getElementById('homeCards');
for(const key of ['academy','game-tips']){const duplicates=[...home.querySelectorAll(`[data-learning-card="${key}"]`)];duplicates.slice(0,-1).forEach(el=>el.remove());}
const cards = new Map(
  [...home.querySelectorAll('[data-learning-card]')].map(card => [card.dataset.learningCard, card])
);

const links = [
  ['opening-mastery', 'Opening Mastery', 'اختار اللون والافتتاحية · شاهد النقلات أو اختبر نفسك', '♘', 'opening-mastery.html'],
  ['psychology','Chess Psychology','اتدرّب على قراراتك تحت الضغط','◇','study.html#Trust%20Your%20Intuition'],
  ['bullet','Bullet','اختار نقلة عملية تحت ضغط الساعة','◷','study.html#Time%20Management%20in%20Bullet'],
  ['opening-responses', 'مدرّب ردود الافتتاحيات', 'جرّب الردود غير المتوقعة بالأبيض والأسود', '♞', 'training.html#trainer'],
  ['opening-exam', 'اختبار الافتتاحيات', '١٠ مواقف بالأبيض والأسود', '♞', 'training.html#exam'],
  ['checkmate-patterns', 'Checkmate Patterns', 'اتعرّف على شكل المات وجرّبه على الرقعة', '♛', '#checkmate-patterns'],
  ['draws', 'Stalemate & Other Draws', 'تجنّب الخنق وأنقذ التعادل', '♚', '#draws'],
  ['practical-endgames', 'Practical Endgames', 'النهايات العملية والتعادل والتبديل', '♜', '#practical-endgames'],
  ['calculation', 'Calculation Trainer', 'احسب ردّ الخصم وقيّم النتيجة', '♞', '#calculation'],
  ['personal-analysis','Personal Game Analysis','استورد مباراة PGN وراجع نقلاتك','♟','personal-analysis.html'],
  ['hero-lessons','دروس الأبطال','دروس تاريخية وعدسات لدراسة الأساتذة','♛','#hero-lessons'],
  ['model-games', 'مباريات نموذجية', '٣ مباريات من الافتتاح للحسم', '♜', '#model-games'],
  ['plans', 'Plans', 'اختار هدف ونفّذ خطة تناسب الوضع', '♜', '#plans'],
  ['tactics-guide', 'Tactics', 'تعرّف على أسماء التكتيكات وأفكارها', '♝', '#tactics-guide']
];

for (const [key, title, description, icon, href] of links) {
  const card = document.createElement('a');
  card.className = 'home-card learning-link';
  card.href = href;
  card.innerHTML = `<div class="home-card-top"><b aria-hidden="true">${icon}</b></div><h3>${title}</h3><small>${description}</small>`;
  cards.set(key, card);
}

// Use a direct route, independent of legacy setup listeners.
const legacyTactics=cards.get('tactics');
if(legacyTactics){
 const lab=document.createElement('a');
 lab.className='home-card learning-link';
 lab.href='index.html?v=327&section=tactical#tactics-lab';
 lab.innerHTML='<div class="home-card-top"><b aria-hidden="true">♞</b></div><h3>Tactics Lab</h3><small>مكتبة التكتيكات الكاملة · اختر الفكرة والمستوى واللون</small>';
 legacyTactics.remove();cards.set('tactics',lab);
}
const stages = [
  {id:'resources', title:'الأساسيات', cards:['academy','game-tips']},
  {id:'opening', title:'الافتتاحيات', cards:['opening-mastery']},
  {id:'middlegame', title:'منتصف اللعبة', cards:['middlegame','position-evaluation','safety','plans','piece-activity','practical-decisions']},
  {id:'tactical', title:'التكتيكات والحساب', cards:['tactics','tactics-guide','calculation','mixed']},
  {id:'finish', title:'النهايات والكش مات', cards:['endings','practical-endgames','draws','mates','checkmate-patterns']},
  {id:'games', title:'دراسة المباريات', cards:['model-games','hero-lessons','personal-analysis']},
  {id:'progress', title:'التقييم وخطة التدريب', cards:['psychology','bullet']}
];

for (const card of cards.values()) {
  card.querySelector('.home-card-top span')?.remove();
}

for (const stage of stages) {
  const section = document.createElement('details');
  section.className = `learning-stage learning-stage-${stage.id}`;
  const headingId = `learning-title-${stage.id}`;
  section.setAttribute('aria-labelledby', headingId);
  section.innerHTML = `<summary class="home-section-title" id="${headingId}">${stage.title}<span class="group-chevron" aria-hidden="true">⌄</span></summary><div class="learning-grid"></div>`;
  const grid = section.querySelector('.learning-grid');
  for (const key of stage.cards) {
    const card = cards.get(key);
    if (card) grid.append(card);
  }
  home.append(section);
}

// The unified Opening Mastery is the only opening entry on the homepage.
 // Keep the old lesson routes available from inside Mastery, not as orphan tiles.
for (const key of ['openings','opening-traps','basics','vision']) {
  const card=cards.get(key);
  if(card && card.parentElement===home) card.remove();
  cards.delete(key);
}
const jumps = document.querySelector('.stage-jumps');
for (const stage of stages) {
  const jump = document.createElement('button');
  jump.type = 'button';
  jump.lang = 'ar';
  jump.textContent = stage.title;
  jump.onclick = () => {
    const heading = document.getElementById('learning-title-' + stage.id);
    for(const item of jumps.children)item.removeAttribute('aria-current');
    jump.setAttribute('aria-current','location');
    heading.parentElement.open=true;heading.tabIndex = -1;
    heading.focus({preventScroll:true});
    heading.scrollIntoView({block:'start'});
  };
  jumps.append(jump);
}
const topics = {
  openings:['Opening Library','اتعلّم أول النقلات وخطة كل افتتاح'], 'opening-responses':['Opening Responses','اتدرّب على ردّ الخصم'],
  'opening-exam':['Opening Test','اختبر اختياراتك بالأبيض والأسود'], middlegame:['Middlegame','اختار خطتك بعد الافتتاح'],
  safety:['Piece Safety','راجع تهديدات الخصم وأمان قطعك'], tactics:['Tactics Lab','حلّ الموقف على الرقعة'],
  endings:['Endgames','اتدرّب على نهايات اللعب'], mates:['Checkmate','اقفل مربعات هروب الملك'],
  academy:['Chess Academy','حركة القطع والقواعد وإتقان الرقعة ومسار التعلم'], basics:['First Steps','ابدأ بأساسيات الرقعة'],
  vision:['Board Vision','اتدرّب على أسماء المربعات'], 'game-tips':['Game Tips','راجع قراراتك أثناء المباراة'],
  mixed:['Mixed Practice','جرّب مواقف من أكتر من موضوع'], 'model-games':['Model Games','تابع مباراة نقلة بنقلة']
};
for (const stage of stages) {
  for (const key of stage.cards) {
    const card=cards.get(key);
    if(!card)continue;
    const label=topics[key];
    if(label){
      card.querySelector('h3').textContent=label[0];
      const summary=card.querySelector('small');
      if(summary)summary.textContent=label[1];
    }

  }
}

// All tile artwork shares a 24-unit canvas and inherits the same stroke.
const rowIcons = {
 academy:'M3 5h8v15H3zM13 5h8v15h-8zM6 9h2M16 9h2',
 middlegame:'M4 4h16v16H4zM4 12h16M12 4v16',
 endings:'M5 3h4v4h6V3h4v7l-3 3v5H8v-5l-3-3zM6 21h12',
 'personal-analysis':'M4 4h12v16H4zM7 8h6M7 12h4M15 15l6 6m-1-9a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 'hero-lessons':'M7 3h10v5a5 5 0 0 1-10 0zM7 5H3v3q0 4 5 4M17 5h4v3q0 4-5 4M12 13v5M7 21h10',

  'opening-mastery':'M12 20V5m0 9-7-7m7 7 7-7M3 7h4M17 7h4M10 5h4',
  'opening-responses':'M3 8h16m-4-4 4 4-4 4M21 16H5m4-4-4 4 4 4',
  'opening-traps':'M4 19h5V6h9m-4-4 4 4-4 4M9 14h7l4 5m-5 0h5v-5',
  'opening-exam':'M8 5H5v16h14V5h-3M9 3h6v4H9zM8 14l3 3 5-6',
  'position-evaluation':'M12 3v17m-5 1h10M4 7l15-2M5 7l-3 7h6L5 7m13-2-3 7h6l-3-7',
  safety:'M12 2.5 20 6v6c0 4.5-4 7.6-8 9.5-4-1.9-8-5-8-9.5V6zM8.5 12l2.5 2.5 4.5-5',
  plans:'M6 21V4c4-3 8 3 13 0v9c-5 3-9-3-13 0',
  'piece-activity':'M4 18h7V6h8m-4-4 4 4-4 4M3 21h6',
  'tactics-guide':'M12 21v-8m0 2L5 8V4m0 0-3 3m3-3 3 3m4 8 7-7V4m0 0-3 3m3-3 3 3',
  tactics:'M9 3h6m-5 0v6L4 18q-1 3 2 3h12q3 0 2-3l-6-9V3M7 15h10',
  calculation:'M5 3h14v18H5zM8 7h8M8 12h2m4 0h2m-8 5h2m4 0h2',
  'practical-decisions':'M12 21v-7l-7-7m7 7 7-7M4 11V5h6m4 0h6v6',
  'model-games':'M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1zM12 6v14',
  psychology:'M8 21v-4a7 7 0 1 1 11-6l2 4h-3v4h-5v2M10 9q1-3 4-1t-1 4',
  'practical-endgames':'M5 21h14l-2-4H7zM8 17l1-8-3-2V3h3v3h2V3h2v3h2V3h3v4l-3 2 1 8',
  draws:'M5 8h14m-14 8h14',
  mates:'M4 7l4 3 4-6 4 6 4-3-3 10H7zM7 20h10',
  'checkmate-patterns':'M8 3 6 21M17 3l-2 18M3 9h18M2 15h18',
  basics:'M3 20h6v-5h5v-5h6V4',
  vision:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM15 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0',
  'game-tips':'M9 17c0-3-4-4-4-8a7 7 0 0 1 14 0c0 4-4 5-4 8zM9.5 20h5',
  mixed:'M3 6h3c5 0 6 12 12 12h3m-3-3 3 3-3 3M3 18h3c2 0 3-2 4-4m3-5c2-3 3-3 5-3h3m-3-3 3 3-3 3',
  bullet:'M12 4a8.5 8.5 0 1 1-.1 0M12 8v5l3 2M9 2h6'
};
for (const [key, card] of cards) {
  if (card.classList.contains('illustrated')) continue;
  card.classList.add('lesson-row');
  const icon=card.querySelector('.home-card-top b');
  if (icon && rowIcons[key]) {
    icon.setAttribute('aria-hidden','true');
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="${rowIcons[key]}"/></svg>`;
  }
  if (key==='tactics-guide') card.querySelector('small').textContent='اتعلّم تميّز الشوكة والتثبيت';
  if (key==='tactics') card.querySelector('small').textContent='اختار القطعة والعب النقلة اللي تكسبك أفضلية';
}

// Consolidate existing standalone home links without changing their destinations.
for(const [id,group] of [['masterGamesTitle','games'],['coachTitle','progress'],['assessmentTitle','progress'],['trainingPlanTitle','progress']]){const old=document.getElementById(id)?.closest('.home-summary');const grid=home.querySelector('.learning-stage-'+group+' .learning-grid');if(old&&grid){const link=old.querySelector('a');if(link){const card=document.createElement('a');card.className='home-card learning-link lesson-row';card.href=link.getAttribute('href');const title=document.createElement('h3');title.textContent=old.querySelector('h2').textContent;const desc=document.createElement('small');desc.textContent=old.querySelector('p')?.textContent||'';card.append(title,desc);grid.append(card);old.remove()}}}

// Add artwork only to tiles missing an icon.
const standaloneIcons={'master-games.html':'M7 3h10v5a5 5 0 0 1-10 0zM12 13v5M7 21h10','personal-coach.html':'M4 4h16v12H9l-5 4zM8 8h8M8 12h5','assessment.html':'M5 3h14v18H5zM8 12l3 3 5-6','training.html#plan':'M4 6h16v15H4zM8 3v6M16 3v6M4 11h16M8 15h3M13 15h3'};
for(const card of home.querySelectorAll('.lesson-row')){
 const key=[...cards].find(([,v])=>v===card)?.[0];
 const d=rowIcons[key]||standaloneIcons[card.getAttribute('href')]||'M4 4h16v16H4zM8 9h8M8 14h8';
 if(card.querySelector('.home-card-top b')?.innerHTML.trim())continue;
 let top=card.querySelector('.home-card-top');if(!top){top=document.createElement('div');top.className='home-card-top';card.prepend(top);}
 let icon=top.querySelector('b');if(!icon){icon=document.createElement('b');top.prepend(icon);}
 icon.setAttribute('aria-hidden','true');icon.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="${d}"/></svg>`;
}
const unifiedGroups=[
 ['resources','Chess Fundamentals','قواعد اللعب والقطع والتدريب الأساسي',['academy']],
 ['tactical','Chess Tactics','شرح الأنماط والتدريب والحساب',['tactics-guide','tactics','calculation','mixed']],
 ['finish','Endgame Mastery','النهايات الأساسية والعملية والتعادل',['endings','practical-endgames','draws']],
 ['finish','Checkmate Mastery','القفلات وأنماط الكش مات',['mates','checkmate-patterns']],
 ['games','Game Academy','المباريات النموذجية ومباريات الأساتذة',['model-games','hero-lessons']]
];
for(const [stage,title,description,keys] of unifiedGroups){
 const grid=home.querySelector('.learning-stage-'+stage+' .learning-grid');
 if(!grid)continue;
 const members=keys.map(k=>cards.get(k)).filter(c=>c&&c.parentElement===grid);
 if(stage==='games'){const master=grid.querySelector('a[href="master-games.html"]');if(master)members.push(master)}
 if(!members.length)continue;
 const unit=document.createElement('details');unit.className='unified-unit';
 const summary=document.createElement('summary');const heading=document.createElement('strong');heading.textContent=title;const sub=document.createElement('small');sub.textContent=description;summary.append(heading,sub);unit.append(summary);
 const content=document.createElement('div');content.className='unified-unit-content';unit.append(content);grid.insertBefore(unit,members[0]);members.forEach(c=>content.append(c));
}

// Avoid nested navigation for categories that contain only one unified module.
for(const stage of home.querySelectorAll('.learning-stage')){
 const grid=stage.querySelector('.learning-grid');
 if(grid?.children.length===1&&grid.firstElementChild.classList.contains('unified-unit')){
 const unit=grid.firstElementChild;const content=unit.querySelector('.unified-unit-content');grid.replaceChildren(...content.children);
 }
}
// Preserve expanded categories during reloads and visits to lessons in this tab.
const groupsOnHome=[...home.querySelectorAll('details')];
const groupKey=(el)=>el.querySelector('summary')?.textContent.trim();
let opened=[];try{opened=JSON.parse(sessionStorage.getItem('rook-home-open-v183')||'[]');if(!Array.isArray(opened))opened=[]}catch{}
for(const el of groupsOnHome)el.open=opened.includes(groupKey(el));
for(const el of groupsOnHome)el.addEventListener('toggle',()=>{try{sessionStorage.setItem('rook-home-open-v183',JSON.stringify(groupsOnHome.filter(x=>x.open).map(groupKey)))}catch{}});

 // Dedicated category views retain the original live lesson cards and handlers.
const category=new URLSearchParams(location.search).get('section');
const activeStage=stages.find(s=>s.id===category);
const stageNodes=[...home.querySelectorAll('.learning-stage')];
for(const node of stageNodes){
 const stage=stages.find(s=>node.classList.contains('learning-stage-'+s.id));
 if(!stage)continue;
 const summary=node.querySelector('summary');
 if(activeStage){
  if(stage.id!==activeStage.id){node.remove();continue}
  node.open=true;summary.hidden=true;summary.style.setProperty('display','none','important');
  for(const unit of node.querySelectorAll('.unified-unit'))unit.open=true;
  for(const unit of node.querySelectorAll('.unified-unit>summary'))unit.addEventListener('click',e=>e.preventDefault());
 }else{
  const link = document.createElement('a');
  link.className = 'category-entry';
  link.dataset.stage = stage.id;
  link.href = 'index.html?v=327&section=' + encodeURIComponent(stage.id);
  const title = document.createElement('span');
  title.className = 'category-title';
  title.textContent = stage.title;
  const arrow = summary.querySelector('.group-chevron');
  arrow.textContent = '‹';
  link.append(title, arrow);
  node.replaceWith(link);
 }
}
if(activeStage?.id==='resources'){
 const grid=home.querySelector('.learning-stage-resources .learning-grid');
 const unit=grid?.querySelector('.unified-unit');
 if(unit){const content=unit.querySelector('.unified-unit-content');if(content)unit.replaceWith(...content.children);}
 const academy=cards.get('academy');if(academy){academy.querySelector('h3').textContent='Chess Fundamentals';academy.querySelector('small').textContent='قواعد اللعب وحركة القطع وإتقان الرقعة';}
 document.body.classList.add('resources-category');
}
if(activeStage){
 document.body.classList.add('rook-category');
 for(const unit of home.querySelectorAll('.unified-unit')){
  const content=unit.querySelector('.unified-unit-content');
  if(content?.children.length===1)unit.replaceWith(...content.children);
 }
 const heading=document.createElement('div');heading.className='category-heading';
 const title=document.createElement('h2');title.textContent=activeStage.title;
 heading.append(title);home.before(heading);home.classList.add('category-content');
}

// Ensure standalone icons remain visible after category layout is assembled.
for(const card of home.querySelectorAll('a.lesson-row')){
 const href=card.getAttribute('href');
 const d=standaloneIcons[href]||standaloneIcons[href?.replace(/^\.\//,'')];
 if(!d)continue;
 card.classList.add('standalone-artwork');
 let top=card.querySelector('.home-card-top');
 if(!top){top=document.createElement('div');top.className='home-card-top';card.prepend(top);}
 top.innerHTML=`<b aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg></b>`;
}
if(activeStage){
 const placement={'Openings & Essentials':'opening','Middlegame':'middlegame','Checkmate Patterns':'finish','Bullet':'progress'};
 const labels={'Openings & Essentials':'دروس الافتتاح والأساسيات','Middlegame':'دروس استراتيجية إضافية','Checkmate Patterns':'دروس أنماط المات','Bullet':'Bullet'};
 const grid=home.querySelector('.learning-stage-'+activeStage.id+' .learning-grid');
 const redistributed={...studyGroups,'Openings & Essentials':[],'Middlegame':[...studyGroups.Middlegame,'Pieces Working Together'],'Game Study':['Read and Play a Game']};placement['Game Study']='games';labels['Game Study']='تطبيق ودراسة المباريات';
 for(const [group,titles] of Object.entries(redistributed)){
  if(placement[group]!==activeStage.id||!grid)continue;
  const unit=document.createElement('details');unit.className='study-topic-group';
  const summary=document.createElement('summary');summary.textContent=labels[group];summary.setAttribute('aria-label',labels[group]);
  const content=document.createElement('div');content.className='study-topic-list';
  unit.append(summary,content);
  if(group==='Bullet'){const old=cards.get('bullet');if(old?.parentElement===grid){grid.insertBefore(unit,old);old.remove();}else grid.append(unit);}
  else grid.append(unit);
  for(const title of titles){
   if(title==='Trust Your Intuition'&&group==='Middlegame')continue; // canonical entry: Chess Psychology in progress
   const href='study.html#'+encodeURIComponent(title);
   if([...grid.querySelectorAll('a')].some(a=>a.getAttribute('href')===href))continue;
   const card=document.createElement('a');card.className='home-card learning-link lesson-row';card.href=href;
   card.innerHTML='<div class="home-card-top"><b aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="'+(group==='Bullet'?rowIcons.bullet:group==='Checkmate Patterns'?rowIcons.mates:group==='Middlegame'?rowIcons.plans:group==='Game Study'?rowIcons['model-games']:rowIcons['opening-mastery'])+'"/></svg></b></div><h3></h3><small>شرح وتطبيق واختبار</small>';
   card.querySelector('h3').textContent=title;content.append(card);
  }
  if(!content.children.length)unit.remove();
 }
}
document.documentElement.classList.remove('rook-loading','rook-deep');
