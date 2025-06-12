import { Application, Ticker } from "pixi.js";
import { IScreen } from "./interfaces/screen";

class ScreenDrawer {
  private screens: IScreen[];
  private currentScreen: number = -1;
  private screenToDraw: number;
  private ticker: Ticker;
  private canDraw = false;
  private app: Application;

  constructor() {
    this.draw = this.draw.bind(this);
  }

  defineScreens(app: Application, screens: IScreen[]) {
    this.app = app;
    this.screens = screens;
    this.ticker = new Ticker();
    this.ticker.maxFPS = 1;
    this.ticker.add(async () => {
      if (this.canDraw) {
        this.canDraw = false;
        await this.draw(this.app);
      }
    });
    this.ticker.start();
  }

  drawDefined(screenId: number) {
    this.screenToDraw = screenId;
    this.canDraw = true;
  }

  resizeCurrent(app: Application) {
    this.app = app;
    this.screens[this.currentScreen].resize(this.app);
  }

  private async draw(app: Application) {
    if (this.currentScreen > -1) {
      this.screens[this.currentScreen].destroy(app);
    }

    void this.screens[this.screenToDraw].draw(app);

    this.currentScreen = this.screenToDraw;
  }
}

export default new ScreenDrawer();
