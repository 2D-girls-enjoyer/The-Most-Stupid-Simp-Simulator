import { appPath } from "../../../constants";
import { Application, Assets, Sprite } from "pixi.js";

class Logo {
  public sprite: Sprite;

  async loadSprite(app: Application, sizeP: number) {
    if (this.sprite) {
      return;
    }

    this.sprite = Sprite.from(await Assets.load(appPath + '/assets/logo.png'));
    this.sprite.anchor.set(0.5, 0.5);
    this.resize(app, sizeP);
  }

  destroy() {
    this.sprite.destroy({
      children: true,
    });
    void Assets.unload(appPath + '/assets/logo.png');
    this.sprite = null;
  }

  resize(app: Application, sizeP: number) {
    let newWidth = app.renderer.width * sizeP;
    let newHeight = this.sprite.texture.height * (newWidth / this.sprite.texture.width);

    if ((newHeight / app.renderer.height) > 0.28) {
      newHeight = app.renderer.height * 0.28;
      newWidth = this.sprite.texture.width * (newHeight / this.sprite.texture.height);
    }

    this.sprite.width = newWidth;
    this.sprite.height = newHeight;
  }
}

export default new Logo();
