// Historical moves are separate from the original instructional commentary and sample lines.
export const modelGames = [
  {
    id:'italian', opening:'Italian Game', title:'Steinitz vs. von Bardeleben',
    event:'Hastings · 1895', result:'1–0',
    source:'https://www.chessage.com/famous-games/steinitz-von-bardeleben-1895',
    lesson:'#train/openings/0/learn/italian-center',
    focus:'من فتح المركز إلى تنسيق الرخ والوزير والحصان ضد ملك في الوسط.',
    line:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 d5 exd5 Nxd5 O-O Be6 Bg5 Be7 Bxd5 Bxd5 Nxd5 Qxd5 Bxe7 Nxe7 Re1 f6 Qe2 Qd7 Rac1 c6 d5 cxd5 Nd4 Kf7 Ne6 Rhc8 Qg4 g6 Ng5+ Ke8 Rxe7+ Kf8 Rf7+ Kg8 Rg7+ Kh8 Rxh7+',
    finish:'آخر نقلة مسجّلة هي Rxh7+. لاحظ إزاي الرخ دخل للصف السابع وفضل يدي كش، بدعم الوزير والحصان.',
    stops:[
      {
        ply:8, title:'Opening · Central Break',
        prompt:'لعبت c3 والأسود ضغط على e4 بحصانه. لو هدفك تتحدى المركز وتفتح خطوط قبل ما الأسود يبيّت، تختار إيه؟',
        note:'d4 بيهاجم فيل c5 ويدخل في تبادل يفتح الوسط. بيدق c3 جاهز يسترد على d4. بعد كده الأسود عنده ...Bb4+، فاحسب الكش قبل ما تكمل.',
        alternatives:{d3:'اختيار أهدأ يدعم e4 ويأجل فتح المركز.', 'O-O':'التبييت يؤمّن الملك. بعده لازم تحسب ضغط الحصان على e4 بدل ما تفترض إن البيدق آمن.'}
      },
      {
        ply:32, title:'Middlegame · Clear d4 for a Knight',
        prompt:'الرخ على c1 والملك الأسود لسه في الوسط. إزاي تفضّي d4 للحصان بتغيير شكل بيادق المركز؟',
        note:'Steinitz دفع d5. بعد ...cxd5 جه Nd4، والحصان بقى جاهز يدخل e6. قيمة دفع البيدق ظهرت في المربع اللي فضّاه، مش في البيدق نفسه.',
        alternatives:{h3:'نقلة هادية، لكنها تسيب بيدقك على d4 والحصان على f3.'}
      },
      {
        ply:42, title:'Finish · Forcing Checks',
        prompt:'ملك الأسود رجع e8. احسب كش يزيل حصان e7 ويبدأ دخول الرخ للصف السابع.',
        note:'Rxe7+ يشيل الحصان ويجبر الملك يرد. الرخ كمل بكشّات من f7 وg7 وh7، والوزير والحصان بيساندوا الهجوم.',
        alternatives:{Nxh7:'بتاخد بيدق وبتحرّك الحصان. افحص النقلات الإجبارية قبل حساب مكسب المادة.'}
      }
    ]
  },
  {
    id:'london', opening:'London System', title:'Carlsen vs. Wesley So',
    event:'Grand Chess Tour Blitz · Paris 2017', result:'1–0',
    source:'https://www.chesspivot.com/en/openings/model-games/cz0x98AX',
    lesson:'#train/openings/2/learn/jobava-london',
    focus:'تكييف ترتيب لندن مع ضغط ...c5، ثم تنسيق الفيل والوزير لكسب قطعة.',
    line:'d4 Nf6 Bf4 d5 e3 c5 Nc3 a6 dxc5 e6 Na4 Bxc5 Nxc5 Qa5+ c3 Qxc5 Nf3 Nc6 Bd3 h6 Ne5 O-O O-O Qe7 c4 Nxe5 Bxe5 dxc4 Bxc4 Rd8 Qf3 Nd5 e4 Nb6 Bb3 f6 Bc3 a5 a3 Kh8 Qe3 Ra6 Rad1 e5 Bxa5 Rxd1 Rxd1 Be6 Bxb6',
    finish:'آخر نقلة مسجّلة هي Bxb6. في الوضع الأخير، وزير e3 بيحمي الفيل على b6 عبر d4 وc5.',
    stops:[
      {
        ply:6, title:'Opening · Change the Move Order',
        prompt:'الأسود ضغط على d4 بـ...c5. لو عايز تطوّر حصان جناح الوزير قبل ما تلعب c3 بالبيدق، أنهي نقلة تحقق ده؟',
        note:'Carlsen اختار Nc3، فدخل إعدادًا قريبًا من Jobava London. الحصان نشط لكن بيشغل طريق بيدق c2. تابع إزاي الأبيض غيّر المركز بـdxc5 بدل تنفيذ نفس الترتيب كل مرة.',
        alternatives:{c3:'بيسند d4 بإعداد لندن الكلاسيكي. ده اختيار بخطة مختلفة، والحصان يقدر يتطور بعدين لـd2.',Nf3:'بتطوّر حصان جناح الملك. حصان b1 يفضل مكانه لحد ما تختار له طريقًا.'}
      },
      {
        ply:32, title:'Middlegame · Gain Time with a Pawn',
        prompt:'حصان الأسود دخل d5. دور على نقلة بيدق تهاجمه وتكسب مساحة في المركز.',
        note:'e4 يهاجم الحصان على d5 ويكسب وقت. بعد ...Nb6، الأبيض رجّع فيله إلى b3، فالأسود اضطر يغيّر مكان الحصان، والأبيض احتفظ بمساحته في الوسط.',
        alternatives:{Bb3:'بتحافظ على الفيل في مربع نشط، لكن الحصان الأسود لسه ثابت على d5 في النقلة دي.'}
      },
      {
        ply:48, title:'Finish · Bishop and Queen Coordination',
        prompt:'حصان b6 يبدو محميًا برخ a6. احسب الأخذ بالفيل. لو الرخ استرد، هل عندك قطعة تقدر تاخده؟',
        note:'Bxb6 يأخذ الحصان. وزير e3 شايف b6 عبر d4 وc5، فلو الأسود استرد بـ...Rxb6، الأبيض يقدر ياخد الرخ بـQxb6. احسب خط القطعة المدافعة لآخره قبل ما تتراجع عن الأخذ.',
        alternatives:{Bxe6:'بتبدّل الفيل، لكنك بتفوّت فرصة أخذ حصان b6. قارن مكسب التكتيك بالتبديل العادي.'},
        example:['Rxb6','Qxb6']
      }
    ]
  },
  {
    id:'french', opening:'French Defense · Advance', title:'Nimzowitsch vs. Salwe',
    event:'Karlsbad · 1911', result:'1–0',
    source:'https://www.chessbox.in/chessgame/nimzowitsch-aaron-salwe-georg-3/',
    lesson:'#train/openings/4/learn/french-advance',
    focus:'إدارة الضغط على المركز، ثم استغلال مربع e5 والتحوّل إلى نهاية فيها بيدق مار.',
    line:'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 Bd7 dxc5 Bxc5 O-O f6 b4 Be7 Bf4 fxe5 Nxe5 Nxe5 Bxe5 Nf6 Nd2 O-O Nf3 Bd6 Qe2 Rac8 Bd4 Qc7 Ne5 Be8 Rae1 Bxe5 Bxe5 Qc6 Bd4 Bd7 Qc2 Rf7 Re3 b6 Rg3 Kh8 Bxh7 e5 Bg6 Re7 Re1 Qd6 Be3 d4 Bg5 Rxc3 Rxc3 dxc3 Qxc3 Kg8 a3 Kf8 Bh4 Be8 Bf5 Qd4 Qxd4 exd4 Rxe7 Kxe7 Bd3 Kd6 Bxf6 gxf6 Kf1 Bc6 h4',
    finish:'انتهى السجل عند h4. بعد تبديل الوزراء والرخاخ، بيدق h الأبيض بقى مارًّا. الأسود عنده كمان بيدق مار على d4، فاحسب الاتنين قبل ما تقيّم سباق الترقية.',
    stops:[
      {
        ply:9, title:'Opening · Keep the Tension',
        prompt:'إنت بالأسود. لو عايز تسيب التوتر بين c5 وd4 قائم وتضيف ضغطًا على b2، تختار إيه؟',
        note:'...Qb6 يهاجم b2 ويدعم بيدق c5. حاليًا بيدق c5 هو اللي بيضغط على d4. لو اتحرك من مكانه بعد التبادل، قطر الوزير ناحية d4 ممكن يتفتح. في المباراة الأبيض غيّر البنية بنفسه بعد كده بـdxc5.',
        alternatives:{cxd4:'بتحسم التوتر بدري. احسب الاسترداد وتأثيره على سلسلة بيادق الأبيض.',Nge7:'بتطوّر حصان جناح الملك. لسه ممكن تزود الضغط بعدين، لكن النقلة ما بتهاجمش b2.'}
      },
      {
        ply:32, title:'Middlegame · Occupy e5',
        prompt:'فيلك على d4 ووزيرك على e2. دور على نقلة حصان تستفيد من دعمهم في وسط الرقعة.',
        note:'Ne5 يستخدم دعم الفيل والوزير، ويقرب قطعة من جناح الملك الأسود. بعدها Rae1 يضيف رخ على عمود e، ولما الأسود بدّل الحصان، فيل الأبيض استرد على e5.',
        alternatives:{Qc2:'بتغيّر موقع الوزير، لكنك ما استخدمتش e5 للحصان في النقلة دي.'}
      },
      {
        ply:66, title:'Endgame · Trade into a New Position',
        prompt:'وزير الأسود دخل d4. لو هدفك تبديل الوزراء بدل استمرار اللعب بالوزير، نفّذ التبديل واحسب شكل البيادق بعده.',
        note:'Qxd4 وبعدها ...exd4 نقلوا المباراة لنهاية مختلفة. بعد تبديل الرخاخ وBxf6 gxf6، بيدق h الأبيض اتفتح له طريق، وبيدق d4 الأسود فضل محتاج متابعة.',
        alternatives:{Qb3:'بتحافظ على الوزير، واللعب يفضل فيه كشّات وتهديدات. لو قرارك التبسيط، احسب التبادل على d4 مباشرة.'}
      }
    ]
  }
];
