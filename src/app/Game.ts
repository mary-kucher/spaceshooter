import { images } from '../assets/loader';
import * as PIXI from 'pixi.js';
import Keyboard from 'pixi.js-keyboard';
import { Timer } from 'eventemitter3-timer';


export class GameApp {
  ticker: PIXI.Ticker;
  app: PIXI.Application;
  background: PIXI.Sprite;
  asteroidTexture: PIXI.Texture;
  gameObjects: GameObjects = {
    startButton: null,
    ship: null,
    asteroids: [],
    bullets: [],
    explosion: null,
    leftBullets: null,
    gameTimer: {
      timerText: null,
      gameTime: 60,
    },
    finalText: null,
  };

  constructor(parent: HTMLElement, width: number, height: number) {
    this.moveBullet = this.moveBullet.bind(this);
    this.setup = this.setup.bind(this);
    this.app = new PIXI.Application({width, height, backgroundColor: 0});
    this.app.loader.add('background', images.space).load(() => {
      this.background = new PIXI.Sprite(this.app.loader.resources.background.texture);
    }).load(() => this.loadShip()).load(() => {
      this.asteroidTexture = PIXI.Texture.from(images.asteroid);
    }).load(() => {
      const explosionTexture = PIXI.Texture.from(images.explosion);
      this.gameObjects.explosion = new PIXI.Sprite(explosionTexture);
    }).load(() => {
      this.loadButton();
    }).onComplete.add(this.setup)
    parent.replaceChild(this.app.view, parent.lastElementChild);
  }

  loadButton() {
    const texture = PIXI.Texture.from(images.button);
    const startButton = new PIXI.Sprite(texture);
    const screen = this.app.screen;
    startButton.anchor.set(0.5);
    startButton.width = 400;
    startButton.height = 250;
    startButton.position.set(screen.width / 2, screen.height / 3 + startButton.height);
    startButton.addListener('click', () => {
      this.resetGame()
    });
    this.gameObjects.startButton = startButton;
  }

  loadShip() {
    const texture = PIXI.Texture.from(images.cat);
    const ship = new PIXI.Sprite(texture);
    ship.height = 170;
    ship.width = 170;
    ship.anchor.set(0.5)
    this.gameObjects.ship = ship;
  }

  setup() {
    this.app.stage.addChild(this.background);
    this.ticker = new PIXI.Ticker();
    this.ticker.start();
    this.setupShip();
    this.setupAsteroids();
    this.setupGameTimer();
    this.setupBullets();
  }

  setupShip() {
    const { ship, bullets} = this.gameObjects;
    const width = this.app.screen.width;
    ship.position.set(width / 2, 635);
    this.app.stage.addChild(ship);
    this.ticker.add((delta) => {
      const speed = 5 * delta;
      if (Keyboard.isKeyDown('ArrowLeft') && ship.x >= ship.width / 2) {
        ship.x -= speed;
      }
      if (Keyboard.isKeyDown('ArrowRight') && ship.x <= width - ship.width / 2) {
        ship.x += speed;
      }
      if (Keyboard.isKeyPressed('Space') && bullets.length > 0) {
        this.shoot();
      }
      Keyboard.update();
    });
  }

  setupAsteroids() {
    const padding = 50;
    for (let i = 0; i < 10; i++) {
      const asteroid = new PIXI.Sprite(this.asteroidTexture);
      asteroid.height = 100;
      asteroid.width = 100;
      asteroid.anchor.set(0.5);
      asteroid.x = padding + Math.random() * (this.app.screen.width - padding * 2);
      asteroid.y = padding + Math.random() * (this.gameObjects.ship.y - 300 - padding);
      this.app.stage.addChild(asteroid);
      this.ticker.add((delta) => {
        asteroid.rotation += 0.05 * delta;
      });
      this.gameObjects.asteroids.push(asteroid);
    }
  }

  shoot() {
    const { bullets, ship, leftBullets} = this.gameObjects;
    const bullet = bullets.pop();
    bullet.position.set(ship.x, ship.y);
    const bulletTicker = () => {
      this.moveBullet(bullet, bulletTicker);
    };
    this.ticker.add(bulletTicker);
    this.app.stage.addChild(bullet);
    leftBullets.text = bullets.length.toString();
  };

  setupBullets() {
    for (let i = 0; i < 10; i++) {
      const bullet = this.createBullet();
      this.gameObjects.bullets.push(bullet);
    }
    this.leftBullets();
  }

  moveBullet(bullet: PIXI.Graphics, currentTicker: () => void) {
    bullet.y -= 10;

    const { bullets, asteroids } = this.gameObjects;
    const asteroid = asteroids.find(asteroid => this.checkCollision(bullet, asteroid));
    this.destroyAsteroid(asteroid);

    if (bullet.y < 0 || asteroid) {
      this.app.stage.removeChild(bullet);
      this.ticker.remove(currentTicker);
      this.gameObjects.bullets = bullets.filter(bul => bul !== bullet);
      this.gameObjects.leftBullets.text = bullets.length.toString();
      this.checkEndGameCondition();
    }
  }

  destroyAsteroid(asteroid: PIXI.Sprite) {
    if (asteroid) {
      this.setupExplosion(asteroid.x, asteroid.y);
      this.gameObjects.asteroids = this.gameObjects.asteroids.filter(ast => ast !== asteroid);
      this.app.stage.removeChild(asteroid);
    }
  }

  setupExplosion(x: number, y: number) {
    const explosion = this.gameObjects.explosion;
    explosion.height = 120;
    explosion.width = 120;
    explosion.position.set(x, y);
    explosion.anchor.set(0.5);
    this.ticker.add((delta) => {
      explosion.rotation += delta * 5;
    })
    this.app.stage.addChild(explosion);
    const timer = setTimeout(() => {
      this.app.stage.removeChild(explosion);
    }, 300);

    explosion.once('removed', () => clearTimeout(timer));
  }

  setupGameTimer() {
    const gameTimer = this.gameObjects.gameTimer;
    gameTimer.timerText = new PIXI.Text('', { fontFamily: 'Honk', fontSize: 40 });
    gameTimer.timerText.position.set(this.app.screen.width - 250, 50);
    const timer = new Timer(60000);
    timer.on('update', (time) => {
      gameTimer.timerText.text = `Time left: ${60 - Math.floor(time / 1000)}`;
    });
    timer.on('end', () => {
      this.endGame(false);
    });
    timer.start();
    this.ticker.add(() => timer.timerManager.update(this.ticker.elapsedMS));
    this.app.stage.addChild(gameTimer.timerText);
  }

  setupFinalText(text: string) {
    const finalText = new PIXI.Text(text, {fontFamily: 'Honk', fontSize: 80});
    finalText.anchor.set(0.5);
    finalText.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    this.app.stage.addChild(finalText);
    this.gameObjects.finalText = finalText;
  }

  leftBullets() {
    const bulletsContainer = new PIXI.Container();
    const bullet = this.createBullet();
    bulletsContainer.addChild(bullet);

    const leftCount = new PIXI.Text(`${this.gameObjects.bullets.length}`, { fontFamily: 'Honk', fontSize: 50 });
    leftCount.anchor.set(0.5);
    leftCount.position.set(bullet.width * 2, bullet.height / 2);
    bulletsContainer.position.set(50, 50);
    bulletsContainer.addChild(leftCount);
    this.gameObjects.leftBullets = leftCount;
    this.app.stage.addChild(bulletsContainer);
  }

  endGame(isWin: boolean) {
    const text = isWin ? "YOU WIN :)" : "YOU LOSE :(";
    this.setupFinalText(text);
    this.setupButton();
    this.ticker.stop();
  }

  setupButton() {
    const { startButton} = this.gameObjects;
    const text = new PIXI.Text('Restart', { fontFamily: 'Honk', fontSize: 50 });
    text.anchor.set(0.5);
    text.position.set(startButton.x, startButton.y - text.height / 4)
    startButton.interactive = true;
    startButton.buttonMode = true;
    this.app.stage.addChild(startButton);
    this.app.stage.addChild(text);
    this.gameObjects.startButton = startButton;
  }

  createBullet() {
    const bullet = new PIXI.Graphics();
    bullet.beginFill(0xffffff);
    bullet.drawCircle(50, 50, 50);
    bullet.height = 30;
    bullet.width = 30;
    return bullet;
  }

  resetGame() {
    this.ticker.destroy();
    this.app.stage.removeChildren();
    this.setup();
  }

  checkCollision(object1: PIXI.Graphics, object2: PIXI.Sprite) {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width && bounds1.x + bounds1.width > bounds2.x
      && bounds1.y < bounds2.y + bounds2.height && bounds1.y + bounds1.height > bounds2.y;
  }

  checkEndGameCondition() {
    const { bullets, asteroids } = this.gameObjects;
    if (asteroids.length === 0) {
      this.endGame(true);
    } else if (bullets.length === 0 && asteroids.length > 0 ) {
      this.endGame(false);
    }
  }
}

type GameObjects = {
  startButton: PIXI.Sprite,
  ship: PIXI.Sprite,
  asteroids: PIXI.Sprite[],
  bullets: PIXI.Graphics[],
  explosion: PIXI.Sprite,
  leftBullets: PIXI.Text,
  gameTimer: TimerType,
  finalText: PIXI.Text,
}

type TimerType = {
  timerText: PIXI.Text,
  gameTime: number,
}
