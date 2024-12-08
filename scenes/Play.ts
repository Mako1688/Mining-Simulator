import { parse } from "yaml";

import Phaser from "phaser";
import { Player } from "../prefabs/Player";
import { GameState } from "../prefabs/GameState";
import { Grid, GridConfig } from "../prefabs/Grid";
import { Stats, StatsConfig } from "../prefabs/Stats";
import { ButtonManager } from "../prefabs/ButtonManager";
import { LanguageManager, Language } from "../prefabs/LanguageManager";

export interface Trackables {
  buildingsPlaced: number;
  resourcesCollected: number;
  turnsPlayed: number;
}

export interface Building {
  readonly type: string;
  readonly cost: number;
  readonly rate: number;
  readonly scale: number;
  readonly growthRule: string; // New property
}

export interface VictoryCondition {
  type: "resources" | "level3Buildings" | "specificBuilding";
  goal: number;
  buildingType?: string;
}

export interface WeatherCondition {
  type: "drought";
  startTurn: number;
  endTurn: number;
}

export class PlayScene extends Phaser.Scene {
  public gridConfig!: GridConfig;
  public statsConfig!: StatsConfig;
  public trackables!: Trackables;
  public RESOURCE_GOAL: number = 1000;
  public startingResources: number = 100; // Default value

  public buildings: Array<{
    type: string;
    cost: number;
    rate: number;
    scale: number;
    growthRule: string; // New property
  }> = [];

  public gameState!: GameState;
  public grid!: Grid;
  public stats!: Stats;
  public player!: Player;
  public buttons!: ButtonManager;
  public victoryCondition!: VictoryCondition;
  public weatherCondition?: WeatherCondition;

  constructor() {
    super("scenePlay");
  }

  /**
   * Initialize the game scene with configuration from the YAML file.
   */
  init(): void {
    const yamlText = this.cache.text.get("scenario");
    const config = parse(yamlText);

    // set game display parameters
    this.gridConfig = config.gridConfig;
    this.statsConfig = {
      x: this.gridConfig.width * this.gridConfig.size,
      y: 0,
      width:
        this.game.scale.width - this.gridConfig.width * this.gridConfig.size,
      height: this.game.scale.height,
    };

    this.buildings = config.buildings.map((building: any) => ({
      ...building,
      growthRule: building.growthRule || "default", // Default to "default" if not specified
    }));
    this.RESOURCE_GOAL = config.RESOURCE_GOAL;
    this.trackables = config.trackables;
    this.victoryCondition = config.victoryCondition;
    this.startingResources = config.startingResources || 100; // Read from YAML
    this.weatherCondition = config.weatherCondition;
  }

  /**
   * Create the game scene, including the grid, player, stats, and buttons.
   */
  create(): void {
    this.gameState = new GameState(this);
    this.grid = new Grid(this, this.gridConfig);
    this.stats = new Stats(
      this,
      this.statsConfig.x,
      this.statsConfig.y,
      this.statsConfig.width,
      this.statsConfig.height
    );
    this.player = new Player(this, 0, 0, this.grid, this.startingResources); // Pass starting resources
    this.buttons = new ButtonManager(this);

    this.updateVictoryConditionText();

    // Language switching buttons
    document.getElementById("lang-en")?.addEventListener("click", () => {
      LanguageManager.setLanguage("en");
      this.updateUIText();
      this.updateVictoryConditionText();
    });
    document.getElementById("lang-ar")?.addEventListener("click", () => {
      LanguageManager.setLanguage("ar");
      this.updateUIText();
      this.updateVictoryConditionText();
    });
    document.getElementById("lang-zh")?.addEventListener("click", () => {
      LanguageManager.setLanguage("zh");
      this.updateUIText();
      this.updateVictoryConditionText();
    });

    this.launchGame();
  }

  /**
   * Update the victory condition text based on the current language and configuration.
   */
  updateVictoryConditionText(): void {
    const victoryConditionElement = document.getElementById("victoryCondition");
    if (victoryConditionElement) {
      if (this.victoryCondition.type === "resources") {
        victoryConditionElement.setAttribute("data-translate", "collectGoal");
        victoryConditionElement.textContent = LanguageManager.getTranslation(
          "collectGoal",
          { goal: this.victoryCondition.goal }
        );
      } else if (this.victoryCondition.type === "level3Buildings") {
        victoryConditionElement.setAttribute(
          "data-translate",
          "level3BuildingsGoal"
        );
        victoryConditionElement.textContent = LanguageManager.getTranslation(
          "level3BuildingsGoal",
          { goal: this.victoryCondition.goal }
        );
      } else if (this.victoryCondition.type === "specificBuilding") {
        victoryConditionElement.setAttribute(
          "data-translate",
          "specificBuildingGoal"
        );
        victoryConditionElement.textContent = LanguageManager.getTranslation(
          "specificBuildingGoal",
          {
            goal: this.victoryCondition.goal,
            buildingType: LanguageManager.getTranslation(
              this.victoryCondition.buildingType ?? ""
            ),
          }
        );
      }
    }
  }

  update(): void {
    this.player.update();
    this.checkWinCondition();
  }

  /**
   * Update the UI, including trackables and stats.
   */
  updateUI(): void {
    // prioritize displaying stats of selected cell
    this.grid.selectedCell
      ? this.stats.update(this.grid.selectedCell)
      : this.player.displayCurrentCellStats();

    this.updateUIText();
  }

  /**
   * Update the UI text based on the current language.
   */
  updateUIText(): void {
    // Update trackables
    const playerDisplay = document.getElementById("playerDisplay");
    if (playerDisplay) {
      playerDisplay.innerHTML =
        `<span data-translate="resources">${LanguageManager.getTranslation(
          "resources"
        )}</span>: ${this.player.resources}<br />` +
        `<span data-translate="turns">${LanguageManager.getTranslation(
          "turns"
        )}</span>: ${this.trackables.turnsPlayed}<br />` +
        `<span data-translate="buildingsPlaced">${LanguageManager.getTranslation(
          "buildingsPlaced"
        )}</span>: ${this.trackables.buildingsPlaced}`;
    }

    // Update stats UI
    this.stats.updateUIText();
    // Update cell name
    if (this.grid.selectedCell) {
      this.stats.displayCellName();
    }

    // Update button texts
    const buttons = [
      "saveButton",
      "loadButton",
      "saveSlot1",
      "saveSlot2",
      "saveSlot3",
      "loadSlot1",
      "loadSlot2",
      "loadSlot3",
      "exitButton",
      "undoButton",
      "redoButton",
      "buyDrillButton",
      "buyExcavatorButton",
      "buyDemolitionPlantButton",
      "nextRoundButton",
    ];

    buttons.forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        if (buttonId.startsWith("buy")) {
          const buildingType = buttonId
            .replace("buy", "")
            .replace("Button", "");
          const building = this.buildings.find((b) => b.type === buildingType);
          if (building) {
            button.textContent = `${LanguageManager.getTranslation(
              button.getAttribute("data-translate") ?? ""
            )}: $${building.cost}`;
          }
        } else {
          button.textContent = LanguageManager.getTranslation(
            button.getAttribute("data-translate") ?? ""
          );
        }
      }
    });

    // Ensure the victory condition text is updated and wrapped correctly
    const victoryConditionElement = document.getElementById("victoryCondition");
    if (victoryConditionElement) {
      victoryConditionElement.style.whiteSpace = "normal";
      victoryConditionElement.style.margin = "0 10px"; // Add margin to avoid text overflow
    }
  }

  /**
   * Start the next round, update the UI, and save the game state.
   */
  startNextRound(): void {
    this.grid.step();
    this.applyWeatherCondition();
    this.updateUI();
    this.gameState.save();
  }

  applyWeatherCondition(): void {
    if (this.weatherCondition) {
      const currentTurn = this.trackables.turnsPlayed;
      if (
        currentTurn >= this.weatherCondition.startTurn &&
        currentTurn <= this.weatherCondition.endTurn
      ) {
        if (this.weatherCondition.type === "drought") {
          this.grid.cells.forEach((cell) => cell.setWaterLevel(0));
        }
      }
    }
  }

  /**
   * Check if the win condition has been met and transition to the win scene if so.
   */
  checkWinCondition(): void {
    if (this.victoryCondition.type === "resources") {
      if (this.player.resources >= this.victoryCondition.goal) {
        this.scene.start("sceneWin", this.trackables);
      }
    } else if (this.victoryCondition.type === "level3Buildings") {
      const level3Buildings = Array.from(this.grid.cells.values()).filter(
        (cell) => cell.level === 3
      ).length;
      if (level3Buildings >= this.victoryCondition.goal) {
        this.scene.start("sceneWin", this.trackables);
      }
    } else if (this.victoryCondition.type === "specificBuilding") {
      const specificBuildings = Array.from(this.grid.cells.values()).filter(
        (cell) => cell.getName() === this.victoryCondition.buildingType
      ).length;
      if (specificBuildings >= this.victoryCondition.goal) {
        this.scene.start("sceneWin", this.trackables);
      }
    }
  }

  /**
   * Launch the game, prompting the user to continue from an auto-save or start a new game.
   */
  launchGame(): void {
    const savedData = localStorage.getItem("AUTO_SAVE");

    // prompt user to continue from auto-save or start new game
    if (savedData && confirm("Do you want to continue where you left off?")) {
      this.gameState.load();
    }
  }
}

/**
 * The `scenario.yaml` file is used to configure the game. It includes the following sections:
 *
 * - `gridConfig`: Configuration for the game grid, including width, height, and cell size.
 *   Example:
 *   gridConfig:
 *     width: 8
 *     height: 8
 *     size: 50
 *
 * - `buildings`: An array of building configurations, each with a type, cost, rate, scale, and growth rule.
 *   Example:
 *   buildings:
 *     - type: Drill
 *       cost: 10
 *       rate: 1
 *       scale: 1.6
 *       growthRule: default
 *     - type: Excavator
 *       cost: 30
 *       rate: 1.5
 *       scale: 1.6
 *       growthRule: waterSun
 *     - type: DemolitionPlant
 *       cost: 50
 *       rate: 2
 *       scale: 1.6
 *       growthRule: default
 *
 * - `trackables`: Initial values for trackable metrics such as buildings placed, resources collected, and turns played.
 *   Example:
 *   trackables:
 *     buildingsPlaced: 0
 *     resourcesCollected: 0
 *     turnsPlayed: 0
 *
 * - `victoryCondition`: The victory condition for the game, which can be one of the following:
 *   - `resources`: Collect a specified amount of resources to win.
 *     Example:
 *     victoryCondition:
 *       type: resources
 *       goal: 1000
 *   - `level3Buildings`: Get a specified number of buildings to level 3 to win.
 *     Example:
 *     victoryCondition:
 *       type: level3Buildings
 *       goal: 5
 *   - `specificBuilding`: Plant a specified number of a specific building type to win.
 *     Example:
 *     victoryCondition:
 *       type: specificBuilding
 *       goal: 3
 *       buildingType: Drill
 *
 * - `startingResources`: The initial amount of resources the player starts with.
 *   Example:
 *   startingResources: 50
 *
 * - `weatherCondition`: A weather condition that affects the game for a specified number of turns.
 *   Example:
 *   weatherCondition:
 *     type: drought
 *     startTurn: 10
 *     endTurn: 14
 *
 * Example `scenario.yaml`:
 * gridConfig:
 *   width: 8
 *   height: 8
 *   size: 50
 * buildings:
 *   - type: Drill
 *     cost: 10
 *     rate: 1
 *     scale: 1.6
 *     growthRule: default
 *   - type: Excavator
 *     cost: 30
 *     rate: 1.5
 *     scale: 1.6
 *     growthRule: waterSun
 *   - type: DemolitionPlant
 *     cost: 50
 *     rate: 2
 *     scale: 1.6
 *     growthRule: default
 * trackables:
 *   buildingsPlaced: 0
 *   resourcesCollected: 0
 *   turnsPlayed: 0
 * victoryCondition:
 *   type: resources
 *   goal: 1000
 * startingResources: 50
 * weatherCondition:
 *   type: drought
 *   startTurn: 10
 *   endTurn: 14
 */