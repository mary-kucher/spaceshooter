import { Application, Container, Sprite } from 'pixi.js';
import { GameAssets } from '../assets/GameAssets.ts';
import { TextureNames } from '../assets/textures.ts';
import { WIDTH } from '../app/Game.ts';
import { BaseItem } from './BaseItem.ts';
import { FireBall } from './FireBall.ts';

export class Boss implements BaseItem {
  container: Container;
  sprite: Sprite;
  hitPoint: Sprite[] = [];
  isRightDirection: boolean = Math.random() > 0.5;
  elapsedTime: number = 0;
  pauseElapsedTime: number = 0;

  constructor(private app: Application) {
    this.container = new Container();
    this.sprite = Sprite.from(GameAssets.getTexture(TextureNames.Boss));
    this.sprite.height = 200;
    this.sprite.width = 200;
    this.sprite.anchor.set(0.5);
    this.setupHitPoint();
    this.setupContainer();
    this.app.stage.addChild(this.container);
  }

  setupHitPoint() {
    for (let i = 0; i < 4; i++) {
      const hitPoint = Sprite.from(GameAssets.getTexture(TextureNames.HitPoint));
      hitPoint.height = 30;
      hitPoint.width = 30;
      hitPoint.position.set((i - 1) * 30, -this.sprite.height / 2 - hitPoint.height / 2);
      hitPoint.anchor.set(0.5);
      this.hitPoint.push(hitPoint);
    }
  }

  setupContainer() {
    this.container.height = this.sprite.height + 30;
    this.container.width = this.sprite.width;
    this.hitPoint.forEach(hitPoint => this.container.addChild(hitPoint));
    this.container.addChild(this.sprite);
    this.container.position.set(WIDTH / 2, 200);
  }

  move(delta: number) {
    let leftBound = this.container.width / 2;
    let rightBound = WIDTH - this.container.width / 2;
    this.elapsedTime += delta;
    if (this.pauseElapsedTime >= 50) {
      this.elapsedTime = 0;
      this.pauseElapsedTime = 0;
      this.isRightDirection = Math.random() > 0.5;
    }
    if (this.elapsedTime >= 100) {
      this.pauseElapsedTime += delta;
      return;
    }
    if (this.container.x < leftBound) {
      this.isRightDirection = true
    }
    if (this.container.x > rightBound) {
      this.isRightDirection = false;
    }
    if (this.isRightDirection) {
      this.container.x += delta * 5;
    } else {
      this.container.x -= delta * 5;
    }
  }

  shootFireball() {
    return new FireBall(this.app, this.container.x, this.container.y);
  }

  hit() {
    const hp = this.hitPoint.pop();
    if (hp) {
      this.container.removeChild(hp);
    }
    if (this.hitPoint.length === 0) {
      this.destroy();
    }
  }

  get bounds() {
    return this.container.getBounds();
  }

  destroy() {
    this.app.stage.removeChild(this.container);
  }

  update(delta: number) {
    this.move(delta);
  }
}
