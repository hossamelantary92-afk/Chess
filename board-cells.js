// Keep squares mounted so focus and loaded piece images survive a selection.
export function squareAt(board, index) {
  if (board.children[index]) return board.children[index];
  const button = document.createElement('button');
  button.type = 'button';
  board.append(button);
  return button;
}

const contents = new WeakMap();
export function paintSquare(button, markup) {
  if (contents.get(button) === markup) return;
  button.innerHTML = markup;
  contents.set(button, markup);
}
