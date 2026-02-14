import Phaser from "phaser";

export default class TomatoScene extends Phaser.Scene {
  private tomato!: Phaser.Physics.Arcade.Image;
  private target!: Phaser.Physics.Arcade.StaticImage;
  private scoreText!: Phaser.GameObjects.Text;

  private score = 0;
  private canThrow = true;
  private targetDirection = 1;

  private winText!: Phaser.GameObjects.Text;
  private gameWon = false;

  constructor() {
    super("TomatoScene");
  }

  preload() {
    this.load.image("tomato", "/assets/photos/tomato.png");
    this.load.image("target", "/assets/photos/target.png");
    this.load.audio("squish", "/assets/photos/squish.mp3");
  }

  create() {
    const { width, height } = this.scale;

    // 🌸 VALENTINE GRADIENT BACKGROUND
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      0xffe4ec, 0xffc1d9,
      0xffb6c1, 0xffdde8,
      1
    );
    bg.fillRect(0, 0, width, height);

    // 🏆 SCORE
    this.scoreText = this.add
      .text(width / 2, 30, "Score: 0", {
        fontSize: "28px",
        color: "#000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // 🎉 WIN TEXT (hidden)
    this.winText = this.add
      .text(width / 2, height / 2 - 40, "You Win ❤️", {
        fontSize: "40px",
        color: "#e11d48",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setVisible(false);

    // 🎯 TARGET
    this.target = this.physics.add.staticImage(width / 2, 140, "target");
    this.target.setDisplaySize(180, 180);
    this.target.refreshBody();

    // 🍅 TOMATO
    this.tomato = this.physics.add.image(width / 2, height - 100, "tomato");
    this.tomato.setDisplaySize(48, 48);
    this.tomato.setBounce(0.3);
    this.tomato.setCollideWorldBounds(true);
    this.tomato.body.onWorldBounds = true;

    // 🌍 WORLD BOUNDS
    this.physics.world.on("worldbounds", this.onWorldBoundsHit, this);

    // 💥 COLLISION
    this.physics.add.collider(
      this.tomato,
      this.target,
      this.onTargetHit,
      undefined,
      this
    );

    // 👉 THROW
    this.input.on("pointerdown", this.throwTomato, this);
  }

  update(_, delta: number) {
    if (this.gameWon) return;

    // 🎯 MOVE TARGET
    const speed = 0.12 * delta;
    this.target.x += speed * this.targetDirection;

    const margin = 90;
    if (this.target.x > this.scale.width - margin) {
      this.targetDirection = -1;
    } else if (this.target.x < margin) {
      this.targetDirection = 1;
    }

    this.target.refreshBody();
  }

  private throwTomato(pointer: Phaser.Input.Pointer) {
    if (!this.canThrow || this.gameWon) return;

    this.canThrow = false;

    const dx = pointer.x - this.tomato.x;
    const dy = pointer.y - this.tomato.y;

    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / length;
    const ny = dy / length;

    const power = 1000;

    this.tomato.setVelocity(nx * power, ny * power);
    this.tomato.setAngularVelocity(600);
  }

  // 🍅 HIT TARGET
  private onTargetHit() {
    if (this.gameWon) return;

    this.sound.play("squish", { volume: 0.7 });

    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);

    if (this.score >= 1) {
      this.onWin();
      return;
    }

    this.resetTomato();
  }

  private onWin() {
    this.gameWon = true;
    this.canThrow = false;

    this.winText.setVisible(true);

    this.tomato.setVelocity(0, 0);
    this.tomato.setAngularVelocity(0);
    this.targetDirection = 0;

    // 🎉 Win animation
    this.tweens.add({
      targets: this.winText,
      scale: { from: 0.8, to: 1 },
      duration: 400,
      ease: "Back.Out",
    });

    this.showPlayNext();
  }

  // ▶️ PLAY NEXT BUTTON
  private showPlayNext() {
    const { width, height } = this.scale;

    const btnBg = this.add
      .rectangle(width / 2, height / 2 + 40, 180, 50, 0x22c55e)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(width / 2, height / 2 + 40, "Play Next ▶", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    btnBg.on("pointerdown", () => {
      this.scene.start("ValentineScene");
    });
  }

  // 🚫 HIT TOP / BOTTOM
  private onWorldBoundsHit(
    body: Phaser.Physics.Arcade.Body,
    up: boolean,
    down: boolean
  ) {
    if (body.gameObject !== this.tomato || this.gameWon) return;

    if (up || down) {
      this.resetTomato();
    }
  }

  private resetTomato() {
    const { width, height } = this.scale;

    this.tomato.setVelocity(0, 0);
    this.tomato.setAngularVelocity(0);
    this.tomato.setPosition(width / 2, height - 100);

    this.canThrow = true;
  }
}
