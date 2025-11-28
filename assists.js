import { state } from "./state.js";
import { shuffle } from "./utils.js";

// ----------  Add Numbers ----------
export function collectRemainingDigitsInReadingOrder() {
  const out = [];
  for (let i = 0; i < state.grid.length; i++) {
    const v = state.grid[i];
    if (v != null) out.push(v);
  }
  return out;
}

export function shuffleNumbersInGridPreservingEmpties() {
  const values = [];
  for (let i = 0; i < state.grid.length; i++) {
    if (state.grid[i] != null) values.push(state.grid[i]);
  }
  if (values.length <= 1) return false;

  shuffle(values);

  let p = 0;
  for (let i = 0; i < state.grid.length; i++) {
    if (state.grid[i] != null) {
      state.grid[i] = values[p++];
    }
  }
  return true;
}

export function handleAddNumbers() {
  if (state.addUses >= state.maxAddUses) return { changed: false };

  const remaining = collectRemainingDigitsInReadingOrder();
  const n = remaining.length;
  if (n === 0) return { changed: false };

  let toAppend = [];

  if (state.mode === "classic") {
    toAppend = remaining;
  } else if (state.mode === "random") {
    toAppend = remaining.slice();
    shuffle(toAppend);
  } else if (state.mode === "chaotic") {
    toAppend = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 9));
  }

  const available = Math.max(0, state.maxCells - state.grid.length);
  if (available === 0) return { changed: false };

  if (toAppend.length > available) {
    toAppend = toAppend.slice(0, available);
  }

  if (toAppend.length === 0) return { changed: false };

  state.grid = state.grid.concat(toAppend);
  state.addUses += 1;
  state.selection = [];

  return { changed: true };
}

export function handleShuffle() {
  if (state.shuffleUses >= state.maxShuffleUses) return { changed: false };

  const ok = shuffleNumbersInGridPreservingEmpties();
  if (!ok) return { changed: false };

  state.shuffleUses += 1;
  state.eraserMode = false; // UX: turn off eraser if it was on
  state.selection = [];

  return { changed: true };
}

export function handleEraserToggle() {
  if (state.eraserUses >= state.maxEraserUses) {
    state.eraserMode = false;
    return { toggled: false, eraserMode: state.eraserMode };
  }
  state.eraserMode = !state.eraserMode;
  state.selection = [];
  return { toggled: true, eraserMode: state.eraserMode };
}

export function eraseCellAt(index) {
  if (state.eraserUses >= state.maxEraserUses) {
    state.eraserMode = false;
    return { erased: false };
  }
  if (!state.eraserMode) return { erased: false };
  if (state.grid[index] == null) return { erased: false };

  state.grid[index] = null;
  state.eraserUses += 1;
  state.eraserMode = false;
  state.selection = [];

  return { erased: true };
}
