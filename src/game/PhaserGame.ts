import Phaser from "phaser";
import MemoryScene from "./scenes/MemoryScene";
import JigsawScene from "./scenes/JigsawScene";
import TomatoScene from "./scenes/TomatoScene";
import ValentineScene from "./scenes/ValentineScene";

let game: Phaser.Game | null = null;

export function startPhaserGame(parent: string) {
  if (game) return game;

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 360,
    height: 640,
    backgroundColor: "#9ca3af",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
     physics: {
      default: "arcade",
      arcade: {
        gravity: {x:0, y: 1200 },
        debug: false,
      },
    },
    scene: [MemoryScene, JigsawScene, TomatoScene, ValentineScene],
  });

  return game;
}

export function destroyPhaserGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}
