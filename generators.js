import { shuffle } from "./utils.js";

// ---------- Classic mode ----------
export function generateClassicInitialGrid() {
  return [
    // Row 1: 123456789
    1, 2, 3, 4, 5, 6, 7, 8, 9,

    // Row 2: 111213141
    1, 1, 1, 2, 1, 3, 1, 4, 1,

    // Row 3: 516171819
    5, 1, 6, 1, 7, 1, 8, 1, 9,

    // Row 4: 212223242
    2, 1, 2, 2, 2, 3, 2, 4, 2,

    // Row 5: 526272829
    5, 2, 6, 2, 7, 2, 8, 2, 9,

    // Row 6: 313233343
    3, 1, 3, 2, 3, 3, 3, 4, 3,

    // Row 7: 536373839
    5, 3, 6, 3, 7, 3, 8, 3, 9,
  ];
}

// ---------- Random mode ----------
export function generateRandomInitialGrid() {
  const base = generateClassicInitialGrid().slice();
  shuffle(base);
  return base;
}

// ---------- Chaotic mode ----------
export function generateChaoticInitialGrid() {
  return Array.from({ length: 63 }, () => 1 + Math.floor(Math.random() * 9));
}
