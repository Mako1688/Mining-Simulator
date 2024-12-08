import { Cell } from "./Cell";
import { PlayScene } from "../scenes/Play";

export interface GridConfig {
  width: number;
  height: number;
  size: number;
}

export class Grid {
  public scene: PlayScene;
  public width: number;
  public height: number;
  public size: number;

  public cells: Map<string, Cell>;

  private BYTES_PER_CELL: number = 4;
  private NUM_CELLS: number;

  public selectedCell: Cell | null = null;
  public lastSelectedCell: Cell | null = null;

  constructor(scene: PlayScene, gridConfig: GridConfig) {
    // store references
    this.scene = scene;
    this.width = gridConfig.width;
    this.height = gridConfig.height;
    this.size = gridConfig.size;
    this.NUM_CELLS = this.width * this.height;

    // create a map to store cells and their row/col keys
    this.cells = new Map();

    this.createGrid();
  }

  // refactoring with help from Brace
  // https://chat.brace.tools/c/cddb0a0d-e4b1-4775-99bb-9d9f5cbf0962
  createGrid(): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = new Cell(this.scene, row, col, this);
        this.cells.set(this.generateKey(row, col), cell);
      }
    }
  }

  // progress board state according to game's logic
  step(): void {
    this.cells.forEach((cell) => cell.step());
    this.scene.trackables.turnsPlayed++;
  }

  selectCell(row: number, col: number): void {
    // retrieve selected cell
    const cell = this.getCell(row, col);

    // select cell only if game deems it selectable
    if (cell && cell.isClickable) {
      this.selectedCell = cell;
      this.selectedCell.enableBorder();

      if (this.selectedCell === this.lastSelectedCell) {
        // deselect cell if previously selected
        if (this.selectedCell) this.selectedCell.disableBorder();
        if (this.lastSelectedCell) this.lastSelectedCell.disableBorder();

        this.selectedCell = null;
        this.lastSelectedCell = null;
      } else {
        // unhighlight previously selected cell
        if (this.lastSelectedCell) {
          this.lastSelectedCell.disableBorder();
        }

        // update cell selection tracking
        this.lastSelectedCell = this.selectedCell;

        // display stats of currently selected cell
        this.scene.stats.update(this.selectedCell);
      }
    }
  }

  // Extracting key generation to own function idea inspired by Brace
  generateKey(row: number, col: number): string {
    return `${row}:${col}`;
  }

  getCell(row: number, col: number): Cell | undefined {
    return this.cells.get(this.generateKey(row, col));
  }

  getCellFromPixelCoords(x: number, y: number): Cell | undefined {
    const { row, col } = this.pixelToLogicalCoords(x, y);
    return this.getCell(row, col);
  }

  pixelToLogicalCoords(x: number, y: number): { row: number; col: number } {
    return {
      row: Math.floor(x / this.size),
      col: Math.floor(y / this.size),
    };
  }

  logicalToPixelCoords(row: number, col: number): { x: number; y: number } {
    const x = row * this.size + this.size / 2;
    const y = col * this.size + this.size / 2;

    return { x, y };
  }

  getByteArray(): ArrayBuffer {
    const byteArray = new ArrayBuffer(this.NUM_CELLS * this.BYTES_PER_CELL);
    const dataView = new DataView(byteArray);

    let byteOffset = 0;

    // loop through each cell in row-major order
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = this.getCell(row, col)!;

        // pack buildingRef (1 byte)
        dataView.setInt8(byteOffset++, cell.buildingRef);

        // pack level, sunLevel, waterLevel into 1 byte
        const packedLevels =
          (cell.level & 0b11) | // 2 bits for level
          ((cell.sunLevel & 0b111) << 2) | // 3 bits for sunLevel
          ((cell.waterLevel & 0b111) << 5); // 3 bits for waterLevel
        dataView.setUint8(byteOffset++, packedLevels);

        // pack resources (2 bytes)
        dataView.setUint16(byteOffset, cell.resources, true);
        byteOffset += 2;
      }
    }

    return byteArray;
  }

  loadByteArray(byteArray: ArrayBuffer): void {
    const dataView = new DataView(byteArray);
    const cells = new Map();

    let byteOffset = 0;

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        // load buildingRef (1 byte)
        const buildingRef = dataView.getInt8(byteOffset++);

        // load packed level, sunLevel, and waterLevel (1 byte)
        const packedLevels = dataView.getUint8(byteOffset++);
        const level = packedLevels & 0b11;
        const sunLevel = (packedLevels >> 2) & 0b111;
        const waterLevel = (packedLevels >> 5) & 0b111;

        // load resources (2 bytes)
        const resources = dataView.getUint16(byteOffset, true);
        byteOffset += 2;

        // Restore the cell
        const cell = this.getCell(row, col)!;
        cell.restore({ buildingRef, level, sunLevel, waterLevel, resources });

        cells.set(this.generateKey(row, col), cell);
      }
    }

    this.cells = cells;
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }

    return buffer.buffer;
  }

  serialize(): string {
    const byteArray = this.getByteArray();
    return this.arrayBufferToBase64(byteArray);
  }

  deserialize(gridData: string): void {
    const byteArray = this.base64ToArrayBuffer(gridData);
    this.loadByteArray(byteArray);
  }
}
