import Phaser from "phaser";
import { Grid } from "./Grid";
import { Cell } from "./Cell";
import { PlayScene } from "../scenes/Play";
import { KeyScene, KEYS } from "../scenes/Keys";
import { LanguageManager } from "./LanguageManager";

export class Player extends Phaser.GameObjects.Sprite {
  public scene: PlayScene;
  public row: number;
  public col: number;
  public grid: Grid;

  public resources: number;

  private KEYS: KEYS;

  constructor(
    scene: PlayScene,
    row: number,
    col: number,
    grid: Grid,
    startingResources: number = 100, // New parameter
    texture: string = "player"
  ) {
    // convert logical to pixel for displaying cell
    const { x, y } = grid.logicalToPixelCoords(row, col);
    super(scene, x, y, texture);

    // store references
    this.scene = scene;
    this.grid = grid;
    this.row = row; // player logical coords
    this.col = col;

    this.scene.add.existing(this);

    // sprite configs
    const converage = 1;
    this.setOrigin(0.5);
    this.setDepth(10);
    this.setDisplaySize(grid.size * converage, grid.size * converage);
    this.anims.play("idle");

    this.KEYS = (this.scene.scene.get("sceneKeys") as KeyScene).KEYS;

    // initialize resources
    this.resources = startingResources; // Initialize with starting resources
    this.updatePlayerDisplay();

    // spawn player at current cell
    this.movePlayer(0, 0);
  }

  update(): void {
    this.checkForInput();
  }

  checkForInput(): void {
    const { KEYS } = this;

    switch (true) {
      case Phaser.Input.Keyboard.JustDown(KEYS.LEFT):
        this.movePlayer(-1, 0);
        this.scene.gameState.save();
        break;
      case Phaser.Input.Keyboard.JustDown(KEYS.RIGHT):
        this.movePlayer(1, 0);
        this.scene.gameState.save();
        break;
      case Phaser.Input.Keyboard.JustDown(KEYS.UP):
        this.movePlayer(0, -1);
        this.scene.gameState.save();
        break;
      case Phaser.Input.Keyboard.JustDown(KEYS.DOWN):
        this.movePlayer(0, 1);
        this.scene.gameState.save();
        break;
      default:
        break;
    }
  }

  movePlayer(dRow: number, dCol: number): void {
    const newRow = this.row + dRow;
    const newCol = this.col + dCol;

    if (this.isValidMove(newRow, newCol)) {
      this.updatePlayerCoordinates(newRow, newCol);

      this.displayCurrentCellStats();

      // make adjacent cells interactable
      this.updateCellInteractivity();
    }
  }

  updatePlayerCoordinates(newRow: number, newCol: number): void {
    // update player logical coordinates
    this.row = newRow;
    this.col = newCol;

    // update player pixel coordinates
    const coords = this.grid.logicalToPixelCoords(newRow, newCol);

    this.x = coords.x;
    this.y = coords.y;
  }

  isValidMove(row: number, col: number): boolean {
    const isWithinWidth = row >= 0 && row < this.grid.width;
    const isWithinHeight = col >= 0 && col < this.grid.height;

    return isWithinWidth && isWithinHeight;
  }

  spendResources(cost: number): boolean {
    if (this.resources >= cost) {
      this.resources -= cost;
      this.updatePlayerDisplay();
      return true;
    }

    return false;
  }

  collectResourcesFromCell(cell: Cell): void {
    if (cell.hasBuilding()) {
      const collected = cell.resources;
      cell.resetResources();

      this.resources += collected;
      this.scene.trackables.resourcesCollected += collected;

      this.updatePlayerDisplay();
      this.scene.stats.update(cell);

      this.scene.checkWinCondition();
    }
  }

  displayCurrentCellStats(): void {
    const currentCell = this.grid.getCell(this.row, this.col)!;
    this.scene.stats.update(currentCell);
  }

  updatePlayerDisplay(): void {
    const display = document.getElementById("playerDisplay");

    if (display) {
      display.innerHTML =
        `<span data-translate="resources">${LanguageManager.getTranslation(
          "resources"
        )}</span>: ${this.resources}<br />` +
        `<span data-translate="turns">${LanguageManager.getTranslation(
          "turns"
        )}</span>: ${this.scene.trackables.turnsPlayed}<br />` +
        `<span data-translate="buildingsPlaced">${LanguageManager.getTranslation(
          "buildingsPlaced"
        )}</span>: ${this.scene.trackables.buildingsPlaced}`;
    }
  }

  updateCellInteractivity(): void {
    this.grid.selectedCell = null;
    this.grid.lastSelectedCell = null;

    // disable interactivty on all cells
    this.grid.cells.forEach((cell) => {
      cell.disableClickable();
      cell.disableBorder();
    });

    // loop through all adjacent cells
    for (let row = this.row - 1; row < this.row + 2; row++) {
      for (let col = this.col - 1; col < this.col + 2; col++) {
        // check if cell is within bounds
        if (
          row >= 0 &&
          row < this.grid.width &&
          col >= 0 &&
          col < this.grid.height
        ) {
          // enable cell interactivity on adjacent cells
          const cell = this.grid.getCell(row, col)!;
          cell.setClickable();
        }
      }
    }
  }

  serialize(): { row: number; col: number; resources: number } {
    return {
      row: this.row,
      col: this.col,
      resources: this.resources,
    };
  }

  deserialize(data: { row: number; col: number; resources: number }): void {
    this.updatePlayerCoordinates(data.row, data.col);
    this.resources = data.resources;
  }
}
