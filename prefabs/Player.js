import Phaser from "../../lib/phaser.js";
import { LanguageManager } from "./LanguageManager.js";
export class Player extends Phaser.GameObjects.Sprite {
    scene;
    row;
    col;
    grid;
    resources;
    KEYS;
    constructor(scene, row, col, grid, startingResources = 100, // New parameter
    texture = "player") {
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
        this.KEYS = this.scene.scene.get("sceneKeys").KEYS;
        // initialize resources
        this.resources = startingResources; // Initialize with starting resources
        this.updatePlayerDisplay();
        // spawn player at current cell
        this.movePlayer(0, 0);
    }
    update() {
        this.checkForInput();
    }
    checkForInput() {
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
    movePlayer(dRow, dCol) {
        const newRow = this.row + dRow;
        const newCol = this.col + dCol;
        if (this.isValidMove(newRow, newCol)) {
            this.updatePlayerCoordinates(newRow, newCol);
            this.displayCurrentCellStats();
            // make adjacent cells interactable
            this.updateCellInteractivity();
        }
    }
    updatePlayerCoordinates(newRow, newCol) {
        // update player logical coordinates
        this.row = newRow;
        this.col = newCol;
        // update player pixel coordinates
        const coords = this.grid.logicalToPixelCoords(newRow, newCol);
        this.x = coords.x;
        this.y = coords.y;
    }
    isValidMove(row, col) {
        const isWithinWidth = row >= 0 && row < this.grid.width;
        const isWithinHeight = col >= 0 && col < this.grid.height;
        return isWithinWidth && isWithinHeight;
    }
    spendResources(cost) {
        if (this.resources >= cost) {
            this.resources -= cost;
            this.updatePlayerDisplay();
            return true;
        }
        return false;
    }
    collectResourcesFromCell(cell) {
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
    displayCurrentCellStats() {
        const currentCell = this.grid.getCell(this.row, this.col);
        this.scene.stats.update(currentCell);
    }
    updatePlayerDisplay() {
        const display = document.getElementById("playerDisplay");
        if (display) {
            display.innerHTML =
                `<span data-translate="resources">${LanguageManager.getTranslation("resources")}</span>: ${this.resources}<br />` +
                    `<span data-translate="turns">${LanguageManager.getTranslation("turns")}</span>: ${this.scene.trackables.turnsPlayed}<br />` +
                    `<span data-translate="buildingsPlaced">${LanguageManager.getTranslation("buildingsPlaced")}</span>: ${this.scene.trackables.buildingsPlaced}`;
        }
    }
    updateCellInteractivity() {
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
                if (row >= 0 &&
                    row < this.grid.width &&
                    col >= 0 &&
                    col < this.grid.height) {
                    // enable cell interactivity on adjacent cells
                    const cell = this.grid.getCell(row, col);
                    cell.setClickable();
                }
            }
        }
    }
    serialize() {
        return {
            row: this.row,
            col: this.col,
            resources: this.resources,
        };
    }
    deserialize(data) {
        this.updatePlayerCoordinates(data.row, data.col);
        this.resources = data.resources;
    }
}
