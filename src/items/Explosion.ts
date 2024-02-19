import { Application, Rectangle, Sprite } from 'pixi.js';
import { GameAssets } from '../assets/GameAssets.ts';
import { TextureNames } from '../assets/textures.ts';
import { BaseItem } from './BaseItem.ts';

export class Explosion implements BaseItem {

  private readonly sprite: Sprite;
  private isDestroyed: boolean = false;

  constructor(private app: Application, x: number, y: number) {
    this.sprite = Sprite.from(GameAssets.getTexture(TextureNames.Explosion));
    this.sprite.height = 120;
    this.sprite.width = 120;
    this.sprite.position.set(x, y);
    this.sprite.anchor.set(0.5);
    app.stage.addChild(this.sprite);
    const timer = setTimeout(() => {
      this.destroy();
    }, 300);

    this.sprite.once('removed', () => clearTimeout(timer));
  }

  update(delta: number) {
    this.sprite.rotation += delta * 5;
  }

  get bounds(): Rectangle {
    return this.sprite.getBounds();
  }

  get destroyed() {
    return this.isDestroyed;
  }

  destroy() {
    this.isDestroyed = true;
    this.app.stage.removeChild(this.sprite);
  }
}
