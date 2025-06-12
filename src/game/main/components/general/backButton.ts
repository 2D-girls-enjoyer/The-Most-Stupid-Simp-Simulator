import { Application, Container, Sprite } from "pixi.js";
import screenDrawer from "../../screenDrawer";

const widthFraction = 0.09;
const maxHeight = 0.05;

class BackButton {
  public container: Container;
  private btn: Sprite;
  private targetScreen: number;

  constructor() {
    this.moveToScreen = this.moveToScreen.bind(this);
  }

  public loadContainer(app: Application, targetScreen: number) {
    this.container = new Container();
    this.btn = Sprite.from('back-btn');
    this.targetScreen = targetScreen;

    this.resize(app);

    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.on('pointerdown', this.moveToScreen);
    this.container.addChild(this.btn);
  }

  public resize(app: Application) {
    let newWidth = app.renderer.width * widthFraction;
    let newHeight = this.btn.texture.height * (newWidth / this.btn.texture.width);

    if ((newHeight / app.renderer.height) > maxHeight) {
      newHeight = app.renderer.height * maxHeight;
      newWidth = this.btn.texture.width * (newHeight / this.btn.texture.height);
    }

    this.btn.width = newWidth;
    this.btn.height = newHeight;
  }

  public destroy() {
    this.btn.destroy({
      children: true,
      context: true,
    });

    this.container.removeChildren();
    this.container.eventMode = 'none';
    this.container.removeAllListeners();
    this.container.off('pointerdown', this.moveToScreen);
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
      context: true,
      style: true,
    });

    this.btn = null;
    this.container = null;
    this.targetScreen = null;
  }

  private moveToScreen() {
    screenDrawer.drawDefined(this.targetScreen);
  }
}

export default BackButton;
