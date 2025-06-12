import { Application } from "pixi.js";

interface IScreen {
  draw(app: Application): Promise<void>;
  resize(app: Application): void;
  destroy(app: Application): void;
}
