import { Application, Container, Graphics, Text } from 'pixi.js';

export class LeftBulletsText {
  leftCount: Text;

  constructor(private app: Application, text: string) {
    const bulletsContainer = new Container();
    const bullet = new Graphics();
    bullet.beginFill(0xffffff);
    bullet.drawCircle(50, 50, 50);
    bullet.height = 30;
    bullet.width = 30;
    bullet.position.set();
    bulletsContainer.addChild(bullet);

    const leftCount = new Text(text, {fontFamily: 'Honk', fontSize: 50});
    leftCount.anchor.set(0.5);
    leftCount.position.set(bullet.width * 2, bullet.height / 1.7);
    bulletsContainer.position.set(50, 50);
    bulletsContainer.addChild(leftCount);
    this.app.stage.addChild(bulletsContainer);
    this.leftCount = leftCount;
  }

  updateText(text: string) {
    this.leftCount.text = text;
  }
}
