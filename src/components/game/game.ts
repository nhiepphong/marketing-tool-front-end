import Gold from "./gold";

let XXX: number = 0,
  YYY: number = 0,
  Xh: number = 0,
  Yh: number = 0;
let MaxLeng: number = 0;
let speedReturn: number = 0;
let R: number = 0,
  r: number = 0;
let drag: boolean = false;
let d: boolean = false;
let ok: boolean = false;
let angle: number = 90;
let ChAngle: number = -1;
let index: number = -1;
let level: number = -1;
let time: number = 60;
let tager_1: number = 0;
let tager_2: number = 0;
let tager_3: number = 0;
let tager_4: number = 0;
let timeH: number = 0;
let vlH: number = 0;

// const bg = new Image();
// bg.src = "/images/bg.svg";
const hook = new Image();
hook.src = "/images/hook.png";
const targetIM = new Image();
targetIM.src = "/images/target.png";
const dolarIM = new Image();
dolarIM.src = "/images/dolar.png";
// const levelIM = new Image();
// levelIM.src = "/images/level.png";
const clockIM = new Image();
clockIM.src = "/images/clock.png";

const people = new Image();
people.src = "/images/people.png";

//let N: number = 20;

class GoldMiner {
  private canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  private score_1: number = 0;
  private score_2: number = 0;
  private score_3: number = 0;
  private score_4: number = 0;
  private gg: Gold[];
  public scale: number = 1;
  public gameStartY: number = 0;
  private callBackUpdateScore: any;
  private callBackUpdateDoneGame: any;
  public game_W: number = 20;
  public game_H: number = 20;
  public isEndGame: boolean = true;
  public isStartGame: boolean = false;
  private isFirstRender: boolean = true;
  public countSpeedFast: number = 0;

  private logPlay: any[] = [];
  private dataGame: any = null;

  constructor(
    dataGame: any,
    callBackUpdateScore: any,
    callBackUpdateDoneGame: any
  ) {
    this.gg = [];
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d")!;
    if (this.context) {
      this.context.imageSmoothingEnabled = false;
    }
    //document.body.appendChild(this.canvas);
    document
      .querySelector<HTMLDivElement>("#app-game")!
      .appendChild(this.canvas);

    this.callBackUpdateScore = callBackUpdateScore;
    this.callBackUpdateDoneGame = callBackUpdateDoneGame;
    this.dataGame = dataGame;

    this.render();
    this.newGold();
    this.loop();
    //this.listenKeyboard();
    this.listenMouse();

    //console.log("GoldMiner constructor called");
  }

  public destroy(): void {
    this.isEndGame = true;
    this.canvas.remove();
    //console.log("GoldMiner destroy called");
  }

  private newGold(): void {
    ok = false;
    index = -1;
    Xh = XXX;
    Yh = YYY;
    r = R;
    drag = false;
    timeH = -1;
    vlH = 0;
    time = 60;
    level++;
    //tager = (level + 1) * 1000 + level * level * 120;
    tager_1 = 2; //Sushi
    tager_2 = 2; //Cá hồi
    tager_3 = 3; //Bánh mì
    tager_4 = 1; //Hộp quà

    this.scale = this.game_W / 4501;
    this.gameStartY = 300;

    this.logPlay = [];

    this.initGold();
  }

  private listenKeyboard(): void {
    document.addEventListener("keydown", () => {
      this.solve();
    });
  }

  private listenMouse(): void {
    document.addEventListener("mousedown", () => {
      this.solve();
    });
  }

  private solve(): void {
    if (!drag) {
      drag = true;
      d = true;
      speedReturn = this.getWidth() / 2;
      index = -1;
    }
  }

  private updateScore(): void {
    if (this.callBackUpdateScore) {
      this.callBackUpdateScore({
        score_1: this.score_1,
        score_2: this.score_2,
        score_3: this.score_3,
        score_4: this.score_4,
      });
    }
  }

  private stopAndShowResult(is_win: boolean): void {
    this.updateScore();
    this.callBackUpdateDoneGame(is_win, this.logPlay, {
      score_1: this.score_1,
      score_2: this.score_2,
      score_3: this.score_3,
      score_4: this.score_4,
    });
    this.isEndGame = true;
    //window.alert("You lose!" + "\n" + "Your Score: " + this.score_1);
  }

  private loop(): void {
    if (this.isEndGame && !this.isFirstRender) {
      if (this.isStartGame) {
        return;
      } else {
        setTimeout(() => this.loop(), 10);
        return;
      }
    }

    this.update();
    this.draw();

    if (
      this.score_1 >= tager_1 &&
      this.score_2 >= tager_2 &&
      this.score_3 >= tager_3 &&
      this.score_4 >= tager_4
    ) {
      console.log("You win!");
      this.stopAndShowResult(true);
    } else {
      if (time > 0) {
        setTimeout(() => this.loop(), 10);
      } else {
        this.stopAndShowResult(false);
      }
    }
    this.isFirstRender = false;
  }

  private update(): void {
    this.render();
    if (!this.isFirstRender) {
      time -= 0.01;
    }
    Xh = XXX + r * Math.cos(this.toRadian(angle));
    Yh = YYY + r * Math.sin(this.toRadian(angle));
    if (!drag) {
      angle += ChAngle;
      if (angle >= 165 || angle <= 15) {
        ChAngle = -ChAngle;
      }
    } else {
      if (r < MaxLeng && d && !ok) {
        r += this.getWidth() / 5;
      } else {
        d = false;
        r -= speedReturn / 2.5;
      }
      //console.log("R", R, "r", r, "d", d, "ok", ok, "speedReturn", speedReturn);
      if (r < R) {
        r = R;
        drag = false;
        ok = false;
        index = -1;
        for (let i = 0; i < this.gg.length; i++) {
          if (
            this.gg[i].alive &&
            this.range(Xh, Yh, this.gg[i].x, this.gg[i].y) <=
              2 * this.getWidth()
          ) {
            this.logPlay.push({
              type: this.gg[i].type,
              x: this.gg[i].x,
              y: this.gg[i].y,
              w: this.gg[i].width,
              h: this.gg[i].height,
              s: this.gg[i].score,
              t: time,
            });
            this.gg[i].alive = false;
            if (this.gg[i].type == 1) {
              this.score_1 += this.gg[i].score;
            } else if (this.gg[i].type == 2) {
              this.score_2 += this.gg[i].score;
            } else if (this.gg[i].type == 3) {
              this.score_3 += this.gg[i].score;
            } else if (this.gg[i].type == 4) {
              this.score_4 += this.gg[i].score;
            } else if (this.gg[i].type == 5) {
              //this.score_5 += this.gg[i].score;
              this.countSpeedFast = 2;
            } else if (this.gg[i].type == 6) {
              //this.score_6 += this.gg[i].score;
            }
            timeH = time - 0.7;
            vlH = this.gg[i].score;
          }
        }
      }
    }
    if (drag && index == -1) {
      for (let i = 0; i < this.gg.length; i++) {
        if (
          this.gg[i].alive &&
          this.range(Xh, Yh, this.gg[i].x, this.gg[i].y) <= this.gg[i].size()
        ) {
          ok = true;
          index = i;
          break;
        }
      }
    }
    if (index != -1) {
      this.gg[index].x = Xh;
      this.gg[index].y = Yh + this.gg[index].height / 2;
      if (this.countSpeedFast > 0) {
        speedReturn = this.gg[index].speed * 10;
        this.countSpeedFast--;
      } else {
        speedReturn = this.gg[index].speed;
      }
    }
    // console.log(
    //   "GoldMiner update: drag",
    //   drag,
    //   "index",
    //   index,
    //   "ok",
    //   ok,
    //   "speedReturn",
    //   speedReturn
    // );
  }

  private render(): void {
    const div = document.querySelector<HTMLDivElement>("#app-game");

    if (this.game_W != div?.clientWidth || this.game_H != div?.clientHeight) {
      this.canvas.width = div?.clientWidth || 0;
      this.canvas.height = div?.clientHeight || 0;
      this.game_W = this.canvas.width;
      this.game_H = this.canvas.height;
      XXX = this.game_W / 2;
      YYY = 230;
      R = this.getWidth();
      if (!drag) {
        r = R;
      }
      MaxLeng = this.range(XXX, YYY, this.game_W, this.game_H);
      //   if (N < 0) {
      //     N =
      //       (this.game_W * this.game_H) /
      //       (20 * this.getWidth() * this.getWidth());
      //   }

      //console.log("GoldMiner MaxLeng", MaxLeng);
    }
  }

  private draw(): void {
    this.clearScreen();
    for (let i = 0; i < this.gg.length; i++) {
      if (this.gg[i].alive) {
        this.gg[i].update();
        this.gg[i].draw();
      }
    }

    this.context.beginPath();
    this.context.strokeStyle = "#a26529";
    this.context.lineWidth = Math.floor(this.getWidth() / 20);
    this.context.moveTo(XXX, YYY);
    this.context.lineTo(Xh, Yh);

    this.context.stroke();
    this.context.beginPath();
    this.context.arc(XXX, YYY, 3, 0, 2 * Math.PI);
    this.context.stroke();

    this.context.save();
    this.context.translate(Xh, Yh);
    this.context.rotate(this.toRadian(angle - 90));
    // this.context.drawImage(
    //   hook,
    //   -this.getWidth() / 4,
    //   -this.getWidth() / 8,
    //   183,
    //   174
    // );
    this.context.drawImage(
      hook,
      -this.getWidth() / 2,
      -this.getWidth() / 10,
      this.getWidth(),
      this.getWidth()
    );

    this.context.restore();
    const people_width = 400 * 4 * this.scale;
    const people_height = 301 * 4 * this.scale;
    this.context.drawImage(
      people,
      XXX - people_width / 2,
      YYY - people_height,
      people_width,
      people_height
    );
    this.drawText();
  }

  private drawText(): void {
    this.scale = this.game_W / 4501;

    this.updateScore();

    const wClock: number = 1180 * this.scale;
    const xClock: number = this.game_W - wClock - 18;
    const yClock: number = 140;
    this.context.drawImage(clockIM, xClock, yClock, wClock, 898 * this.scale);

    this.context.fillStyle = "#d1266f";
    this.context.font = "26px Gotham";
    this.context.textAlign = "center";
    this.context.fillText(
      Math.floor(time > 0 ? time : 0).toString() + "s",
      xClock + wClock / 2,
      yClock + 50
    );

    if (Math.abs(timeH - time) <= 0.7) {
      if (vlH > 0) {
        this.context.fillStyle = "red";
        this.context.fillText("+" + vlH, XXX, YYY * 0.9);
      }
    }
  }

  private clearScreen(): void {
    this.context.clearRect(0, 0, this.game_W, this.game_H);
  }

  private checkWin(): boolean {
    let check: boolean = true;
    for (let i = 0; i < this.gg.length; i++) {
      if (this.gg[i].alive == true) {
        check = false;
      }
    }
    return check;
  }

  private initGold(): void {
    this.gg = [];
    let k = 0;
    for (let i = 0; i < this.dataGame.data.length; i++) {
      for (let j = 0; j < this.dataGame.data[i].length; j++) {
        this.gg[k] = new Gold(this, i, j, this.dataGame.data[i][j]);
        this.gg[k].randomXY();
        k++;
      }
    }
  }

  public getWidth(): number {
    if (this.isEndGame) return 0;
    const div = document.querySelector<HTMLDivElement>("#app-game");
    if (div) {
      const area: number = div!.clientWidth * div!.clientHeight;
      return Math.sqrt(area / 150);
    }

    return 0;
  }

  private toRadian(angle: number): number {
    return (angle / 180) * Math.PI;
  }

  private range(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
}

export default GoldMiner;
