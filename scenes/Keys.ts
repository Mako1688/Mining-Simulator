import Phaser from "phaser";

export interface KEYS {
  LEFT: Phaser.Input.Keyboard.Key;
  RIGHT: Phaser.Input.Keyboard.Key;
  UP: Phaser.Input.Keyboard.Key;
  DOWN: Phaser.Input.Keyboard.Key;
}

export class KeyScene extends Phaser.Scene {
  public KEYS!: KEYS;

  constructor() {
    super("sceneKeys");
  }

  // Key encapsulation code from Nathan Altice, https://github.com/nathanaltice/BurgerBoss/blob/master/src/scenes/Keys.js
  create(): void {
    const { KeyCodes } = Phaser.Input.Keyboard;

    this.KEYS = this.input.keyboard!.addKeys({
      LEFT: KeyCodes.LEFT,
      RIGHT: KeyCodes.RIGHT,
      UP: KeyCodes.UP,
      DOWN: KeyCodes.DOWN,
    }) as KEYS;

    this.scene.launch("scenePlay");
  }
}
