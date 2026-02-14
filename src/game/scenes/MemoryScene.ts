import Phaser from "phaser";
import { shuffleArray } from "../utils/shuffle";

type CardData = {
  key: string;
  image: Phaser.GameObjects.Image;
  container: Phaser.GameObjects.Container;
  revealed: boolean;
  matched: boolean;
};

export default class MemoryScene extends Phaser.Scene {
  private first?: CardData;
  private second?: CardData;
  private locked = false;
  private totalMatches = 0;

  constructor() {
    super("MemoryScene");
  }

  preload() {
    this.load.image("back", "/assets/back.png");

    for (let i = 1; i <= 8; i++) {
      this.load.image(`card${i}`, `/assets/photos/card0${i}.jpeg`);
    }
  }

  create() {
    const { width, height } = this.scale;

    // 🌸 SAME GRADIENT BACKGROUND AS VALENTINE
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      0xffe4ec, 0xffc1d9,
      0xffb6c1, 0xffdde8,
      1
    );
    bg.fillRect(0, 0, width, height);

    // ---------------- GRID CONFIG ----------------
    const COLS = 4;
    const ROWS = 4;

    const CARD_WIDTH = 80;
    const CARD_HEIGHT = (CARD_WIDTH * 7) / 5;
    const PADDING = 6;
    const GAP = 8;

    const IMAGE_WIDTH = CARD_WIDTH - PADDING * 2;
    const IMAGE_HEIGHT = CARD_HEIGHT - PADDING * 2;

    const gridWidth = COLS * CARD_WIDTH + (COLS - 1) * GAP;
    const gridHeight = ROWS * CARD_HEIGHT + (ROWS - 1) * GAP;

    const startX = width / 2 - gridWidth / 2 + CARD_WIDTH / 2;
    const startY = height / 2 - gridHeight / 2 + CARD_HEIGHT / 2;

    // ---------------- CARD KEYS ----------------
    const keys: string[] = [];
    for (let i = 1; i <= 8; i++) {
      keys.push(`card${i}`, `card${i}`);
    }

    shuffleArray(keys);

    let index = 0;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = startX + col * (CARD_WIDTH + GAP);
        const y = startY + row * (CARD_HEIGHT + GAP);

        const cardBg = this.add
          .rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0xffffff)
          .setStrokeStyle(2, 0xffffff)
          .setOrigin(0.5);

        const cardImage = this.add
          .image(0, 0, "back")
          .setDisplaySize(IMAGE_WIDTH, IMAGE_HEIGHT)
          .setOrigin(0.5);

        const container = this.add
          .container(x, y, [cardBg, cardImage])
          .setSize(CARD_WIDTH, CARD_HEIGHT)
          .setInteractive(
            new Phaser.Geom.Rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT),
            Phaser.Geom.Rectangle.Contains
          );

        const card: CardData = {
          key: keys[index],
          image: cardImage,
          container,
          revealed: false,
          matched: false,
        };

        container.on("pointerdown", () =>
          this.onCardClicked(card)
        );

        index++;
      }
    }
  }

  private onCardClicked(card: CardData) {
    if (this.locked || card.revealed || card.matched) return;

    this.locked = true;

    this.reveal(card, () => {
      if (!this.first) {
        this.first = card;
        this.locked = false;
        return;
      }

      this.second = card;

      this.time.delayedCall(400, () => {
        this.checkMatch();
      });
    });
  }

  private reveal(card: CardData, onComplete?: () => void) {
    card.revealed = true;

    this.tweens.add({
      targets: card.container,
      scaleX: 0,
      duration: 150,
      onComplete: () => {
        card.image.setTexture(card.key);

        this.tweens.add({
          targets: card.container,
          scaleX: 1,
          duration: 150,
          onComplete,
        });
      },
    });
  }

  private hide(card: CardData, onComplete?: () => void) {
    card.revealed = false;

    this.tweens.add({
      targets: card.container,
      scaleX: 0,
      duration: 150,
      onComplete: () => {
        card.image.setTexture("back");

        this.tweens.add({
          targets: card.container,
          scaleX: 1,
          duration: 150,
          onComplete,
        });
      },
    });
  }

  private checkMatch() {
    if (!this.first || !this.second) return;

    if (this.first.key === this.second.key) {
      this.first.matched = true;
      this.second.matched = true;

      this.totalMatches++;

      if (this.totalMatches === 8) {
        this.onComplete();
      }

      this.resetTurn();
    } else {
      this.hide(this.first);
      this.hide(this.second, () => {
        this.resetTurn();
      });
    }
  }

  private onComplete() {
    const { width, height } = this.scale;

    this.add.text(
      width / 2,
      height - 100,
      "❤️",
      {
        fontSize: "28px",
        color: "#b91c1c",
        fontStyle: "bold",
      }
    ).setOrigin(0.5);

    // ▶️ Play Next Button
    const buttonBg = this.add
      .rectangle(width / 2, height - 50, 160, 45, 0x22c55e)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height - 50, "Play Next ▶", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    buttonBg.on("pointerdown", () => {
      this.scene.start("JigsawScene"); // 🔁 CHANGE if needed
    });
  }

  private resetTurn() {
    this.first = undefined;
    this.second = undefined;
    this.locked = false;
  }
}
