import { GameAssets } from '../assets/GameAssets.ts';
import { Application, Sprite, Text, Ticker } from 'pixi.js';
// @ts-ignore
import Keyboard from 'pixi.js-keyboard';
import { BaseStage } from '../stages/BaseStage.ts';
import { FirstStage } from '../stages/FirstStage.ts';
import { SecondStage } from '../stages/SecondStage.ts';
import { TextureNames } from '../assets/textures.ts';
import { Timer } from 'eventemitter3-timer';

export const WIDTH = 1280;
export const HEIGHT = 720;

export enum GameStatus {
  Win = 'win',
  Lose = 'lose',
  InProgress = 'inProgress'
}

export class GameApp {
  private readonly app: Application;
  private ticker: Ticker | undefined;
  private startButton: Sprite | undefined;
  private activeStage: BaseStage | undefined;
  private firstStage: FirstStage | undefined;
  private timer: Timer = new Timer(60000);

  constructor(parent: HTMLElement, width: number, height: number) {
    this.app = new Application({width, height, backgroundColor: 0});
    parent.appendChild(this.app.view as unknown as Node);
    this.initGame();
  }

  initGame() {
    GameAssets.loadAssets(() => {
      this.firstStage = new FirstStage(this.app, this.timer);
      this.activeStage = this.firstStage;
      this.setupButton();
      this.startGame();
    })
  }

  startGame() {
    this.ticker?.destroy();
    this.ticker = new Ticker();
    this.ticker?.add(this.gameLoop.bind(this));
    this.ticker?.start();
  }

  gameLoop(delta: number) {
    this.timer.timerManager?.update(this.ticker?.elapsedMS);
    this.activeStage?.gameLoop(delta);
    const result = this.activeStage?.checkEndGameCondition();
    if (result === GameStatus.Win) {
      this.ticker?.stop();
      this.timer.stop();
      if (this.activeStage === this.firstStage) {
        this.activeStage = new SecondStage(this.app, this.timer);
        this.startGame();
      } else {
        this.activeStage?.endGame(true);
        this.showButton();
      }
    }
    if (result === GameStatus.Lose) {
      this.showButton();
      this.ticker?.stop();
    }
  }

  setupButton() {
    const startButton = Sprite.from(GameAssets.getTexture(TextureNames.Button));
    startButton.anchor.set(0.5);
    startButton.width = 400;
    startButton.height = 250;
    startButton.position.set(WIDTH / 2, WIDTH / 2.5);
    startButton.cursor = 'pointer';
    startButton.eventMode = 'static';
    startButton.addListener('click', () => {
      this.activeStage?.resetGameObjects();
      this.activeStage = this.firstStage;
      this.activeStage?.restartGame();
      this.startGame();
    });
    this.startButton = startButton;
    this.timer.on('end', () => {
      this.ticker?.stop();
      this.showButton();
    });
  }

  showButton() {
    const startButton = this.startButton;
    const text = new Text('Restart', {fontFamily: 'Honk', fontSize: 50});
    text.anchor.set(0.5);
    if (startButton) {
      text.position.set(startButton.x, startButton.y - text.height / 4)
      this.app.stage.addChild(startButton);
      this.app.stage.addChild(text);
    }
  }
}
