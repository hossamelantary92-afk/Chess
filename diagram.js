export function drawDiagram(board, position, lastMove, flip = false) {
  const rows = position.split(' ')[0].split('/').map(row =>
    [...row].flatMap(char => Number(char) ? Array(Number(char)).fill('') : [char]));
  const build = board.children.length !== 64;
  const fragment = build ? document.createDocumentFragment() : null;
  for (let i = 0; i < 64; i++) {
    const index = flip ? 63-i : i;
    const row = Math.floor(index / 8), file = index % 8;
    const square = 'abcdefgh'[file] + (8-row);
    const cell = build ? document.createElement('span') : board.children[i];
    cell.dataset.square = square;
    cell.className = 'tile' + ((row+file)%2 ? ' shaded' : '');
    if (lastMove && (lastMove.from === square || lastMove.to === square)) cell.classList.add('recent');
    const piece = rows[row][file];
    if (piece !== (cell.dataset.piece || '')) {
      if (piece) {
        const img = cell.firstElementChild || document.createElement('img');
        img.src = 'pieces/' + (piece === piece.toUpperCase() ? 'w' : 'b') + piece.toUpperCase() + '.svg';
        img.alt = ''; img.draggable = false;
        if (!img.parentNode) cell.append(img);
      } else cell.replaceChildren();
      cell.dataset.piece = piece;
    }
    if (build) fragment.append(cell);
  }
  if (build) board.replaceChildren(fragment);
}
