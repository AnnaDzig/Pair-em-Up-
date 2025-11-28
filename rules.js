import { state } from "./state.js";

// ---------- Connectivity helpers ----------
export function row(i) { return Math.floor(i / state.width); }
export function col(i) { return i % state.width; }

export function isAdjacent(i, j) {
  if (i === j) return false;
  const rSame = row(i) === row(j);
  const cSame = col(i) === col(j);
  if (rSame && Math.abs(col(i) - col(j)) === 1) return true;
  if (cSame && Math.abs(row(i) - row(j)) === 1) return true;
  return false;
}

export function pathClearSameLine(i, j) {
  if (row(i) === row(j)) {
    const [a, b] = col(i) < col(j) ? [i, j] : [j, i];
    for (let k = a + 1; k < b; k++) {
      if (state.grid[k] != null) return false;
    }
    return true;
  }
  if (col(i) === col(j)) {
    const [a, b] = i < j ? [i, j] : [j, i];
    for (let k = a + state.width; k < b; k += state.width) {
      if (state.grid[k] != null) return false;
    }
    return true;
  }
  return false;
}

function rowStart(r)  { return r * state.width; }
function rowEnd(r)    { return r * state.width + (state.width - 1); }
function isRowEmpty(r) {
  const a = rowStart(r), b = rowEnd(r);
  for (let k = a; k <= b; k++) {
    if (state.grid[k] != null) return false;
  }
  return true;
}

export function isRowBoundaryConnectable(i, j) {
  const ri = row(i), rj = row(j);
  if (ri === rj) return false; 

  const forward = ri < rj;
  const from    = forward ? i : j;
  const to      = forward ? j : i;
  const rFrom   = row(from);
  const rTo     = row(to);

  for (let k = from + 1; k <= rowEnd(rFrom); k++) {
    if (state.grid[k] != null) return false;
  }

  for (let r = rFrom + 1; r < rTo; r++) {
    if (!isRowEmpty(r)) return false;
  }

  for (let k = rowStart(rTo); k < to; k++) {
    if (state.grid[k] != null) return false;
  }

  return true;
}

export function canConnect(i, j) {
  if (isAdjacent(i, j)) return true;
  if (pathClearSameLine(i, j)) return true;
  if (isRowBoundaryConnectable(i, j)) return true;
  return false;
}

export function scorePair(a, b) {
  if (a === 5 && b === 5) return 3;
  if (a === b) return 1;
  if (a + b === 10) return 2;
  return 0;
}
