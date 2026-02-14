import Phaser from "phaser";

export default class ValentineScene extends Phaser.Scene {
  private hasAnswered = false;

  constructor() {
    super("ValentineScene");
  }

  create() {
    const { width, height } = this.scale;

    // 🌸 Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      0xffe4ec, 0xffc1d9,
      0xffb6c1, 0xffdde8,
      1
    );
    bg.fillRect(0, 0, width, height);

    // 💖 Question
    const question = this.add.text(
      width / 2,
      height / 2 - 140,
      "Will you be my\nValentine \nforever?",
      {
        fontSize: "42px",
        color: "#b91c1c",
        align: "center",
        fontStyle: "bold",
      }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: question,
      alpha: 1,
      duration: 1200,
      ease: "Cubic.Out",
    });

    // ❤️ YES
    this.createButton(
      width / 2 - 90,
      height / 2 + 20,
      "YES",
      0x22c55e,
      () => this.onAnswer("YES")
    );

    // 💔 NO
    this.createButton(
      width / 2 + 90,
      height / 2 + 20,
      "NO",
      0xef4444,
      () => this.onAnswer("NO")
    );

    // Floating hearts
    this.time.addEvent({
      delay: 350,
      loop: true,
      callback: () => this.spawnHeart(),
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void
  ) {
    const rect = this.add.rectangle(x, y, 130, 52, color)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, label, {
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    rect.on("pointerdown", () => {
      if (this.hasAnswered) return;

      this.tweens.add({
        targets: rect,
        scale: 0.95,
        yoyo: true,
        duration: 100,
      });

      onClick();
    });

    this.add.container(0, 0, [rect, text]);
  }

  private onAnswer(answer: "YES" | "NO") {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    this.submitToGoogleForm(answer);

    const msg =
      answer === "YES"
        ? "I’m the happiest ❤️"
        : "Thank you for being honest ❤️";

    this.showMessage(msg);
  }

  // 📩 Google Form submit (FINAL)
  private submitToGoogleForm(answer: string) {
    const formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSfKwfGBe5gb5q1UftriRwkQ9HGJnVVOJILgVSGMuIhPrNiRNg/formResponse";

    const data = new URLSearchParams({
      "entry.1449984962": answer,
    });

    fetch(formUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    });
  }

  private showMessage(text: string) {
    const msg = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 120,
      text,
      {
        fontSize: "28px",
        color: "#9f1239",
        align: "center",
        fontStyle: "bold",
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: msg,
      scale: { from: 0.8, to: 1.05 },
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: "Sine.InOut",
    });
  }

  private spawnHeart() {
    const { width, height } = this.scale;

    const heart = this.add.text(
      Phaser.Math.Between(20, width - 20),
      height + 30,
      "❤️",
      { fontSize: `${Phaser.Math.Between(16, 28)}px` }
    ).setAlpha(0.6);

    this.tweens.add({
      targets: heart,
      y: -40,
      alpha: 0,
      duration: Phaser.Math.Between(4000, 6000),
      ease: "Sine.Out",
      onComplete: () => heart.destroy(),
    });
  }
}
