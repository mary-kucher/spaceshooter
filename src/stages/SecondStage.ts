import { Application } from 'pixi.js';
import { TextureNames } from '../assets/textures.ts';
import { Boss } from '../items/Boss.ts';
import { BaseStage } from './BaseStage.ts';
import { Timer } from 'eventemitter3-timer';
import { GameStatus } from '../app/Game.ts';
import { FireBall } from '../items/FireBall.ts';
import { Explosion } from '../items/Explosion.ts';

export class SecondStage extends BaseStage {
  boss: Boss | undefined;
  fireBall: FireBall | null = null;
  explosions: Explosion[] = [];
  private timeSinceLastFireball = 0;

  constructor(app: Application, timer: Timer) {
    super(app, TextureNames.Background2, timer);
    this.createStageScene();
  }

  createStageScene() {
    this.boss = new Boss(this.app);
  }

  gameLoop(delta: number) {
    super.gameLoop(delta);
    this.updateGameObjects(delta);
    this.checkCollisionsBetweenObjects();
    this.bossShooting(delta);
  }

  bossShooting(delta: number) {
    this.timeSinceLastFireball += delta;
    if (this.timeSinceLastFireball >= 100) {
      const fireball = this.boss?.shootFireball();
      if (fireball) {
        this.fireBall = fireball;
        this.timeSinceLastFireball = 0;
      }
    }
    if (this.fireBall) {
      this.fireBall.update();
    }
  }

  updateGameObjects(delta: number) {
    const {boss, bullets, explosions} = this;
    boss?.update(delta);
    const updateBullets = bullets.filter(b => !b.destroyed);
    updateBullets.forEach(item => item.update());
    this.bullets = updateBullets;
    const updateExplosions = explosions.filter(e => !e.destroyed);
    updateExplosions.forEach(item => item.update(delta));
    this.explosions = updateExplosions;
  }

  checkCollisionsBetweenObjects() {
    const {boss, bullets, fireBall, ship} = this;
    bullets.forEach(bullet => {
      if (boss && super.checkCollision(boss, bullet)) {
        this.bullets = this.bullets.filter(b => b !== bullet);
        bullet.destroy();
        this.boss?.hit();
        const exp = new Explosion(this.app, bullet.x, bullet.y);
        this.explosions.push(exp);
      }
      if (fireBall && super.checkCollision(fireBall, bullet)) {
        fireBall.destroy();
        bullet.destroy();
        this.fireBall = null;
      }
    })
    if (fireBall && ship && super.checkCollision(fireBall, ship)) {
      ship?.destroy();
    }
  }

  checkEndGameCondition(): string {
    const {ship, boss, bullets} = this;
    const hpLeft = boss?.hitPoint.length;
    if (hpLeft === 0) {
      this.endGame(true);
      return GameStatus.Win;
    } else if (!ship?.isShootPossible() && bullets.length === 0 && hpLeft && hpLeft > 0 ||
      this.ship?.isDestroyed) {
      this.endGame(false);
      return GameStatus.Lose;
    }
    return GameStatus.InProgress;
  }

  resetGameObjects() {
    this.app.stage.removeChildren();
    this.bullets = [];
    this.explosions = [];
  }

  restartGame(): void {
    //not used
  }
}
