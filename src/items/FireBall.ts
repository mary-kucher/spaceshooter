import { Application, Sprite } from 'pixi.js';
import { GameAssets } from '../assets/GameAssets.ts';
import { TextureNames } from '../assets/textures.ts';
import { BaseItem } from './BaseItem.ts';
import { Explosion } from './Explosion.ts';
import { HEIGHT } from '../app/Game.ts';

export class FireBall implements BaseItem {

  fireBall: Sprite;
  isDestroyed: boolean = false;

  constructor(private app: Application, x: number, y: number) {
    const fireBall = Sprite.from(GameAssets.getTexture(TextureNames.FireBall));
    fireBall.height = 50;
    fireBall.width = 70;
    fireBall.anchor.set(0.5);
    fireBall.position.set(x, y);
    this.fireBall = fireBall;
    this.app.stage.addChild(this.fireBall);
  }

  update() {
    this.fireBall.y += 10;
    if (this.fireBall.y > HEIGHT) {
      this.destroy();
    }
  }

  get x() {
    return this.fireBall.x;
  }

  get y() {
    return this.fireBall.y;
  }

  get bounds() {
    return this.fireBall.getBounds();
  }

  destroy() {
    this.app.stage.removeChild(this.fireBall);
    this.isDestroyed = true;
    return new Explosion(this.app, this.x, this.y);
  }

  get destroyed() {
    return this.isDestroyed;
  }

}
