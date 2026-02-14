import Phaser from "phaser";

type Piece = {
  col: number;
  row: number;
  image: Phaser.GameObjects.Image;
  targetX: number;
  targetY: number;
  placed: boolean;
};

export default class JigsawScene extends Phaser.Scene {
  private readonly COLS = 3;
  private readonly ROWS = 4;

  private pieces: Piece[] = [];

  private boardStartX = 0;
  private boardStartY = 0;
  private pieceWidth = 0;
  private pieceHeight = 0;

  constructor() {
    super("JigsawScene");
  }

  preload() {
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const key = `piece-${col}-${row}`;
        const file = `/assets/photos/jigsaw/${col}${row}.jpg`;
        this.load.image(key, file);
      }
    }
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

    // board size
    const boardWidth = width * 0.6;
    const boardHeight = height * 0.75;

    this.boardStartX = (width - boardWidth) / 2;
    this.boardStartY = (height - boardHeight) / 2;

    this.pieceWidth = boardWidth / this.COLS;
    this.pieceHeight = boardHeight / this.ROWS;

    // board background
    this.add
      .rectangle(
        width / 2,
        height / 2,
        boardWidth,
        boardHeight,
        0xffffff
      )
      .setStrokeStyle(4, 0xffffff);

    // create pieces
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const key = `piece-${col}-${row}`;

        const targetX =
          this.boardStartX +
          col * this.pieceWidth +
          this.pieceWidth / 2;

        const targetY =
          this.boardStartY +
          row * this.pieceHeight +
          this.pieceHeight / 2;

        const startX = Phaser.Math.Between(60, width - 60);
        const startY = Phaser.Math.Between(60, height - 60);

        const image = this.add
          .image(startX, startY, key)
          .setDisplaySize(this.pieceWidth - 8, this.pieceHeight - 8)
          .setInteractive({ draggable: true });

        this.input.setDraggable(image);

        const piece: Piece = {
          col,
          row,
          image,
          targetX,
          targetY,
          placed: false,
        };

        this.pieces.push(piece);
        this.enableDrag(piece);
      }
    }
  }

  private enableDrag(piece: Piece) {
    const img = piece.image;

    img.on("dragstart", () => {
      if (piece.placed) return;
      img.setDepth(10);
    });

    img.on("drag", (_: any, dragX: number, dragY: number) => {
      if (piece.placed) return;
      img.setPosition(dragX, dragY);
    });

    img.on("dragend", () => {
      if (piece.placed) return;

      img.setDepth(1);

      const overlap = this.getOverlapPercent(
        img,
        piece.targetX,
        piece.targetY,
        this.pieceWidth,
        this.pieceHeight
      );

      if (overlap >= 0.5) {
        this.snapPiece(piece);
      }
    });
  }

  private snapPiece(piece: Piece) {
    piece.placed = true;

    this.tweens.add({
      targets: piece.image,
      x: piece.targetX,
      y: piece.targetY,
      duration: 200,
      ease: "Back.Out",
      onComplete: () => {
        piece.image.disableInteractive();
        this.checkComplete();
      },
    });
  }

  private getOverlapPercent(
    img: Phaser.GameObjects.Image,
    targetX: number,
    targetY: number,
    width: number,
    height: number
  ) {
    const imgRect = new Phaser.Geom.Rectangle(
      img.x - img.displayWidth / 2,
      img.y - img.displayHeight / 2,
      img.displayWidth,
      img.displayHeight
    );

    const targetRect = new Phaser.Geom.Rectangle(
      targetX - width / 2,
      targetY - height / 2,
      width,
      height
    );

    const intersection = Phaser.Geom.Rectangle.Intersection(
      imgRect,
      targetRect
    );

    if (intersection.width <= 0 || intersection.height <= 0) return 0;

    const intersectionArea = intersection.width * intersection.height;
    const pieceArea = img.displayWidth * img.displayHeight;

    return intersectionArea / pieceArea;
  }

  private checkComplete() {
    const done = this.pieces.every((p) => p.placed);

    if (done) {
      this.onComplete();
    }
  }

  private onComplete() {
    const { width, height } = this.scale;

    const text = this.add.text(
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
    const btnBg = this.add
      .rectangle(width / 2, height - 50, 160, 45, 0x22c55e)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    const btnText = this.add
      .text(width / 2, height - 50, "Play Next ▶", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    btnBg.on("pointerdown", () => {
      this.scene.start("TomatoScene"); // 🔁 next scene
    });
  }
}
