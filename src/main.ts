import Phaser from "phaser";
import { LoadScene as Load } from "./scenes/Load";
import { KeyScene as Keys } from "./scenes/Keys";
import { PlayScene as Play } from "./scenes/Play";
import { WinScene as Win } from "./scenes/Win";

("use strict");

let config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 700,
  height: 400,
  parent: "phaser-game",
  render: {
    pixelArt: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [Load, Keys, Play, Win],
};

const game = new Phaser.Game(config);
const { width, height } = game.config;
