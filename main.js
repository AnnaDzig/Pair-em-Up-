import { el, shuffle, formatTime } from "./utils.js";
import { state } from "./state.js";
import {
  generateClassicInitialGrid,
  generateRandomInitialGrid,
  generateChaoticInitialGrid,
} from "./generators.js";
import { canConnect, scorePair } from "./rules.js";
import {
  handleAddNumbers,
  handleShuffle,
  handleEraserToggle,
  eraseCellAt,
} from "./assists.js";
import { createRoot, renderStartScreen } from "./screens.js";

let START_DEPS = null;
state._won = false;
state._lost = false;

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  state.timeSec = 0;
  const timeEl = document.getElementById("time");
  if (timeEl) timeEl.textContent = formatTime(state.timeSec);

  state.timerId = setInterval(() => {
    state.timeSec += 1;
    const t = document.getElementById("time");
    if (t) t.textContent = formatTime(state.timeSec);
  }, 1000);
}

function startTimerAt(initialSeconds) {
  stopTimer();
  state.timeSec = initialSeconds | 0;
  const timeEl = document.getElementById("time");
  if (timeEl) timeEl.textContent = formatTime(state.timeSec);

  state.timerId = setInterval(() => {
    state.timeSec += 1;
    const t = document.getElementById("time");
    if (t) t.textContent = formatTime(state.timeSec);
  }, 1000);
}


// ---------- Grid helpers ----------

function seedGridForDemo(mode) {
  if (mode === "chaotic") {
    return Array.from({ length: 27 }, () => 1 + Math.floor(Math.random() * 9));
  }
  return Array.from({ length: 27 }, (_, i) => i + 1);
}

function toggleSelect(i) {
  const pos = state.selection.indexOf(i);
  if (pos !== -1) {
    state.selection.splice(pos, 1); 
  } else {
    state.selection.push(i);
    if (state.selection.length === 2) {
      const [aIdx, bIdx] = state.selection;
      checkPair(aIdx, bIdx);
      return; 
    }
    if (state._won || state._lost) return;
  }
  renderGrid();
}


function checkPair(aIndex, bIndex) {
  const a = state.grid[aIndex];
  const b = state.grid[bIndex];

  if (a == null || b == null) {
    state.selection = [];
    renderGrid();
    return;
  }

  if (!canConnect(aIndex, bIndex)) {
    } else {
  // Wrong pair feedback
  const gridEl = document.getElementById("grid");
  if (gridEl) {
    for (const idx of [aIndex, bIndex]) {
      const cell = gridEl.querySelector(`[data-i="${idx}"]`);
      if (cell) cell.classList.add("wrong");
    }
    // Remove the "wrong" class after animation ends
    setTimeout(() => {
      for (const idx of [aIndex, bIndex]) {
        const cell = gridEl.querySelector(`[data-i="${idx}"]`);
        if (cell) cell.classList.remove("wrong");
      }
      state.selection = [];
      renderGrid();
    }, 400);
  }
  }

  const points = scorePair(a, b);
  if (points > 0) {
    applyPair(aIndex, bIndex, points); // handles UI + win + undo snapshot
  } else {
    setTimeout(() => {
      state.selection = [];
      renderGrid();
    }, 250);
  }
}

function updateScore() {
  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.textContent = state.score;
}

function showWinMessage() {
  if (state._won) return;    
  state._won = true;

  stopTimer();
 // document.body.classList.add("win");

  // record the result
  addResult({
    mode: state.mode,
    score: state.score,
    timeSec: state.timeSec,
    moves: state.moves,
    win: true,
  });
  clearSave?.();
   const res = document.getElementById("results-modal");
  if (res) {
    initResultsUI?.(res);     
    openModal("results-modal");
  }

  function checkLose(trigger = "") {
  // 2) Grid limit lose (immediate on reach)
  if (state.grid.length >= state.maxCells) {
    return showLoseMessage("grid-limit");
  }

  // 1) No moves & no assists left
  const moves = computeValidMovesCount(); // 0..6
  const hasAssists = assistsAvailable();
  if (moves === 0 && !hasAssists) {
    return showLoseMessage("no-moves");
  }
  // else still playable
}

function showLoseMessage(reason) {
  if (state._lost || state._won) return;
  state._lost = true;
  stopTimer();

  addResult?.({
    mode: state.mode,
    score: state.score,
    timeSec: state.timeSec,
    moves: state.moves,
    win: false,
    reason,
  });

  const res = document.getElementById("results-modal");
  if (res) {
    initResultsUI?.(res);
    openModal("results-modal");
  }
}


  // Rebuild start screen first (so modal exists)
  const root = document.getElementById("app");
  if (root) {
    root.innerHTML = "";
    renderStartScreen(root, {
      hasSavedGame,
      startNewGame,
      createModal,
      initSettingsUI,
      openModal,
      continueGame,
    });
  }



  const resultsModal = document.getElementById("results-modal");
  if (resultsModal) {
    initResultsUI(resultsModal);
    openModal("results-modal");
  }
}

function renderGrid() {
  const gridEl = document.getElementById("grid");
  if (!gridEl) return;

  gridEl.innerHTML = "";
  for (let i = 0; i < state.grid.length; i++) {
    const val = state.grid[i];
    const isEmpty = val == null;

    const cell = el(
      "button",
      {
        class: `cell${isEmpty ? " empty" : ""}${state.selection.includes(i) ? " selected" : ""}`,
        disabled: isEmpty,
        "data-i": String(i),
        "aria-pressed": state.selection.includes(i) ? "true" : "false",
      },
      isEmpty ? "" : String(val)
    );

    if (!isEmpty) {
cell.addEventListener("click", () => {
  if (state.eraserMode) {
   const r = eraseCellAt(i);
    if (r.erased) {
      renderGrid();
      updateAssistButtons();
      updateHintCount?.();
      updateRevertButton?.();
      checkLose("after-eraser");
    }
      return;
  }
  toggleSelect(i);
});
    }

    gridEl.append(cell);
  }
}


function hasSavedGame() {
  try {
    return !!localStorage.getItem("peu:save");
  } catch {
    return false;
  }
}

// ---------- Save / Load ----------
const SAVE_KEY = "peu:save";

function serializeSave() {
  return JSON.stringify({
    mode: state.mode,
    grid: state.grid,
    score: state.score,
    timeSec: state.timeSec,
    selection: state.selection,

    // assists
    addUses: state.addUses,
    shuffleUses: state.shuffleUses,
    eraserUses: state.eraserUses,
    eraserMode: state.eraserMode,

    // undo
    lastMove: state.lastMove,
    canRevert: state.canRevert,
  });
}

function applyLoadedSave(s) {
  state.mode        = s.mode;
  state.grid        = s.grid;
  state.score       = s.score;
  state.timeSec     = s.timeSec;
  state.selection   = Array.isArray(s.selection) ? s.selection : [];

  state.addUses     = s.addUses ?? 0;
  state.shuffleUses = s.shuffleUses ?? 0;
  state.eraserUses  = s.eraserUses ?? 0;
  state.eraserMode  = !!s.eraserMode;

  state.lastMove    = s.lastMove ?? null;
  state.canRevert   = !!s.canRevert;
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, serializeSave());
  } catch {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    applyLoadedSave(data);
    return true;
  } catch {
    return false;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}

function continueGame(root) {
  if (!loadGame()) return;

  renderGameScreen(root);

  updateScore();
  updateAssistButtons?.();
  updateRevertButton?.();
  updateHintCount?.();

  startTimerAt(state.timeSec);
}

// ---------- Results / History ----------
const RESULTS_KEY = "peu:results"; // array of last 5 items

function loadResults() {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveResults(arr) {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(arr));
  } catch {}
}

// result = { mode, score, timeSec, moves, win } 
function addResult(result) {
  const list = loadResults();

  list.push(result);
  list.sort((a, b) => (a.timeSec|0) - (b.timeSec|0));

  const trimmed = list.slice(0, 5);

  saveResults(trimmed);
  return trimmed;
}

function formatMode(m) {
  return m === "classic" ? "Classic" : m === "random" ? "Random" : "Chaotic";
}

// ---------- Settings (theme) ----------
const SETTINGS_KEY = "peu:settings";

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { theme: "light" };
  } catch {
    return { theme: "light" };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
  }
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
}

function initSettingsUI(settingsModalEl) {
  // clear box content and re-build with controls
  const box = settingsModalEl.querySelector(".modal-box");

  // remove previous content except close button
  box.innerHTML = "";
  const title = el("h2", {}, "Settings");
  const closeBtn = el("button", { class: "close-btn" }, "×");
  closeBtn.addEventListener("click", () => closeModal("settings-modal"));

  // load current settings
  const settings = loadSettings();
  applyTheme(settings.theme);

  // theme row
  const wrap = el("div", { style: "margin-top: 1rem;" });
  const label = el("p", {}, "Theme: ", el("strong", { id: "theme-label" }, settings.theme));

  const toggleBtn = el(
    "button",
    { id: "theme-toggle-btn", style: "margin-top: 0.5rem;" },
    settings.theme === "dark" ? "Switch to Light" : "Switch to Dark"
  );

  toggleBtn.addEventListener("click", () => {
    const current = loadSettings();
    const nextTheme = current.theme === "dark" ? "light" : "dark";
    const updated = { ...current, theme: nextTheme };
    saveSettings(updated);
    applyTheme(nextTheme);

    // update UI labels
    const lbl = box.querySelector("#theme-label");
    if (lbl) lbl.textContent = nextTheme;
    toggleBtn.textContent = nextTheme === "dark" ? "Switch to Light" : "Switch to Dark";
  });

  wrap.append(label, toggleBtn);

  box.append(title, closeBtn, wrap);
}

// Build / refresh the Results modal contents
function initResultsUI(resultsModalEl) {
  const box = resultsModalEl.querySelector(".modal-box");
  box.innerHTML = "";

  const title = el("h2", {}, "Results");
  const info  = el("p", {}, "Latest 5 games (sorted by time). Trophy = win.");

  const table = el("table", { class: "results-table" });
  const thead = el("thead", {},
    el("tr", {},
      el("th", {}, "Mode"),
      el("th", {}, "Score"),
      el("th", {}, "Time"),
      el("th", {}, "Moves"),
      el("th", {}, "Win")
    )
  );
  const tbody = el("tbody", { id: "results-tbody" });

  const results = loadResults();
  if (results.length === 0) {
    const emptyMsg = el("p", { style: "margin-top: .5rem;" }, "No games yet.");
    box.append(title, info, emptyMsg);
    return;
  }

  for (const r of results) {
    const tr = el("tr", {},
      el("td", {}, formatMode(r.mode)),
      el("td", {}, String(r.score)),
      el("td", {}, formatTime(r.timeSec|0)),
      el("td", {}, String(r.moves|0)),
      el("td", {}, r.win ? "🏆" : "—")
    );
    tbody.append(tr);
  }

  table.append(thead, tbody);
  box.append(title, info, table);
// Action buttons
const actions = el("div", { class: "btn-row", style: "margin-top: .75rem;" });

const btnAgain = el("button", {}, "Play again");
btnAgain.addEventListener("click", () => {
  closeModal("results-modal");
  state._won = false;
  // restart the same mode in place
  const root = document.getElementById("app");
  if (root) startNewGame(root, state.mode);
});

const btnMenu = el("button", {}, "Main menu");
btnMenu.addEventListener("click", () => {
  closeModal("results-modal");
  gotoMainMenu();
});

actions.append(btnAgain, btnMenu);
box.append(actions);

  const closeBtn = el("button", { class: "close-btn", style: "margin-top:.75rem;" }, "Close");
  closeBtn.addEventListener("click", () => closeModal("results-modal"));
  box.append(closeBtn);
}

function refreshResultsUI() {
  const modal = document.getElementById("results-modal");
  if (modal) initResultsUI(modal);
}

// ---------- Modal helpers ----------

// Create a modal overlay element
function createModal(id, titleText) {
  const overlay = el("div", { id, class: "modal hidden" });

  const box = el("div", { class: "modal-box" });
  const title = el("h2", {}, titleText);
  const closeBtn = el("button", { class: "close-btn" }, "×");

  closeBtn.addEventListener("click", () => closeModal(id));

  box.append(title, closeBtn);
  overlay.append(box);

  return overlay;
  // build initial Results UI content
const resultsModal = document.getElementById("results-modal");
if (resultsModal) initResultsUI(resultsModal);

}

// Show modal
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("hidden");
}

// Hide modal
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("hidden");
}

function updateAssistButtons() {
  const addBtn = document.getElementById("btn-add");
  if (addBtn) {
    addBtn.textContent = `Add numbers (${state.addUses}/${state.maxAddUses})`;
    const atUsageCap = state.addUses >= state.maxAddUses;
    const atGridCap  = state.grid.length >= state.maxCells;
    addBtn.disabled = atUsageCap || atGridCap;
  }

   const shBtn = document.getElementById("btn-shuffle");
  if (shBtn) {
    shBtn.textContent = `Shuffle (${state.shuffleUses}/${state.maxShuffleUses})`;
    shBtn.disabled = state.shuffleUses >= state.maxShuffleUses;
  }

   const erBtn = document.getElementById("btn-eraser");
  if (erBtn) {
    erBtn.textContent = state.eraserMode
      ? `Eraser ON (${state.eraserUses}/${state.maxEraserUses})`
      : `Eraser (${state.eraserUses}/${state.maxEraserUses})`;
    erBtn.disabled = state.eraserUses >= state.maxEraserUses;
  }
}


function applyPair(aIndex, bIndex, points) {
  if (state._won || state._lost) return;

  const aVal = state.grid[aIndex];
  const bVal = state.grid[bIndex];

  // remove numbers
  state.grid[aIndex] = null;
  state.grid[bIndex] = null;

  // update score & moves
  state.score += points;
  state.moves += 1;

  // store undo snapshot
  state.lastMove = { aIndex, bIndex, aVal, bVal, points };
  state.canRevert = true;

  // UI refresh
  state.selection = [];
 updateScore?.();
  renderGrid?.();
  updateAssistButtons?.();
  updateRevertButton?.();
  updateHintCount?.();

  // check win AFTER UI update
   if (state.score >= state.target) {
    showWinMessage?.();
  } else {
    checkLose?.("after-pair");
  }
}

function revertLastMove() {
  if (!state.canRevert || !state.lastMove || state._won || state._lost) return;

  const { aIndex, bIndex, aVal, bVal, points } = state.lastMove;

  state.grid[aIndex] = aVal;
  state.grid[bIndex] = bVal;
  state.score = Math.max(0, state.score - points);

  state.lastMove = null;
  state.canRevert = false;
 updateScore?.();
  renderGrid?.();
  updateAssistButtons?.();
  updateHintCount?.();
  updateRevertButton?.();

  checkLose?.("after-revert");
}

function updateHintCount() {
  const hintBtn = document.getElementById("btn-hint");
  if (!hintBtn) return;

  let count = 0;
  const n = state.grid.length;

  const filled = [];
  for (let i = 0; i < n; i++) if (state.grid[i] != null) filled.push(i);

  for (let a = 0; a < filled.length; a++) {
    for (let b = a + 1; b < filled.length; b++) {
      const i = filled[a], j = filled[b];
      if (!canConnect(i, j)) continue;

      const points = scorePair(state.grid[i], state.grid[j]);
      if (points > 0) {
        count++;
        if (count >= 5) {
          hintBtn.textContent = "Hints: 5+";
          return;
        }
      }
    }
  }
  hintBtn.textContent = `Hints: ${count}`;
}

function computeValidMovesCount() {
  let count = 0;
  const filled = [];
  for (let i = 0; i < state.grid.length; i++) {
    if (state.grid[i] != null) filled.push(i);
  }
  for (let a = 0; a < filled.length; a++) {
    for (let b = a + 1; b < filled.length; b++) {
      const i = filled[a], j = filled[b];
      if (!canConnect(i, j)) continue;
      if (scorePair(state.grid[i], state.grid[j]) > 0) {
        count++;
        if (count >= 6) return 6; // represent "5+"
      }
    }
  }
  return count; // 0..6
}

function assistsAvailable() {
  const canAdd = state.addUses < state.maxAddUses && state.grid.length < state.maxCells;
  const canShuffle = state.shuffleUses < state.maxShuffleUses;
  const canEraser  = state.eraserUses  < state.maxEraserUses;
  return canAdd || canShuffle || canEraser;
}

function updateRevertButton() {
  const r = document.getElementById("btn-revert");
  if (r) r.disabled = !state.canRevert;
}


// Start a new game for the chosen mode
function startNewGame(root, mode) {
  document.body.classList.remove("win");
  state.mode = mode;     // 'classic' | 'random' | 'chaotic'
  state.score = 0;
  state.timeSec = 0;
  state.selection = [];
  state.addUses = 0;
  state.shuffleUses = 0;
  state.eraserUses = 0;
  state.eraserMode = false;
  state.canRevert = false;
  state.lastMove = null;
  state.moves = 0;
  state._won = false;
  state._lost = false;

  // initial grid by mode
if (mode === "classic") {
  state.grid = generateClassicInitialGrid();
} else if (mode === "random") {
  state.grid = generateRandomInitialGrid();
} else if (mode === "chaotic") {
  state.grid = generateChaoticInitialGrid();
} else {
  state.grid = Array(27).fill(null);
}

  renderGameScreen(root);
  startTimer();
  updateAssistButtons();
}

function renderGameScreen(root) {
  root.innerHTML = "";

  const game = el("section", { id: "game" });

  const header = el("div", { class: "game-header" });

  const modeBadge = el(
    "div",
    { class: "mode-badge" },
    state.mode === "classic" ? "Classic"
      : state.mode === "random" ? "Random"
      : "Chaotic"
  );

  const scoreBox = el(
    "div",
    { class: "score" },
    "Score: ",
    el("strong", { id: "score" }, String(state.score)),
    " / ",
    String(state.target)
  );

  const timerBox = el("div", { class: "timer" }, "Time: ", el("strong", { id: "time" }, "00:00"));
  header.append(modeBadge, scoreBox, timerBox);

  const controls = el("div", { class: "game-controls" });
const btnReset  = el("button", { id: "btn-reset",  class: "action-btn" }, "Reset");
const btnSave   = el("button", { id: "btn-save",   class: "action-btn" }, "Save");
const btnHint   = el("button", { id: "btn-hint",   class: "action-btn" }, "Hints: ?");
const btnRevert = el("button", { id: "btn-revert", class: "action-btn" }, "Revert");
const btnAdd    = el("button", { id: "btn-add",    class: "action-btn" }, `Add numbers (${state.addUses}/${state.maxAddUses})`);
const btnMenu   = el("button", { id: "btn-menu",   class: "action-btn" }, "Main menu");
 // rebuild Results UI after returning to menu
const resModal = document.getElementById("results-modal");
if (resModal) initResultsUI(resModal);

  btnReset.addEventListener("click", () => {
    startNewGame(root, state.mode);
  });

  btnSave.addEventListener("click", () => {
  btnSave.classList.add("clicked");
    setTimeout(() => btnSave.classList.remove("clicked"), 400);
    saveGame();
  console.log("[save] game saved");
  });
  
 btnMenu.addEventListener("click", () => {
  stopTimer();
  root.innerHTML = "";
  renderStartScreen(root, {
    hasSavedGame,
    startNewGame,
    createModal,
    initSettingsUI,
    openModal,
    continueGame,
  });
    const res = document.getElementById("results-modal");
  if (res) initResultsUI?.(res);
});

  btnHint.addEventListener("click", () => updateHintCount());
  btnRevert.addEventListener("click", () => { revertLastMove()});

btnAdd.addEventListener("click", () => {
  const res = handleAddNumbers();
  if (res?.atCap) {
      checkLose("grid-cap-before-add");
    return;
  }
  if (res?.changed) {
     checkLose("after-add");
  }
}); 
  
const btnShuffle = el("button", { id: "btn-shuffle" }, `Shuffle (${state.shuffleUses}/${state.maxShuffleUses})`);
btnShuffle.addEventListener("click", () => {
    const res = handleShuffle();
  if (res?.changed) {
    renderGrid();
    updateAssistButtons();
    updateHintCount?.();
    updateRevertButton?.();
    checkLose("after-shuffle");
  }
});


const btnEraser  = el("button", { id: "btn-eraser"  }, `Eraser (${state.eraserUses}/${state.maxEraserUses})`);
btnEraser.addEventListener("click", () => {
const t = handleEraserToggle();
  updateAssistButtons();
});

  controls.append(btnReset, btnSave, btnHint, btnRevert, btnAdd, btnShuffle, btnEraser, btnMenu);

  const grid = el("div", { id: "grid" });

  game.append(header, controls, grid);
  root.append(game);

  renderGrid();
  updateHintCount();
  updateRevertButton();
  updateAssistButtons?.();
}

// ---------- Persistent modals  ----------
const settingsModal = createModal("settings-modal", "Settings");
const resultsModal = createModal("results-modal", "Results");
document.body.append(settingsModal, resultsModal);

initSettingsUI(settingsModal);
initResultsUI?.(resultsModal);

// Boot
(function start() {
  const s = loadSettings();
  applyTheme(s.theme);

  const root = createRoot();
  START_DEPS = {
    hasSavedGame,
    startNewGame,
    createModal,
    initSettingsUI,
    openModal,
    continueGame,
  };
  renderStartScreen(root, START_DEPS);
  const resultsModal = document.getElementById("results-modal");
  if (resultsModal) initResultsUI(resultsModal);
})();

window.addEventListener("beforeunload", () => {
  if (state.mode && state.grid && state.grid.length) {
    saveGame();
  }
});

function gotoMainMenu() {
  const root = document.getElementById("app");
  if (!root) return;
  stopTimer();
  root.innerHTML = "";
  renderStartScreen(root, START_DEPS);
  const res = document.getElementById("results-modal");
  if (res) initResultsUI(res);
}

