import { PlayScene } from "../scenes/Play";
import { LanguageManager } from "./LanguageManager";

// Source: Brace helped refactor ButtonManager to adopt a state approach to
// displaying save/load buttons, along with their respective slot buttons.

export class ButtonManager {
  public scene: PlayScene;
  private state: string;

  constructor(scene: PlayScene) {
    this.scene = scene;
    this.state = "main";

    // create game buttons
    this.initButtons();
  }

  initButtons(): void {
    // create Save/Load buttons
    this.createButton("saveButton", () => this.showSlot("save"));
    this.createButton("loadButton", () => this.showSlot("load"));

    // create Save/Load slot buttons
    for (let i = 1; i <= 3; i++) {
      this.createButton(`saveSlot${i}`, () => this.handleSaveSlot(i), LanguageManager.getTranslation(`file${i}`));
      this.createButton(`loadSlot${i}`, () => this.handleLoadSlot(i), LanguageManager.getTranslation(`file${i}`));
    }

    // create "exit slots" button
    this.createButton("exitButton", () => this.returnToMain());

    // create player action buttons
    this.createPurchaseButtons();
    this.createNextRoundButton();
    this.createUndoButton();
    this.createRedoButton();

    this.updateUI();
  }

  showSlot(type: string): void {
    this.state = type;
    this.updateUI();
  }

  handleSaveSlot(slot: number): void {
    this.scene.gameState.saveToSlot(slot);
    this.returnToMain();
  }

  handleLoadSlot(slot: number): void {
    this.scene.gameState.loadFromSlot(slot);
    this.returnToMain();
  }

  returnToMain(): void {
    this.state = "main";
    this.updateUI();
  }

  updateUI(): void {
    const isMain = this.state === "main";
    const isSave = this.state === "save";
    const isLoad = this.state === "load";

    this.toggleVisibility(["saveButton", "loadButton"], isMain);
    this.toggleVisibility(["saveSlot1", "saveSlot2", "saveSlot3"], isSave);
    this.toggleVisibility(["loadSlot1", "loadSlot2", "loadSlot3"], isLoad);
    this.toggleVisibility(["exitButton"], isSave || isLoad);
    this.toggleVisibility(["undoButton"], !isSave && !isLoad);
    this.toggleVisibility(["redoButton"], !isSave && !isLoad);
  }

  createPurchaseButtons(): void {
    // create purchase buttons for each building type
    this.scene.buildings.forEach((building, index) => {
      const id = `buy${building.type}Button`;
      const text = `${LanguageManager.getTranslation(
        `buy${building.type}`
      )}: $${building.cost}`;

      this.createButton(id, () => this.purchaseBuilding(index), text);
      this.toggleVisibility([id], true); // always show
    });
  }

  purchaseBuilding(index: number): void {
    const building = this.scene.buildings[index];
    const { grid, player, gameState, stats, trackables } = this.scene;

    if (this.canPlaceBuilding(building.cost)) {
      player.spendResources(building.cost);

      // place building
      grid.selectedCell?.setBuilding(index);

      // update game stats
      trackables.buildingsPlaced++;
      stats.update(grid.selectedCell!);
      player.updatePlayerDisplay();

      gameState.save();
    }
  }

  canPlaceBuilding(cost: number): boolean {
    return (
      this.scene.grid.selectedCell != null &&
      this.scene.player.resources >= cost &&
      this.scene.grid.selectedCell.buildingRef < 0
    );
  }

  createNextRoundButton(): void {
    const button = document.getElementById("nextRoundButton");

    button?.addEventListener("click", () => {
      this.scene.startNextRound();
    });
  }

  createUndoButton(): void {
    const undoButton = document.getElementById("undoButton");

    undoButton?.addEventListener("click", () => {
      this.scene.gameState.undo();
    });
  }

  createRedoButton(): void {
    const redoButton = document.getElementById("redoButton");

    redoButton?.addEventListener("click", () => {
      this.scene.gameState.redo();
    });
  }

  // Helpers
  createButton(
    id: string,
    handler: (this: GlobalEventHandlers, ev: MouseEvent) => any,
    text?: string
  ): void {
    const button = document.getElementById(id);

    if (button) {
      if (text) button.innerHTML = text;
      button.className = "hidden";
      button.onclick = handler;
    }
  }

  toggleVisibility(ids: string[], show: boolean): void {
    ids.forEach((id) => {
      const element = document.getElementById(id);
      element?.classList.toggle("hidden", !show);
    });
  }
}
