import { state } from "./state.js";

// ---------- Position helpers ----------
export function row(index) {
  return Math.floor(index / state.width);
}

export function col(index) {
  return index % state.width;
}

// Same row: numbers can connect if all cells between them are empty
function isClearHorizontally(firstIndex, secondIndex) {
  if (row(firstIndex) !== row(secondIndex)) return false;

  const start = Math.min(firstIndex, secondIndex);
  const end = Math.max(firstIndex, secondIndex);

  for (let index = start + 1; index < end; index++) {
    if (state.grid[index] != null) {
      return false;
    }
  }

  return true;
}

function isClearVertically(firstIndex, secondIndex) {
  if (col(firstIndex) !== col(secondIndex)) return false;

  const start = Math.min(firstIndex, secondIndex);
  const end = Math.max(firstIndex, secondIndex);

  for (let index = start + state.width; index < end; index += state.width) {
    if (state.grid[index] != null) {
      return false;
    }
  }

  return true;
}

function isClearInReadingOrder(firstIndex, secondIndex) {
  const start = Math.min(firstIndex, secondIndex);
  const end = Math.max(firstIndex, secondIndex);

  for (let index = start + 1; index < end; index++) {
    if (state.grid[index] != null) {
      return false;
    }
  }

  return true;
}

export function canConnect(firstIndex, secondIndex) {
  if (firstIndex === secondIndex) return false;

  return (
    isClearHorizontally(firstIndex, secondIndex) ||
    isClearVertically(firstIndex, secondIndex) ||
    isClearInReadingOrder(firstIndex, secondIndex)
  );
}

export function scorePair(firstNumber, secondNumber) {
  if (firstNumber === secondNumber) return 1;
  if (firstNumber + secondNumber === 10) return 1;

  return 0;
}
