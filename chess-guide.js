const plans = [
  ['King Safety', 'أمان الملك', 'لو ملكك لسه في الوسط والمركز ممكن يتفتح، أمّنه قبل ما تبدأ هجوم على الجناح. لو التبييت قانوني وآمن، فكّر فيه أولًا.', 'king'],
  ['Improve Your Least Active Piece', 'تنشيط أقل قطعة', 'دور على القطعة اللي تأثيرها قليل، وحدّد لها مربع أو طريق يجعلك تهاجم هدف أو تدعم قطعة تانية. فيل c1 مثلًا ممكن يدخل اللعب على g5 لو القطر مفتوح.', 'piece'],
  ['Use an Open File', 'السيطرة على عمود مفتوح', 'العمود المفتوح مفيهوش بيادق من اللونين. حط عليه رخ لو فيه مربع دخول أو هدف تضغط عليه. افحص رخ الخصم قبل ما تقرر التبديل.', 'file'],
  ['Pawn Break', 'كسر بالمشاة', 'ادفع بيدق عشان تتحدّى بنية الخصم أو تفتح خط لقطعك. في الفرنسي المتقدّم، ...c5 بيضغط على d4، قاعدة سلسلة البيادق.', 'break'],
  ['Trade with a Purpose', 'التبديل بهدف', 'قبل ما تبدّل، اسأل مين هيسترد وإيه الوضع بعدها. ممكن تبدّل مهاجم نشط لتخفّف الضغط، أو ترفض التبديل لو هيخلّي قطعة الخصم أنشط.', 'trade'],
  ['Target a Weak Pawn', 'استهداف بيدق ضعيف', 'لو فيه بيدق معزول أو متأخر، شوف هل تقدر تضغط عليه بقطعتين وهل الخصم يقدر يدفعه أو يهاجم في مكان تاني. اختيار الهدف بيعتمد على سهولة الوصول له.'],
  ['Use an Outpost', 'استخدام مربع ارتكاز', 'دور على مربع متقدم تقدر تثبّت عليه حصانك، والخصم مش قادر يطرده ببيدق. افحص لو يقدر يبدّل الحصان بقطعة أو يضغط على البيدق اللي بيدعمه.'],
  ['Defend and Counterattack', 'الدفاع والرد بهجوم', 'حدّد تهديد الخصم المباشر. لو تقدر تعالجه بنقلة تطوّر قطعة أو تصنع تهديد آمن في نفس الوقت، قارنها بالنقلة الدفاعية البحتة واحسب الرد.'],
];

const tactics = [
  ['Hanging Piece', 'قطعة معلّقة', 'قطعة تقدر تاخدها بدون تعويض كافٍ للخصم. قبل الأخذ، افحص الكشّات والردود اللي ممكن تكسبه قطعة تانية.'],
  ['Fork', 'الشوكة', 'قطعة واحدة تهاجم هدفين أو أكتر. مثلًا حصان يدي كش ويهاجم رخ في نفس النقلة. بعد رد الملك، اتأكد إن أخذ الرخ آمن.'],
  ['Pin', 'التثبيت', 'قطعة واقفة في خط هجوم قدام هدف أثمن. لو الهدف ملكها، تحريكها خارج الخط ممنوع لو هيعرّض الملك للكش. لو الهدف وزير، الحركة ممكنة قانونيًا لكن ممكن تخسر الوزير.'],
  ['Skewer', 'السيخ', 'بتهاجم القطعة الأغلى اللي في المقدمة. لما تتحرك، ينكشف الهدف اللي وراها. مثال: فيل يدي كش على قطر فيه وزير خلف الملك.'],
  ['Discovered Attack', 'الهجوم المكتشف', 'تحرّك قطعة عشان تفتح خط لفيل أو رخ أو وزير وراها. النقلة أقوى لو القطعة اللي اتحركت عملت تهديد تاني.'],
  ['Double Check', 'الكش المزدوج', 'قطعتان بتدّوا كش في نفس الوقت. الملك لازم يتحرك لمربع آمن، وممكن ياخد قطعة بنفسه لو مربع الوصول آمن.'],
  ['Removing the Defender', 'إزالة المدافع', 'تاخد القطعة اللي بتحمي هدف مهم، وبعد رد الخصم تستغل إن الهدف بقى أضعف. احسب ترتيب الأخذ عشان تتأكد إن المدافع فعلاً اتشال.'],
  ['Deflection', 'إبعاد المدافع', 'تجبر قطعة تسيب مهمتها. مثلًا تدي كش يجبر رخ الخصم ياخد، فيسيب حماية قطعة تانية كانت مستندة عليه.'],
  ['Intermezzo', 'النقلة الوسيطة', 'بدل الاسترداد فورًا، تدخل بكش أو تهديد أقوى، وبعد رد الخصم ترجع للأخذ لو لسه آمن. فكر فيها كل مرة الخصم يتوقع منك رد تلقائي.'],
  ['Back-Rank Mate', 'مات الصف الأخير', 'رخ أو وزير يدي كش على الصف الأخير، والملك ما عندوش مربع هروب. افحص هل فيه قطعة تقدر تاخد اللي بيدي الكش أو تحجب الخط.'],
];

const guide = document.createElement('section');
guide.id = 'chessGuide';
guide.hidden = true;
guide.innerHTML = `
  <nav class="training-links mid-nav"><a href="#home">الرئيسية</a></nav>
  <section id="guidePlans" aria-labelledby="guidePlansTitle" hidden>
    <div class="lesson-head"><h2 id="guidePlansTitle" lang="en">Plans</h2></div>
    <div class="unit-card guide-decision">
      <h3 lang="en">After the Opening</h3>
      <p>بعد الافتتاح، ابدأ بقراءة الوضع. لو فيه تهديد عاجل، عالجه. لو فيه تكتيك، احسبه. ولو الوضع هادي، اختار خطة حسب مكان الملكين، شكل البيادق، ونشاط القطع.</p>
      <ol>
        <li><strong>اقرأ آخر نقلة للخصم.</strong> هل بيهدد مات أو أخذ قطعة، ولا فتح خط ممكن يستغله؟</li>
        <li><strong>افحص الكش والأخذ والتهديد للطرفين.</strong> لو شايف تكتيك، احسب أقوى رد قبل ما تلعب.</li>
        <li><strong>اختار هدف لو مفيش حاجة مستعجلة.</strong> أمّن الملك، نشّط قطعة، أو اضغط على ضعف واضح. قبل التنفيذ، اسأل «بعد نقلتي، الخصم يقدر ياخد إيه؟»</li>
      </ol>
      <p>الخطة ممكن تستمر عدة نقلات. بعد ردّ الخصم راجع إذا كان هدفك لسه متاح أو فيه أولوية جديدة.</p>
    </div>
    <div class="guide-cards" id="guidePlanCards"></div>
  </section>
  <section id="guideTactics" aria-labelledby="guideTacticsTitle" hidden>
    <div class="lesson-head"><h2 id="guideTacticsTitle" lang="en">Tactics</h2></div>
    <p>التكتيك نقلة أو سلسلة نقلات قصيرة تحقق مكسب مباشر، زي كسب قطعة أو كش مات. جرّب تحدّد الفكرة، وبعدها احسب أقوى رد عند الخصم.</p>
    <div class="training-links mid-nav"><a href="#tactics-lab">افتح مختبر التكتيكات</a><a href="#mixed-lab">جرّب التحدي المختلط</a></div>
    <div class="guide-cards" id="guideTacticCards"></div>
  </section>`;
document.querySelector('main footer').before(guide);

for (const [id, entries] of [['guidePlanCards', plans], ['guideTacticCards', tactics]]) {
  const grid = document.getElementById(id);
  for (const [title, arabic, explanation, lesson] of entries) {
    const card = document.createElement('article');
    card.className = 'unit-card guide-card';
    card.innerHTML = `<h3 lang="en" dir="ltr">${title}</h3><span>${arabic}</span><p>${explanation}</p>`;
    if (lesson) {
      const link = document.createElement('a');
      link.href = `#middlegame/${lesson}`;
      link.textContent = 'جرّب على الرقعة';
      card.append(link);
    }
    grid.append(card);
  }
}

function route() {
  const hash = location.hash;
  const plansActive = hash === '#plans';
  const tacticsActive = hash === '#tactics-guide';
  guide.hidden = !plansActive && !tacticsActive;
  if (guide.hidden) return;
  document.getElementById('guidePlans').hidden = !plansActive;
  document.getElementById('guideTactics').hidden = !tacticsActive;
  document.body.classList.add('training-view');
  document.body.dataset.section = 'chess-guide';
  document.getElementById('homeDashboard').hidden = true;
  document.querySelector('.workspace').hidden = true;
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
