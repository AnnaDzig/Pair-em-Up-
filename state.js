// state.js
export const state = {
  mode: null, // 'classic' | 'random' | 'chaotic'

  score: 0,
  timeSec: 0,
  timerId: null,

  width: 9,

  grid: [],
  selection: [],

  // Add numbers = tries
  addUses: 0,
  maxAddUses: 10,

  // undo
  lastMove: null,
  canRevert: false,

  // assists
  shuffleUses: 0,
  maxShuffleUses: 5,
  eraserUses: 0,
  maxEraserUses: 5,
  eraserMode: false,

  moves: 0,
  _won: false,
};
