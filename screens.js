import { el } from "./utils.js";

export function createRoot() {
  const root = el("div", { id: "app" });
  document.body.append(root);
  return root;
}

export function renderStartScreen(root, deps) {
  const { hasSavedGame, startNewGame, createModal, initSettingsUI, openModal, continueGame } = deps;
  const screen = el("section", { id: "start-screen" });
  const btnContinue = el("button",{ id: "btn-continue", disabled: !hasSavedGame() }, "Continue game");
  btnContinue.addEventListener("click", () => continueGame(root));
  
  // --- Title and author ---
  const title = el("h1", {}, "Pair ’em Up");
  const author = el(
    "p",
    {},
    "by ",
    el(
      "a",
      {
        href: "https://github.com/AnnaDzig",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      "@AnnaDzig"
    )
  );

  // --- Mode buttons row ---
  const modesRow = el("div", { class: "btn-row" });
  const btnClassic = el("button", { id: "btn-classic" }, "Classic");
  const btnRandom  = el("button", { id: "btn-random"  }, "Random");
  const btnChaotic = el("button", { id: "btn-chaotic" }, "Chaotic");
  btnContinue.addEventListener("click", () => continueGame(root));
  btnClassic.addEventListener("click", () => startNewGame(root, "classic"));
  btnRandom .addEventListener("click", () => startNewGame(root, "random"));
  btnChaotic.addEventListener("click", () => startNewGame(root, "chaotic"));

  modesRow.append(btnClassic, btnRandom, btnChaotic);

  // --- Utility buttons row ---
  const utilitiesRow = el("div", { class: "btn-row" });

  const btnSettings = el("button", { id: "btn-settings" }, "Settings");
  const btnResults  = el("button", { id: "btn-results"  }, "Results");

  btnSettings.addEventListener("click", () => openModal("settings-modal"));
  btnResults .addEventListener("click", () => openModal("results-modal"));

  utilitiesRow.append(btnContinue, btnSettings, btnResults);

  // --- Assemble main screen ---
  screen.append(title, author, modesRow, utilitiesRow);
  root.append(screen);

  // --- Create modals (provided by deps) ---
 // const settingsModal = createModal("settings-modal", "Settings");
 // const resultsModal  = createModal("results-modal", "Results");
  const table = el("table", { class: "results-table" });
  const headerRow = el("tr", {},
  el("th", {}, "Mode"),
  el("th", {}, "Score"),
  el("th", {}, "Time"),
  el("th", {}, "Result")
);
table.append(headerRow);
  //resultsModal.querySelector(".modal-box").append(table);
  //root.append(resultsModal);
  //initSettingsUI(settingsModal);
}
