import { Assets } from 'pixi.js'
import { TextureNames, appTextures } from './textures';

export class GameAssets {
  private static textures = new Map();

  static {
    Object.entries(appTextures).forEach(([key, value]) => {
      Assets.add({alias: key, src: value})
    });
  }

  static loadAssets(onFinish: () => void) {
    const keys = Object.values(TextureNames);
    Assets.load(keys).then(data => {
      Object.entries(data).forEach(([key, value]) => this.textures.set(key, value));
      onFinish();
    }).catch(console.error);
  }

  static getTexture(id: string) {
    if (this.textures.has(id)) {
      return this.textures.get(id);
    }
    return null;
  }
}
