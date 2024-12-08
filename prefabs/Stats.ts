import { PlayScene } from "../scenes/Play";
import { Cell } from "./Cell";
import { LanguageManager } from "./LanguageManager";

export interface StatsConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Stats extends Phaser.GameObjects.Sprite {
  public scene: PlayScene;
  public width: number;
  public height: number;

  private cell: Cell | null = null;
  private title: Phaser.GameObjects.Text;
  private description: Phaser.GameObjects.Text;
  private icon: Phaser.GameObjects.Image | null = null;
  private iconframe: Phaser.GameObjects.Sprite | null = null;
  private collectButton: Phaser.GameObjects.Text;
  private textConfig: Phaser.Types.GameObjects.Text.TextStyle;

  // Additional properties for cell info display
  private location: string = "";
  private sunLevel: string = "";
  private waterLevel: string = "";
  private level: string = "";

  constructor(
    scene: PlayScene,
    x: number,
    y: number,
    width: number,
    height: number,
    texture: string = "stats"
  ) {
    super(scene, x, y, texture);

    // store references
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.cell = null;

    this.scene.add.existing(this);

    // stats display configs
    this.setOrigin(0);
    this.setDisplaySize(width, height);

    // tunable text parameters
    this.textConfig = {
      fontSize: "20px",
      backgroundColor: "000",
      wordWrap: { width: width - 20, useAdvancedWrap: true }, // Ensure text wraps within the container
      padding: { left: 10, right: 10 }, // Add padding to avoid text overflow
    };

    // create text elements
    this.title = this.scene.add.text(0, 0, "", this.textConfig);
    this.description = this.scene.add.text(
      this.x + this.width * 0.5,
      this.height * 0.75,
      "",
      this.textConfig
    );

    // center text
    this.title.setOrigin(0.5);
    this.description.setOrigin(0.5);

    // declare icon sprite
    this.icon = null;

    // create collect button
    this.collectButton = this.scene.add.text(
      0,
      0,
      LanguageManager.getTranslation("collect"),
      {
        fontSize: "16px",
        backgroundColor: "#000",
        padding: { x: 10, y: 5 },
        wordWrap: { width: width - 20, useAdvancedWrap: true }, // Ensure text wraps within the container
      }
    );

    // collect button configs
    this.collectButton.setOrigin(0.5);
    this.collectButton.setVisible(false);
    this.collectButton.setInteractive();

    this.collectButton.on("pointerdown", () => {
      if (this.cell) {
        this.scene.player.collectResourcesFromCell(this.cell);
      }
    });
  }

  update(cell: Cell): void {
    this.cell = cell;
    this.getCellInfo();
    this.displayCellName();
    this.displayCellIcon();
    this.displayDescription();
    this.displayCollectButton();
  }

  displayCellName(): void {
    if (!this.cell) return;

    const x = this.x + this.width * 0.5;
    const y = this.height * 0.1;

    this.title.setPosition(x, y);
    this.title.setText(LanguageManager.getTranslation(this.cell.getName()));
  }

  displayCellIcon(): void {
    if (!this.cell) return;

    const x = this.x + this.width * 0.5;
    const y = this.height * 0.365;
    const size = this.width * 0.5;

    // icon background
    this.iconframe = this.scene.add
      .sprite(x, y, "cell")
      .setDisplaySize(size, size);

    // display building sprite if cell contains one
    if (this.cell.hasBuilding()) {
      this.icon = this.scene.add.image(x, y, this.cell.getTexture());

      // sprite configs
      this.icon.setDisplaySize(size, size);
      this.icon.setOrigin(0.5);
    }
  }

  getCellInfo(): void {
    if (!this.cell) return;

    const isDrought =
      this.scene.weatherCondition &&
      this.scene.trackables.turnsPlayed >=
        this.scene.weatherCondition.startTurn &&
      this.scene.trackables.turnsPlayed <= this.scene.weatherCondition.endTurn;

    this.location = `${LanguageManager.getTranslation("location")}: (${
      this.cell.row
    }, ${this.cell.col})`;
    this.sunLevel = `${LanguageManager.getTranslation("sunLevel")}: ${
      this.cell.sunLevel
    }`;
    this.waterLevel = `${LanguageManager.getTranslation("waterLevel")}: ${
      this.cell.waterLevel
    }${isDrought ? ` (${LanguageManager.getTranslation("drought")})` : ""}`;
    this.level = `${LanguageManager.getTranslation("level")}: ${
      this.cell.level
    }`;
  }

  displayDescription(): void {
    if (!this.cell) return;

    this.description.setText(
      `${this.level}\n${this.location}\n${this.sunLevel}\n${this.waterLevel}`
    );
  }

  displayCollectButton(): void {
    if (!this.cell) return;

    if (this.cell.hasBuilding() && this.cell.resources > 0) {
      const x = this.x + this.width * 0.5;
      const y = this.height - 30;

      this.collectButton.setPosition(x, y);
      this.collectButton.setVisible(true);
    } else {
      this.collectButton.setVisible(false);
    }
  }

  updateUIText(): void {
    this.collectButton.setText(LanguageManager.getTranslation("collect"));
    if (this.cell) {
      this.getCellInfo();
      this.displayDescription();
      this.displayCellName(); // Add this line to update cell name
    }

    // Ensure text elements are updated and wrapped correctly
    this.title.setWordWrapWidth(this.width - 20, true);
    this.description.setWordWrapWidth(this.width - 20, true);
    this.collectButton.setWordWrapWidth(this.width - 20, true);
  }
}
