import Phaser from "../../lib/phaser.js";
import { LanguageManager } from "../prefabs/LanguageManager.js";
export class WinScene extends Phaser.Scene {
    buildingsPlaced = 0;
    resourcesCollected = 0;
    turnsPlayed = 0;
    textConfig;
    text;
    constructor() {
        super("sceneWin");
    }
    init(data) {
        this.buildingsPlaced = data.buildingsPlaced;
        this.resourcesCollected = data.resourcesCollected;
        this.turnsPlayed = data.turnsPlayed;
        // tunable text parameters
        this.textConfig = {
            fontSize: "32px",
            align: "center",
        };
    }
    create() {
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
    updateUIText() {
        const victoryConditionElement = document.getElementById("victoryCondition");
        if (victoryConditionElement) {
            victoryConditionElement.textContent = LanguageManager.getTranslation(victoryConditionElement.getAttribute("data-translate") ?? '');
        }
    }
}
