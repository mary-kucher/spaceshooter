import { Application } from 'pixi.js';
import { TextureNames } from '../assets/textures';
import { Asteroid } from '../items/Asteroid.ts';
import { Explosion } from '../items/Explosion.ts';
import { BaseStage } from './BaseStage.ts';
import { GameStatus } from '../app/Game.ts';
import { Timer } from 'eventemitter3-timer';

export const WIDTH = 1280;

export class FirstStage extends BaseStage {
  asteroids: Asteroid[] = [];
  explosion: Explosion[] = [];

  constructor(app: Application, timer: Timer) {
    super(app, TextureNames.Background1, timer);
    this.createStageScene();
  }

  createStageScene() {
    for (let i = 0; i < 10; i++) {
      const asteroid = new Asteroid(this.app);
      this.asteroids.push(asteroid);
    }
  }

  restartGame() {
    this.resetGameObjects();
    this.timer.reset();
    this.createBaseScene();
    this.createStageScene();
  }

  gameLoop(delta: number) {
    super.gameLoop(delta);
    this.updateGameObjects(delta);
    this.checkCollisionsBetweenObjects();
  }

  private updateGameObjects(delta: number) {
    const {asteroids, explosion} = this;
    asteroids.forEach(item => item.update(delta));
    const updateExplosions = explosion.filter(e => !e.destroyed);
    updateExplosions.forEach(item => item.update(delta));
    this.explosion = updateExplosions;
  }

  resetGameObjects() {
    this.app.stage.removeChildren();
    this.asteroids = [];
    this.bullets = [];
    this.explosion = [];
  }

  checkCollisionsBetweenObjects() {
    this.asteroids.forEach(asteroid => {
      this.bullets.forEach(bullet => {
        if (super.checkCollision(asteroid, bullet)) {
          this.asteroids = this.asteroids.filter(a => a !== asteroid);
          this.bullets = this.bullets.filter(b => b !== bullet);
          this.explosion.push(asteroid.destroy());
          bullet.destroy();
        }
      })
    });
  }

  checkEndGameCondition(): string {
    const {asteroids, bullets} = this;
    if (asteroids.length === 0) {
      this.endGame(true);
      this.resetGameObjects();
      return GameStatus.Win;
    } else if (!this.ship?.isShootPossible() && bullets.length === 0 && asteroids.length > 0) {
      this.endGame(false);
      return GameStatus.Lose;
    }
    return GameStatus.InProgress;
  }
}
