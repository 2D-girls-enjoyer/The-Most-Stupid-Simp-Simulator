import { Application, Container, Sprite } from "pixi.js";

class IconButton {
  public container: Container;
  private sprite: Sprite;
  private onClick: VoidFunction;
  private targetFraction: number;
  private maxHeightFraction: number;

  loadContainer(
    app: Application,
    onClick: VoidFunction,
    spriteName: string,
    targetFraction: number,
    maxHeightFraction: number) {

    this.sprite = Sprite.from(spriteName);
    this.sprite.anchor.set(0.5, 0.5);
    this.targetFraction = targetFraction;
    this.maxHeightFraction = maxHeightFraction

    this.onClick = onClick;

    this.container = new Container();
    this.container.addChild(this.sprite);

    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.on('pointerdown', this.onClick);

    this.resize(app);
  }

  resize(app: Application) {
    const rw = app.renderer.width;
    const rh = app.renderer.height;

    this.sprite.width = this.sprite.height = +((rw * this.targetFraction) <= (rh * this.maxHeightFraction)) * (rw * this.targetFraction) +
      +((rw * this.targetFraction) >  (rh * this.maxHeightFraction)) * (rh * this.maxHeightFraction);
  }

  destroy() {
    this.container.visible = false;
    this.sprite.visible = false;
    this.sprite.destroy({
      children: true,
      context: true,
    });

    this.container.removeChildren();
    this.container.off('pointerdown', this.onClick);
    this.onClick = null;
    this.container.removeAllListeners();
    this.container.eventMode = 'none';
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
      context: true,
      style: true,
    });
    this.sprite = null;
    this.container = null;
    this.targetFraction = null;
    this.maxHeightFraction = null;
  }
}

export default IconButton;
