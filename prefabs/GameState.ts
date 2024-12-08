import { PlayScene } from "../scenes/Play";

export class GameState {
  public scene: PlayScene;
  private stateHistory: string[] = [];
  private stateIndex: number = -1;

  constructor(scene: PlayScene) {
    this.scene = scene;
  }

  save(): void {
    const boardState = this.getBoardState();
    localStorage.setItem("AUTO_SAVE", boardState);

    this.trimStateHistory();
    this.stateHistory.push(boardState);
    this.stateIndex++;

    this.saveStateHistory("AUTO_SAVE_HISTORY");
  }

  load(): void {
    const boardState: string | null = localStorage.getItem("AUTO_SAVE");
    this.loadBoardState(boardState);

    this.loadStateHistory("AUTO_SAVE_HISTORY");
  }

  undo(): void {
    if (this.stateIndex > 0) {
      const boardState: string = this.historyRewind();
      this.loadBoardState(boardState);
    }
  }

  redo(): void {
    if (this.stateIndex < this.stateHistory.length - 1) {
      const boardState: string = this.historyAdvance();
      this.loadBoardState(boardState);
    }
  }

  getBoardState(): string {
    return JSON.stringify({
      grid: this.scene.grid.serialize(),
      player: this.scene.player.serialize(),
      trackables: this.scene.trackables,
    });
  }

  loadBoardState(boardState: string | null): void {
    if (boardState) {
      const state = JSON.parse(boardState);

      this.scene.grid.deserialize(state.grid);
      this.scene.player.deserialize(state.player);
      this.scene.trackables = { ...state.trackables };

      this.refreshGameScene();
    } else {
      alert("Trying to load from empty slot!");
    }
  }

  saveStateHistory(key: string): void {
    const undoHistory: string = JSON.stringify({
      stateHistory: this.stateHistory,
      stateIndex: this.stateIndex,
    });

    localStorage.setItem(key, undoHistory);
  }

  loadStateHistory(key: string): void {
    const undoHistory: string | null = localStorage.getItem(key);

    if (undoHistory) {
      const state = JSON.parse(undoHistory);

      this.stateHistory = state.stateHistory;
      this.stateIndex = state.stateIndex;
    }
  }

  saveToSlot(slot: number): void {
    const boardState: string = this.getBoardState();
    localStorage.setItem(`SLOT_${slot}`, boardState);

    this.saveStateHistory(`SLOT_${slot}_HISTORY`);
  }

  loadFromSlot(slot: number): void {
    const boardState: string | null = localStorage.getItem(`SLOT_${slot}`);
    this.loadBoardState(boardState);

    this.loadStateHistory(`SLOT_${slot}_HISTORY`);
  }

  // Helpers

  historyAdvance(): string {
    this.stateIndex++;
    return this.stateHistory[this.stateIndex];
  }

  historyRewind(): string {
    this.stateIndex--;
    return this.stateHistory[this.stateIndex];
  }

  trimStateHistory(): void {
    this.stateHistory = this.stateHistory.slice(0, this.stateIndex + 1);
  }

  refreshGameScene(): void {
    const { row, col } = this.scene.player;
    const currentCell = this.scene.grid.getCell(row, col)!;

    this.scene.stats.update(currentCell);
    this.scene.player.updateCellInteractivity();
    this.scene.player.updatePlayerDisplay();
  }
}
