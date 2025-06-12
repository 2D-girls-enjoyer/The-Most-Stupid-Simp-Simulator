import { appPath } from "../../../constants";
import { Application, Assets, Sprite } from "pixi.js";

class DonationPlz {
  public sprite: Sprite;

  async loadSprites(app: Application) {
    if (this.sprite) {
      return;
    }

    this.sprite = Sprite.from(await Assets.load(appPath + '/assets/plz.png'));
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.interactive = true;
    this.sprite.cursor = 'pointer';
    this.sprite.onclick = () => {
      window.app.openKofi();
    }
    this.resize(app);
  }

  destroy() {
    this.sprite.destroy({
      children: true,
    });
    Assets.unload(appPath + '/assets/plz.png');
    this.sprite = null;
  }

  resize(app: Application) {
    let newWidth = app.renderer.width * 0.19;
    let newHeight = this.sprite.texture.height * (newWidth / this.sprite.texture.width);

    if ((newHeight / app.renderer.height) > 0.24) {
      newHeight = app.renderer.height * 0.24;
      newWidth = this.sprite.texture.width * (newHeight / this.sprite.texture.height);
    }

    this.sprite.width = newWidth;
    this.sprite.height = newHeight;
  }
}

export default new DonationPlz();
