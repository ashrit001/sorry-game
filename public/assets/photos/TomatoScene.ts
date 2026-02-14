import Phaser from "phaser";

export default class TomatoScene extends Phaser.Scene {
  private tomato!: Phaser.Physics.Arcade.Image;
  private target!: Phaser.Physics.Arcade.StaticImage;

  private startX = 0;
  private startY = 0;
  private dragging = false;

  constructor() {
    super("TomatoScene");
  }

  preload() {
    this.load.image("tomato", "/assets/photos/tomato.png");
    this.load.image("target", "/assets/photos/target.png");
  }

  create() {
    const { width, height } = this.scale;

    // 🎯 TARGET (STATIC — DOES NOT FALL)
    this.target = this.physics.add.staticImage(width / 2, 160, "target");
    this.target.setDisplaySize(90, 90);
    this.target.refreshBody();

    // 🍅 TOMATO
    this.tomato = this.physics.add.image(width / 2, height - 100, "tomato");
    this.tomato.setDisplaySize(48, 48);
    this.tomato.body.setSize(48, 48);
    this.tomato.setCollideWorldBounds(true);
    this.tomato.setBounce(0.4);

    // COLLISION
    this.physics.add.collider(this.tomato, this.target, this.onHit, undefined, this);

    // INPUT
    this.tomato.setInteractive({ useHandCursor: true });

    this.tomato.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.dragging = true;
      this.startX = pointer.x;
      this.startY = pointer.y;
      this.tomato.setVelocity(0, 0);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging) return;
      this.tomato.setPosition(pointer.x, pointer.y);
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging) return;
      this.dragging = false;

      const dx = this.startX - pointer.x;
      const dy = this.startY - pointer.y;

      this.tomato.setVelocity(dx * 6, dy * 6);
    });
  }

  private onHit() {
    // SPLAT EFFECT (simple scale + reset)
    this.tomato.disableBody(true, true);

    this.time.delayedCall(500, () => {
      this.resetTomato();
    });
  }

  private resetTomato() {
    const { width, height } = this.scale;

    this.tomato.enableBody(
      true,
      width / 2,
      height - 100,
      true,
      true
    );

    this.tomato.setVelocity(0, 0);
  }
}
