import {Chess} from './chess.js';
import {openings} from './opening-library.js';
import {openingBranches} from './opening-branches.js?v=6';

const profiles = [
  ['Beginner', 'تطوير هادي', 'الفيل بينشط على c4 والتبييت قريب.', 'توقيت d4 بيتغير مع كل رد.'],
  ['Intermediate', 'ضغط طويل', 'الفيل بيضغط على المدافع عن e5.', 'أخذ e5 بدري ممكن يضيّع وقت أو مادة.'],
  ['Beginner', 'مركز متماسك', 'بتطلع الفيل قبل ما تلعب e3.', 'لو الأسود ضغط بـ ...c5 راجع d4 قبل ما تكمّل الترتيب المعتاد.'],
  ['Intermediate', 'لعب نشط وغير متماثل', 'الأسود بينافس على d4 من الجنب.', 'الفروع مختلفة وملكك محتاج تأمين حسب الوضع.'],
  ['Intermediate', 'ضغط على سلسلة البيادق', '...d5 بيتحدّى e4 بدعم e6.', 'فيل c8 محتاج خطة عشان يدخل اللعب.'],
  ['Intermediate', 'مركز متين', 'الفيل يقدر يطلع قبل إغلاق السلسلة بـ ...e6.', 'بيدق c6 بياخد مربع حصان b8 وقد يحتاج نقلة إضافية للكسر.'],
  ['Intermediate', 'ضغط على d5', 'c4 بيفرض قرار على مركز الأسود.', 'لو الأسود أخد على c4، احسب وقت استرداد البيدق.'],
  ['Advanced', 'جامبيت حاد', 'بيخلق تهديدات سريعة في بعض الردود.', 'الأسود بيعرض بيدق مقابل نشاط قد يقدر الأبيض يحيّده.'],
  ['Advanced', 'جامبيت حاد', 'الأبيض بيحاول يسبق في التطوير.', 'التعويض عن البيدق محتاج حساب.'],
  ['Intermediate', 'مركز مفتوح', 'd4 بيفتح خطوط التطوير بدري.', 'الحصان على d4 ممكن يتهاجم مع التطوير.'],
  ['Beginner', 'تحدّي مباشر للمركز', 'الأسود بيواجه e4 من أول نقلة.', 'الوزير ممكن يتعرض للهجوم أثناء تطوير الخصم.'],
  ['Advanced', 'هجوم مضاد على المركز', 'الأسود بيأجّل صدام البيادق عشان يختار توقيته.', 'الأبيض غالبًا عنده مساحة في الأول.'],
  ['Advanced', 'تطوير مرن', 'الفيل على g7 ممكن يضغط على القطر الطويل.', 'الأسود محتاج يحدد إمتى ينافس الأبيض على المركز.']
];

const supplements = [
  ['open-game', 'Open Game', 'e4 e5 Nf3 Nc6', 'e4', 'الأبيض هو اللي هيحدد إذا كان الفرع Italian أو Scotch أو Ruy Lopez.'],
  ['dutch', 'Dutch Defense', 'd4 f5 g3 Nf6', 'd4', 'بيدق f5 بيسيطر على e4، ودفعه يفتح قطر ناحية الملك.'],
  ['english-symmetrical', 'Symmetrical English', 'c4 c5 Nc3 Nc6', 'c4', 'بتنافس على d4. تشابه البيادق ما يضمنش إن تقليد كل نقلة آمن.'],
  ['english-reversed', 'Reversed Sicilian', 'c4 e5 Nc3 Nf6', 'c4', 'الأسود بياخد مساحة في الوسط. الأبيض عنده نقلة زيادة مقارنة بمواقف الصقلي المشابهة.'],
  ['d5-vs-nf3', 'Central Setup vs 1.Nf3', 'Nf3 d5 d4 Nf6 c4 e6 Nc3', 'Nf3', '...d5 يحتل المركز. ترتيب الأبيض هنا ممكن يدخل في عيلة Queen’s Gambit Declined.'],
  ['larsen', 'Central Setup vs 1.b3', 'b3 d5 Bb2 Nf6', 'Other Moves', 'خد مساحة في الوسط، وراقب قطر فيل b2 قبل ما تحرّك e5.'],
  ['bird', 'Central Setup vs 1.f4', 'f4 d5 Nf3 Nf6', 'Other Moves', 'نافس الأبيض على e5 بأكتر من قطعة، وراجع أمان الملك لو المركز اتفتح.']
];

export const catalog = new Map(openings.map(([name, , moves, summary, notes], index) => {
  const branches = openingBranches[index];
  return [String(index), {
    name, summary, index, profile: profiles[index], source: branches?.source, video: branches?.video,
    lines: (branches?.lines ?? [{id: '', name: 'Main Line'}]).map(line => ({
      ...line, moves: (line.moves ?? moves).split(' '), notes: {...Object.fromEntries((notes ?? []).map((note, ply) => [ply + 1, note]).filter(([ply]) =>
        (line.moves ?? moves).split(' ').slice(0, ply).join(' ') === moves.split(' ').slice(0, ply).join(' '))), ...line.notes}
    }))
  }];
}));
for (const [id, name, moves, , summary] of supplements) {
  catalog.set(id, {name, summary, lines: [{id: '', name: 'Main Line', moves: moves.split(' ')}]});
}

// A general 1...e5 repertoire continues into actual playable lines.
const openGame = catalog.get('open-game');
openGame.profile = ['Beginner', 'تطوير طبيعي', 'بتنافس على المركز وبتجهّز القطع للتبييت.', 'بعد ...Nc6 لازم تتعامل مع اختيار الأبيض، مش تفرض ترتيب واحد.'];
openGame.lines = ['0','1','9'].map((id,index) => {
  const opening = catalog.get(id);
  const line = opening.lines[0];
  return {...line, id: index === 0 ? '' : 'open-game-'+id, name: opening.name+' · '+line.name,
    idea: 'بعد 1.e4 e5 2.Nf3 Nc6، اختيار الأبيض بيحدد الفرع. '+(line.idea ?? opening.summary)};
});
catalog.get('0').lines.push({
  id: 'italian-h6', name: 'Unexpected Moves · 3...h6', start: 6,
  moves: 'e4 e5 Nf3 Nc6 Bc4 h6 d4 exd4 O-O'.split(' '),
  idea: 'راجع إمتى تفتح الوسط لو خصمك أخّر تطويره.',
  notes: {6: 'الأسود منع Ng5 ولسه مطوّرش حصان g8.', 7: 'd4 يتحدّى e5 فورًا. راجع مين يقدر يلعب بأمان بعد الفتح.'}
});
catalog.get('6').lines.push({
  id: 'qgd-transposition', name: 'Transposition · 1...Nf6', start: 6,
  moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'd5', ...catalog.get('6').lines[0].moves.slice(6)],
  idea: 'بعد ...d5 وصلت لنفس الوضع اللي بيظهر بعد 1. d4 d5 2. c4 e6 3. Nc3 Nf6.'
});

const defenses = {
  e4: ['open-game', '5', '4', '3', '10', '11', '12', '0', '1', '9', '8'],
  d4: ['6', '2', 'dutch', '7'],
  c4: ['english-symmetrical', 'english-reversed'],
  Nf3: ['d5-vs-nf3'],
  'Other Moves': ['larsen', 'bird']
};
export const firstMoves = Object.keys(defenses);
export function openingChoices(color, first) {
  return color === 'w' ? ['0', '2', '9', '6', '1', '3', '4', '5', '10', '11', '12', '7', '8', 'dutch', 'english-symmetrical', 'english-reversed', 'd5-vs-nf3'] : defenses[first] ?? defenses.e4;
}

export function positionKey(chess) {
  return chess.fen().split(' ').slice(0, 4).join(' ');
}

export function buildTree() {
  const tree = new Map();
  for (const [id, opening] of catalog) {
    for (const line of opening.lines) {
      const chess = new Chess();
      for (const [ply, san] of line.moves.entries()) {
        const position = positionKey(chess);
        const move = chess.move(san);
        if (!tree.has(position)) tree.set(position, new Map());
        const branches = tree.get(position);
        if (!branches.has(move.san)) branches.set(move.san, []);
        branches.get(move.san).push({id, line, ply: ply + 1, move});
      }
    }
  }
  return tree;
}
