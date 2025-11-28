import { shuffle } from "./utils.js";

// ---------- Classic mode  ----------
export function generateClassicInitialGrid() {
  return [
    // Row 1
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    // Row 2
    1, 1, 1, 2, 1, 3, 1, 4, 1,
    // Row 3
    5, 1, 6, 1, 7, 1, 8, 1, 9,
  ];
}

// ---------- Random mode  ----------
export function generateRandomInitialGrid() {
  const base = generateClassicInitialGrid().slice(); 
  shuffle(base);
  return base;
}

// ---------- Chaotic mode ----------
export function generateChaoticInitialGrid() {
  return Array.from({ length: 27 }, () => 1 + Math.floor(Math.random() * 9));
}
