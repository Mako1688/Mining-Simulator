import Phaser from "phaser";
import { Trackables } from "./Play";
import { LanguageManager } from "../prefabs/LanguageManager";

export class WinScene extends Phaser.Scene {
  private buildingsPlaced: number = 0;
  private resourcesCollected: number = 0;
  private turnsPlayed: number = 0;
  
  private textConfig!: Phaser.Types.GameObjects.Text.TextStyle;
  private text!: Phaser.GameObjects.Text;

  constructor() {
    super("sceneWin");
  }

  init(data: Trackables): void {
    this.buildingsPlaced = data.buildingsPlaced;
    this.resourcesCollected = data.resourcesCollected;
    this.turnsPlayed = data.turnsPlayed;

    // tunable text parameters
    this.textConfig = {
      fontSize: "32px",
      align: "center",
    };
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.text(width * 0.5, height * 0.5, LanguageManager.getTranslation("win"), {
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5);

    const victoryConditionElement = document.getElementById("victoryCondition");
    if (victoryConditionElement) {
      victoryConditionElement.textContent = LanguageManager.getTranslation(victoryConditionElement.getAttribute("data-translate") ?? '');
    }

    // Language switching buttons
    document.getElementById("lang-en")?.addEventListener("click", () => {
      LanguageManager.setLanguage("en");
      this.updateUIText();
    });
    document.getElementById("lang-ar")?.addEventListener("click", () => {
      LanguageManager.setLanguage("ar");
      this.updateUIText();
    });
    document.getElementById("lang-zh")?.addEventListener("click", () => {
      LanguageManager.setLanguage("zh");
      this.updateUIText();
    });
  }

  updateUIText(): void {
    const victoryConditionElement = document.getElementById("victoryCondition");
    if (victoryConditionElement) {
      victoryConditionElement.textContent = LanguageManager.getTranslation(victoryConditionElement.getAttribute("data-translate") ?? '');
    }
  }
}
