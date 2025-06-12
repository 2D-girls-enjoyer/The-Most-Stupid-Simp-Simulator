import { Application } from "pixi.js";
import { IScreen } from "../interfaces/screen";

export abstract class AbstractScreen implements IScreen {
  async draw(app: Application): Promise<void> {
    await this.load(app);
    this.positionWorld(app);
    this.addToStage(app);
  }

  public abstract resize(app: Application): void;
  public abstract destroy(app: Application): void;

  protected abstract load(app: Application): Promise<void>;
  protected abstract positionWorld(app: Application): void;
  protected abstract addToStage(app: Application): void;
}
