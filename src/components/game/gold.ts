import GoldMiner from "./game";

class Gold {
  private game: GoldMiner;
  public type: number;
  public x: number;
  public y: number;
  private row: number = 0;
  private col: number = 0;
  public alive: boolean;
  public speed: number;
  public width: number;
  public height: number;
  public IM: HTMLImageElement;
  public score: number;

  constructor(game: GoldMiner, row: number, col: number, _type: number) {
    this.game = game;
    this.type = _type;
    this.row = row;
    this.col = col;
    this.x = 0;
    this.y = 0;
    this.alive = false;
    this.speed = 0;
    this.width = 0;
    this.height = 0;
    this.IM = daVatCan;
    this.score = 0;
    this.init();
  }

  private init(): void {
    const tmp_w = this.game.game_W / 5;
    const tmp_h = (this.game.game_H - this.game.gameStartY) / 4.8;
    this.x = tmp_w * Math.random() + this.col * tmp_w;
    this.y =
      this.game.gameStartY +
      (this.row + 1) * tmp_h +
      Math.random() * (tmp_h / 2);
    console.log("Gold init", this.row, this.y);
    this.alive = true;
    this.update();
  }

  public update(): void {
    switch (this.type) {
      case 1:
        this.speed = this.game.getWidth() / 5;
        this.width = 385 * this.game.scale;
        this.height = 423 * this.game.scale;
        this.IM = sushi;
        this.score = 1;
        break;
      case 2:
        this.speed = this.game.getWidth() / 5;
        this.width = 569 * this.game.scale;
        this.height = 419 * this.game.scale;
        this.IM = caHoi;
        this.score = 1;
        break;
      case 3:
        this.speed = this.game.getWidth() / 5;
        this.width = 540 * this.game.scale;
        this.height = 567 * this.game.scale;
        this.IM = banhMi;
        this.score = 1;
        break;
      case 4:
        this.speed = this.game.getWidth() / 5;
        this.width = 601 * this.game.scale;
        this.height = 515 * this.game.scale;
        this.IM = hopQua;
        this.score = 1;
        break;
      case 5:
        this.speed = this.game.getWidth() / 2;
        this.width = 729 * this.game.scale;
        this.height = 628 * this.game.scale;
        this.IM = x2TocDo;
        this.score = 0;
        break;
      case 6:
        this.speed = this.game.getWidth() / 20;
        this.width = 657 * this.game.scale;
        this.height = 657 * this.game.scale;
        this.IM = daVatCan;
        this.score = 0;
        break;
      default:
        this.speed = this.game.getWidth() / 20;
        this.width = 657 * this.game.scale;
        this.height = 657 * this.game.scale;
        this.IM = daVatCan;
        this.score = 0;
        break;
    }
  }

  public randomXY(): void {
    // this.x = Math.random() * this.game.game_W;
    // this.y =
    //   this.game.gameStartY +
    //   Math.random() * (this.game.game_H - this.game.gameStartY);
  }

  public draw(): void {
    this.game.context.drawImage(
      this.IM,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }

  public size(): number {
    return Math.sqrt(this.width * this.width + this.height * this.height) / 2;
  }

  public log() {
    // console.log(
    //   "Gold",
    //   this.type,
    //   this.IM,
    //   this.x,
    //   this.x,
    //   this.width,
    //   this.height,
    //   this.score
    // );
  }
}

// Load images
const sushi = new Image();
sushi.src = "/images/item-1.svg";
const caHoi = new Image();
caHoi.src = "/images/item-2.svg";
const banhMi = new Image();
banhMi.src = "/images/item-3.svg";
const hopQua = new Image();
hopQua.src = "/images/item-4.svg";
const x2TocDo = new Image();
x2TocDo.src = "/images/item-5.svg";
const daVatCan = new Image();
daVatCan.src = "/images/item-6.svg";

export default Gold;
