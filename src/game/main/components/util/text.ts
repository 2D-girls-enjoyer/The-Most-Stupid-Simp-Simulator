import { BitmapText, Container } from "pixi.js";

class Text {
  public container: Container;
  private text: BitmapText;

  loadContainer(
    text: string,
    color: number,
    baseWidth: number,
    widthFraction: number,
    baseHeight: number,
    heightFraction: number
  ) {
    this.text = new BitmapText({
      text,
      style: {
        fontFamily: "ArialBitmap",
        fontSize: 64,
        fill: color,
      }
    });
    this.text.anchor.set(0.5, 0.5);
    this.container = new Container();
    this.container.addChild(this.text);
    this.resize(baseWidth, widthFraction, baseHeight, heightFraction);
  }

  resize(baseWidth: number, widthFraction: number, baseHeight: number, heightFraction: number) {
    const targetWidth = baseWidth * widthFraction;
    const targetHeight = baseHeight * heightFraction;

    this.text.scale.set(1);
    this.text.scale.set(Math.min(targetWidth / this.text.width, targetHeight / this.text.height, 1));
  }

  destroy() {
    this.container.visible = false;
    this.text.visible = false;

    this.text.destroy({
      children: true,
      context: true,
    });

    this.container.removeAllListeners();
    this.container.eventMode = 'none';
    this.container.removeChildren();
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
      context: true,
      style: true,
    });

    this.text = null;
    this.container = null;
  }
}

export default Text;
