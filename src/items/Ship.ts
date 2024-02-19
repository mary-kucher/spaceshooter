import { Application, Sprite } from 'pixi.js';
import { GameAssets } from '../assets/GameAssets.ts';
import { TextureNames } from '../assets/textures.ts';
import { WIDTH } from '../app/Game.ts';
import { Bullet } from './Bullet.ts';

export class Ship {

  private readonly sprite: Sprite;
  private bulletsCounter: number = 10;

  constructor(private app: Application) {
    this.sprite = Sprite.from(GameAssets.getTexture(TextureNames.Ship));
    this.sprite.height = 170;
    this.sprite.width = 170;
    this.sprite.anchor.set(0.5)
    this.sprite.position.set(WIDTH / 2, 635);
    app.stage.addChild(this.sprite);
  }

  shoot() {
    let bullet;
    if (this.isShootPossible()) {
      this.bulletsCounter--;
      bullet = new Bullet(this.app, this.sprite.x, this.sprite.y);
    }
    return bullet;
  }

  move(speed: number) {
    const ship = this.sprite;
    const shipWidthHalf = ship.width / 2;
    if ((speed < 0 && ship.x >= shipWidthHalf) ||
      (speed > 0 && ship.x <= WIDTH - shipWidthHalf)) {
      this.sprite.x += speed;
    }
  }

  isShootPossible() {
    return this.bulletsCounter > 0;
  }

  get leftBullets() {
    return this.bulletsCounter;
  }
}
