import { Application, Sprite } from 'pixi.js';
import { GameAssets } from '../assets/GameAssets.ts';
import { TextureNames } from '../assets/textures.ts';
import { WIDTH } from '../app/Game.ts';
import { BaseItem } from './BaseItem.ts';
import { Explosion } from './Explosion.ts';

export class Asteroid implements BaseItem {

  private readonly sprite: Sprite;

  constructor(private app: Application) {
    const padding = 50;
    this.sprite = Sprite.from(GameAssets.getTexture(TextureNames.Asteroid));
    this.sprite.height = 100;
    this.sprite.width = 100;
    this.sprite.anchor.set(0.5);
    this.sprite.x = padding + Math.random() * (WIDTH - padding * 2);
    this.sprite.y = padding + Math.random() * (335 - padding);
    app.stage.addChild(this.sprite);
  }

  update(delta: number) {
    this.sprite.rotation += 0.05 * delta;
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  get bounds() {
    return this.sprite.getBounds();
  }

  destroy() {
    this.app.stage.removeChild(this.sprite);
    return new Explosion(this.app, this.x, this.y);
  }
}
