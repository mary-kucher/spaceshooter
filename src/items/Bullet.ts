import { Application, Graphics } from 'pixi.js';
import { BaseItem } from './BaseItem.ts';

export class Bullet implements BaseItem {

  bullet: Graphics;
  isDestroyed: boolean = false;

  constructor(private app: Application, x: number, y: number) {
    this.bullet = new Graphics();
    this.bullet.beginFill(0xffffff);
    this.bullet.drawCircle(50, 50, 50);
    this.bullet.height = 30;
    this.bullet.width = 30;
    this.bullet.position.set(x - 15, y);
    app.stage.addChild(this.bullet);
  }

  update() {
    this.bullet.y -= 15;

    if (this.bullet.y < 0) {
      this.destroy();
    }
  }

  get x() {
    return this.bullet.x;
  }

  get y() {
    return this.bullet.y;
  }

  get bounds() {
    return this.bullet.getBounds();
  }

  destroy() {
    this.app.stage.removeChild(this.bullet);
    this.isDestroyed = true;
  }

  get destroyed() {
    return this.isDestroyed;
  }
}
