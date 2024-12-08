import Phaser from "phaser";

export class LoadScene extends Phaser.Scene {
  constructor() {
    super("sceneLoad");
  }

  preload(): void {
    this.load.text("scenario", "config/scenario.yaml");

    // load assets
    this.load.path = "assets/";

    this.load.atlas("player", "Astronaut_Idle.png", "Astronaut_Idle.json");
    this.load.image("cell", "cell.png");
    this.load.image("stats", "stats.png");
    this.load.image("Drill1", "drill1.png");
    this.load.image("Drill2", "drill2.png");
    this.load.image("Drill3", "drill3.png");
    this.load.image("Excavator1", "excavator1.png");
    this.load.image("Excavator2", "excavator2.png");
    this.load.image("Excavator3", "excavator3.png");
    this.load.image("DemolitionPlant1", "demo1.png");
    this.load.image("DemolitionPlant2", "demo2.png");
    this.load.image("DemolitionPlant3", "demo3.png");
  }

  create(): void {
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("player", {
        prefix: "Astronaut_Idle-",
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.scene.launch("sceneKeys");
  }
}
