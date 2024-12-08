export class GameState {
    scene;
    stateHistory = [];
    stateIndex = -1;
    constructor(scene) {
        this.scene = scene;
    }
    save() {
        const boardState = this.getBoardState();
        localStorage.setItem("AUTO_SAVE", boardState);
        this.trimStateHistory();
        this.stateHistory.push(boardState);
        this.stateIndex++;
        this.saveStateHistory("AUTO_SAVE_HISTORY");
    }
    load() {
        const boardState = localStorage.getItem("AUTO_SAVE");
        this.loadBoardState(boardState);
        this.loadStateHistory("AUTO_SAVE_HISTORY");
    }
    undo() {
        if (this.stateIndex > 0) {
            const boardState = this.historyRewind();
            this.loadBoardState(boardState);
        }
    }
    redo() {
        if (this.stateIndex < this.stateHistory.length - 1) {
            const boardState = this.historyAdvance();
            this.loadBoardState(boardState);
        }
    }
    getBoardState() {
        return JSON.stringify({
            grid: this.scene.grid.serialize(),
            player: this.scene.player.serialize(),
            trackables: this.scene.trackables,
        });
    }
    loadBoardState(boardState) {
        if (boardState) {
            const state = JSON.parse(boardState);
            this.scene.grid.deserialize(state.grid);
            this.scene.player.deserialize(state.player);
            this.scene.trackables = { ...state.trackables };
            this.refreshGameScene();
        }
        else {
            alert("Trying to load from empty slot!");
        }
    }
    saveStateHistory(key) {
        const undoHistory = JSON.stringify({
            stateHistory: this.stateHistory,
            stateIndex: this.stateIndex,
        });
        localStorage.setItem(key, undoHistory);
    }
    loadStateHistory(key) {
        const undoHistory = localStorage.getItem(key);
        if (undoHistory) {
            const state = JSON.parse(undoHistory);
            this.stateHistory = state.stateHistory;
            this.stateIndex = state.stateIndex;
        }
    }
    saveToSlot(slot) {
        const boardState = this.getBoardState();
        localStorage.setItem(`SLOT_${slot}`, boardState);
        this.saveStateHistory(`SLOT_${slot}_HISTORY`);
    }
    loadFromSlot(slot) {
        const boardState = localStorage.getItem(`SLOT_${slot}`);
        this.loadBoardState(boardState);
        this.loadStateHistory(`SLOT_${slot}_HISTORY`);
    }
    // Helpers
    historyAdvance() {
        this.stateIndex++;
        return this.stateHistory[this.stateIndex];
    }
    historyRewind() {
        this.stateIndex--;
        return this.stateHistory[this.stateIndex];
    }
    trimStateHistory() {
        this.stateHistory = this.stateHistory.slice(0, this.stateIndex + 1);
    }
    refreshGameScene() {
        const { row, col } = this.scene.player;
        const currentCell = this.scene.grid.getCell(row, col);
        this.scene.stats.update(currentCell);
        this.scene.player.updateCellInteractivity();
        this.scene.player.updatePlayerDisplay();
    }
}
