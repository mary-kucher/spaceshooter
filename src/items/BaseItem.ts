import { Rectangle } from 'pixi.js';

export interface BaseItem {

  update(delta: number): void;

  get bounds(): Rectangle;

  destroy(): void;
}
