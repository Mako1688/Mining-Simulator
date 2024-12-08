import Phaser from "../../lib/phaser.js";
export class Cell extends Phaser.GameObjects.Sprite {
    scene;
    row;
    col;
    grid;
    buildingRef = -1;
    level = 0;
    sunLevel = 0;
    waterLevel = 0;
    resources = 0;
    isUnplacable = false;
    isClickable = false;
    border;
    buildingIcon = null;
    constructor(scene, row, col, grid, texture = "cell") {
        // convert logical to pixel for displaying cell
        const { x, y } = grid.logicalToPixelCoords(row, col);
        super(scene, x, y, texture);
        // store references
        this.scene = scene;
        this.row = row;
        this.col = col;
        this.grid = grid;
        this.scene.add.existing(this);
        // sprite configs
        this.setOrigin(0.5);
        this.setDisplaySize(grid.size, grid.size);
        // cell properties/behaviors
        this.createBorder();
        this.enableMouseEvents();
    }
    createBorder() {
        this.border = this.scene.add.graphics();
        // set border appearance
        this.border.lineStyle(2, 0x34eba8, 1);
        this.border.strokeRect(this.x - this.displayWidth / 2, this.y - this.displayHeight / 2, this.displayWidth, this.displayHeight);
        // hide border when created
        this.disableBorder();
    }
    enableMouseEvents() {
        this.setInteractive();
        this.on("pointerdown", () => {
            this.grid.selectCell(this.row, this.col);
        });
    }
    displayBuilding() {
        if (this.hasBuilding()) {
            const { scale } = this.scene.buildings[this.buildingRef];
            const texture = this.getTexture();
            if (this.buildingIcon) {
                // redraw sprite if one exists
                this.buildingIcon.setTexture(texture);
            }
            else {
                // create new sprite
                this.buildingIcon = this.scene.add.sprite(this.x, this.y, texture);
                // sprite configs
                this.buildingIcon.setOrigin(0.5);
                this.buildingIcon.setScale(scale);
            }
        }
    }
    step() {
        this.updateLevel();
        this.updateSunLevel();
        this.updateWaterLevel();
        this.generateResources();
    }
    generateResources() {
        if (this.hasBuilding()) {
            const { rate } = this.scene.buildings[this.buildingRef];
            this.resources += (this.sunLevel + this.waterLevel) * rate;
        }
    }
    updateSunLevel() {
        const value = Phaser.Math.Between(1, 5);
        this.setSunLevel(value);
    }
    updateWaterLevel() {
        const value = Phaser.Math.Between(0, 5);
        this.setWaterLevel(value);
    }
    updateLevel() {
        if (this.hasBuilding()) {
            const building = this.scene.buildings[this.buildingRef];
            if (building.growthRule === "default") {
                const uniqueCount = new Set(this.getAdjacentBuildings()).size;
                if (uniqueCount >= 2 && !this.maxLevelReached()) {
                    this.level++;
                }
            }
            else if (building.growthRule === "waterSun") {
                if (this.sunLevel >= 3 && this.waterLevel >= 3) {
                    this.level = 3;
                }
                else if (this.sunLevel >= 2 && this.waterLevel >= 2) {
                    this.level = 2;
                }
                else {
                    this.level = 1;
                }
            }
            this.displayBuilding();
        }
    }
    resetResources() {
        this.resources = 0;
    }
    restore({ buildingRef, level, sunLevel, waterLevel, resources, }) {
        this.buildingRef = buildingRef;
        this.level = level;
        this.sunLevel = sunLevel;
        this.waterLevel = waterLevel;
        this.resources = resources;
        this.removeBuildingSprite();
        this.displayBuilding();
    }
    // Getters/Setters
    setSunLevel(value) {
        // only store sun level if cell is has building
        if (this.hasBuilding()) {
            this.sunLevel = value;
        }
    }
    setWaterLevel(value) {
        this.waterLevel = value;
    }
    setBuilding(ref) {
        if (!this.hasBuilding() && this.buildingExists(ref)) {
            this.buildingRef = ref;
            this.level++;
            this.displayBuilding();
        }
    }
    setLevel(level) {
        this.level = level;
        this.displayBuilding();
    }
    setResources(value) {
        this.resources = value;
    }
    setClickable() {
        this.isClickable = true;
    }
    disableClickable() {
        this.isClickable = false;
    }
    enableBorder() {
        this.border?.setVisible(true);
    }
    disableBorder() {
        this.border?.setVisible(false);
    }
    getAdjacentBuildings() {
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 }, // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 }, // right
        ];
        const adjacentBuildings = [];
        directions.forEach((dir) => {
            const newRow = this.row + dir.row;
            const newCol = this.col + dir.col;
            if (newRow >= 0 &&
                newRow < this.grid.height &&
                newCol >= 0 &&
                newCol < this.grid.width) {
                const cell = this.grid.getCell(newRow, newCol);
                if (cell.hasBuilding()) {
                    adjacentBuildings.push(cell.buildingRef);
                }
            }
        });
        return adjacentBuildings;
    }
    getName() {
        if (this.buildingRef === -1) {
            return "Empty";
        }
        else {
            return this.scene.buildings[this.buildingRef].type;
        }
    }
    getTexture() {
        if (this.hasBuilding()) {
            const { type } = this.scene.buildings[this.buildingRef];
            return type + this.level;
        }
        return "";
    }
    getLogicalCoords() {
        return { row: this.row, col: this.col };
    }
    // Helpers
    hasBuilding() {
        return this.buildingRef >= 0;
    }
    setUnplacable() {
        this.isUnplacable = true;
        this.setTint(0xff0000); // Example: mark unplacable cells with a red tint
    }
    buildingExists(ref) {
        return ref >= 0 && ref < this.scene.buildings.length;
    }
    maxLevelReached() {
        return this.level >= 3;
    }
    removeBuildingSprite() {
        if (this.buildingIcon) {
            this.buildingIcon.destroy();
            this.buildingIcon = null;
        }
    }
}
