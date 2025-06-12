import { Application, Assets, BlurFilter, RenderTexture, Sprite, Texture } from "pixi.js";

class Background {
  public sprite: Sprite;
  private assetLoaded: string;

  async loadSprite(app: Application, url: string, blurStrength?: number) {
    const texture: Texture = await Assets.load(url);

    if (blurStrength) {
      const tempSprite = Sprite.from(texture);
      const rendererTexture = RenderTexture.create({
        width: tempSprite.width,
        height: tempSprite.height
      });
      const blurFilter = new BlurFilter();
      blurFilter.strength = blurStrength || 0;
      tempSprite.filters = blurFilter;

      app.renderer.render({
        container: tempSprite,
        target: rendererTexture
      });

      tempSprite.filters = null;
      blurFilter.destroy(true);

      Assets.unload(url).then(() => {
        texture.destroy(true);
      });

      tempSprite.destroy({ children: true, context: true, texture: true, textureSource: true });
      this.sprite = Sprite.from(rendererTexture);
    } else {
      this.sprite = Sprite.from(texture);
      this.assetLoaded = url;
    }

    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.eventMode = 'none';
    this.resize(app);
  }

  async destroy(destroyAll?: boolean) {
    if (this.assetLoaded) {
      Assets.unload(this.assetLoaded)
    }

    if (destroyAll) {
      this.sprite.destroy({
        children: true,
        texture: true,
        textureSource: true,
        context: true,
        style: true,
      });
    } else {
      this.sprite.destroy({ children: true });
    }
    this.sprite = null;
    this.assetLoaded = null;
    this.assetLoaded = null;
  }

  resize(app: Application) {
    const scale = Math.max(app.renderer.width / this.sprite.texture.width, app.renderer.height / this.sprite.texture.height);

    this.sprite.scale.set(scale, scale);
  }
}

export default new Background();
