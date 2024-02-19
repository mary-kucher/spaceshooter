import { GameAssets } from '../assets/GameAssets.ts';
import { Application, Sprite, Text, Ticker } from 'pixi.js';
import { Timer } from 'eventemitter3-timer';
import { TextureNames } from '../assets/textures';
import { BaseItem } from '../items/BaseItem.ts';
import { Ship } from '../items/Ship.ts';
import Keyboard from 'pixi.js-keyboard';
import { Bullet } from '../items/Bullet.ts';
import { Asteroid } from '../items/Asteroid.ts';
import { LeftBulletsText } from '../items/LeftBulletsText.ts';
import { Explosion } from '../items/Explosion.ts';

export const WIDTH = 1280;

export class GameApp {
  ticker: Ticker | undefined;
  app: Application;
  gameObjects: GameObjects = {
    startButton: null,
    ship: null,
    asteroids: [],
    bullets: [],
    explosion: [],
    leftBullets: null,
    gameTimer: new Text('', {fontFamily: 'Honk', fontSize: 40})
  };

  constructor(parent: HTMLElement, width: number, height: number) {
    this.app = new Application({width, height, backgroundColor: 0});
    parent.replaceChild(this.app.view as unknown as Node, parent.lastElementChild as Node);
    this.initGame();
  }

  initGame() {
    GameAssets.loadAssets((progress: number) => {
      if (progress === 1) {
        this.startGame();
      }
    })
  }

  startGame() {
    this.createScene();
    this.ticker?.add(this.gameLoop.bind(this));
    this.ticker?.start();
  }

  createScene() {
    this.app.stage.addChild(Sprite.from(GameAssets.getTexture(TextureNames.Background1)));
    this.gameObjects.ship = new Ship(this.app);
    for (let i = 0; i < 10; i++) {
      const asteroid = new Asteroid(this.app);
      this.gameObjects.asteroids.push(asteroid);
    }
    this.gameObjects.leftBullets = new LeftBulletsText(this.app, String(this.gameObjects.ship.leftBullets))
    this.ticker = new Ticker();
    this.setupGameTimer();
    this.setupButton();
  };

  restartGame() {
    this.resetGameObjects();
    this.ticker?.destroy();
    this.startGame();
  }

  gameLoop(delta: number) {
    const {ship, leftBullets} = this.gameObjects;
    if (Keyboard.isKeyDown('ArrowLeft')) {
      ship?.move(-(5 * delta))
    }
    if (Keyboard.isKeyDown('ArrowRight')) {
      ship?.move(5 * delta)
    }
    if (Keyboard.isKeyPressed('Space') && ship?.isShootPossible()) {
      const bullet = ship?.shoot();
      if (bullet) {
        this.gameObjects.bullets.push(bullet);
        leftBullets?.updateText(String(ship?.leftBullets));
      }
    }
    Keyboard.update();
    this.updateGameObjects(delta);
    this.checkCollisionsBetweenObjects();
    this.checkEndGameCondition();
  }

  private updateGameObjects(delta: number) {
    const {asteroids, explosion, bullets} = this.gameObjects;
    asteroids.forEach(item => item.update(delta));
    const updateExplosions = explosion.filter(e => !e.destroyed);
    updateExplosions.forEach(item => item.update(delta));
    this.gameObjects.explosion = updateExplosions;
    const updateBullets = bullets.filter(b => !b.destroyed);
    updateBullets.forEach(item => item.update());
    this.gameObjects.bullets = updateBullets;
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
      this.restartGame();
    });
    this.gameObjects.startButton = startButton;
  }

  showButton() {
    const {startButton} = this.gameObjects;
    const text = new Text('Restart', {fontFamily: 'Honk', fontSize: 50});
    text.anchor.set(0.5);
    if (startButton) {
      text.position.set(startButton.x, startButton.y - text.height / 4)
      this.app.stage.addChild(startButton);
      this.app.stage.addChild(text);
    }
  }

  setupGameTimer() {
    let gameTimer = this.gameObjects.gameTimer;
    gameTimer.position.set(this.app.screen.width - 250, 50);
    const timer = new Timer(60000);
    timer.on('update', (time) => {
      gameTimer.text = `Time left: ${60 - Math.floor(time / 1000)}`;
    });
    timer.on('end', () => {
      this.endGame(false);
    });
    timer.start();
    this.ticker?.add(() => timer.timerManager?.update(this.ticker?.elapsedMS));
    this.app.stage.addChild(gameTimer);
  }

  setupFinalText(text: string) {
    const finalText = new Text(text, {fontFamily: 'Honk', fontSize: 80});
    finalText.anchor.set(0.5);
    finalText.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    this.app.stage.addChild(finalText);
  }

  endGame(isWin: boolean) {
    const text = isWin ? "YOU WIN :)" : "YOU LOSE :(";
    this.setupFinalText(text);
    this.showButton();
    this.ticker?.stop();
  }

  resetGameObjects() {
    this.app.stage.removeChildren();
    this.gameObjects.asteroids = [];
    this.gameObjects.bullets = [];
    this.gameObjects.explosion = [];
  }

  checkCollisionsBetweenObjects() {
    this.gameObjects.asteroids.forEach(asteroid => {
      this.gameObjects.bullets.forEach(bullet => {
        if (this.checkCollision(asteroid, bullet)) {
          this.gameObjects.asteroids = this.gameObjects.asteroids.filter(a => a !== asteroid);
          this.gameObjects.bullets = this.gameObjects.bullets.filter(b => b !== bullet);
          this.gameObjects.explosion.push(asteroid.destroy());
          bullet.destroy();
        }
      })
    });
  }

  checkCollision(object1: BaseItem, object2: BaseItem) {
    const bounds1 = object1.bounds;
    const bounds2 = object2.bounds;

    return bounds1.x < bounds2.x + bounds2.width && bounds1.x + bounds1.width > bounds2.x
      && bounds1.y < bounds2.y + bounds2.height && bounds1.y + bounds1.height > bounds2.y;
  }

  checkEndGameCondition() {
    const {ship, asteroids, bullets} = this.gameObjects;
    if (asteroids.length === 0) {
      this.endGame(true);
      // create next level
    } else if (!ship?.isShootPossible() && bullets.length === 0 && asteroids.length > 0) {
      console.log("!!!!")
      this.endGame(false);
    }
  }
}

type GameObjects = {
  startButton: Sprite | null,
  ship: Ship | null,
  asteroids: Asteroid[],
  bullets: Bullet[],
  explosion: Explosion[],
  leftBullets: LeftBulletsText | null,
  gameTimer: Text,
}
