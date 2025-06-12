import { Application, Graphics } from "pixi.js";

class Overlay {
  public graphic: Graphics;
  private callbacks: { [key: string]: VoidFunction };
  private currentIdentifier: string;
  private isVisible: boolean;

  constructor() {
    this.onClick = this.onClick.bind(this);
  }

  loadOverlay(app: Application) {
    this.graphic = new Graphics();
    this.graphic.eventMode = 'static';
    this.graphic.on('pointerdown', this.onClick);
    this.callbacks = {};
    this.isVisible = false;
    this.resize(app);
  }

  resize(app: Application) {
    this.graphic.clear();
    this.graphic
      .rect(0, 0, app.renderer.width, app.renderer.height)
      .fill({ color: 0x000000, alpha: 0.9 });
    this.graphic.renderable = this.isVisible;
  }

  destroy() {
    this.graphic.destroy({
      children: true,
      context: true,
      style: true,
      texture: true,
      textureSource: true,
    });
    this.graphic = null;

    this.callbacks = null;
    this.isVisible = null;
    this.currentIdentifier = null;
  }

  addOnClick(identifier: string, callback: VoidFunction) {
    this.callbacks[identifier] = callback;
  }

  setVisible(identifier: string) {
    this.currentIdentifier = identifier;
    this.isVisible = true;
    this.graphic.renderable = this.isVisible;
  }

  setInvisible() {
    this.currentIdentifier = '';
    this.isVisible = false;
    this.graphic.renderable = this.isVisible;
  }

  private onClick() {
    this.callbacks[this.currentIdentifier]?.();
  }
}

export default new Overlay();
