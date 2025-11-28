// state.js
export const state = {
  mode: null,          // 'classic' | 'random' | 'chaotic'
  score: 0,
  target: 100,
  timeSec: 0,
  timerId: null,
  width: 9,           // grid is 9 columns wide

  grid: [],
  selection: [],

  // assists: Add
  addUses: 0,
  maxAddUses: 10,
  maxCells: 9 * 50,   // 50-row limit

  // undo
  lastMove: null,
  canRevert: false,

  // assists: Shuffle / Eraser
  shuffleUses: 0,
  maxShuffleUses: 5,
  eraserUses: 0,
  maxEraserUses: 5,
  eraserMode: false,

  nextClassicNumber: 20,
};
