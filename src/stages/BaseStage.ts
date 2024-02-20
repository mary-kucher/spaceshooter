import { BaseItem } from '../items/BaseItem.ts';
import { Ship } from '../items/Ship.ts';
// @ts-ignore
import Keyboard from 'pixi.js-keyboard';
import { LeftBulletsText } from '../items/LeftBulletsText.ts';
import { Bullet } from '../items/Bullet.ts';
import { Application, Sprite, Text } from 'pixi.js';
import { GameAssets } from '../assets/GameAssets.ts';
import { Timer } from 'eventemitter3-timer';
import { WIDTH } from './FirstStage.ts';
import { HEIGHT } from '../app/Game.ts';

export abstract class BaseStage {
  ship: Ship | null = null;
  leftBullets: LeftBulletsText | undefined;
  bullets: Bullet[] = [];
  gameTimer: Text = new Text('', {fontFamily: 'Honk', fontSize: 40});

  protected constructor(protected app: Application, private background: string, protected timer: Timer) {
    this.createBaseScene();
  }

  abstract checkEndGameCondition(): string;

  abstract restartGame(): void;

  abstract resetGameObjects(): void;

  createBaseScene() {
    this.app.stage.addChild(Sprite.from(GameAssets.getTexture(this.background)));
    this.ship = new Ship(this.app);
    this.leftBullets = new LeftBulletsText(this.app, String(this.ship.leftBullets));
    this.setupGameTimer();
  }

  gameLoop(delta: number) {
    this.moveShip(delta);

    const updateBullets = this.bullets.filter(b => !b.destroyed);
    updateBullets.forEach(item => item.update());
    this.bullets = updateBullets;
  }

  checkCollision(object1: BaseItem, object2: BaseItem) {
    const bounds1 = object1.bounds;
    const bounds2 = object2.bounds;

    return bounds1.x < bounds2.x + bounds2.width && bounds1.x + bounds1.width > bounds2.x
      && bounds1.y < bounds2.y + bounds2.height && bounds1.y + bounds1.height > bounds2.y;
  }

  moveShip(delta: number) {
    const ship = this.ship;
    if (Keyboard.isKeyDown('ArrowLeft')) {
      ship?.move(-(5 * delta))
    }
    if (Keyboard.isKeyDown('ArrowRight')) {
      ship?.move(5 * delta)
    }
    if (Keyboard.isKeyPressed('Space') && ship?.isShootPossible()) {
      const bullet = ship?.shoot();
      if (bullet) {
        this.bullets.push(bullet);
        this.leftBullets?.updateText(String(ship?.leftBullets));
      }
    }
    Keyboard.update();
  }

  setupGameTimer() {
    let gameTimer = this.gameTimer;
    gameTimer.position.set(WIDTH - 250, 50);
    this.timer.on('update', (time) => {
      gameTimer.text = `Time left: ${60 - Math.floor(time / 1000)}`;
    });
    this.timer.on('end', () => {
      this.endGame(false);
    });
    this.timer.reset();
    this.timer.start();
    this.app.stage.addChild(gameTimer);
  }

  setupFinalText(text: string) {
    const finalText = new Text(text, {fontFamily: 'Honk', fontSize: 80});
    finalText.anchor.set(0.5);
    finalText.position.set(WIDTH / 2, HEIGHT / 2);
    this.app.stage.addChild(finalText);
  }

  endGame(isWin: boolean) {
    const text = isWin ? "YOU WIN :)" : "YOU LOSE :(";
    this.setupFinalText(text);
  }
}
