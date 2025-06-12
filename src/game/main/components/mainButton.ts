import { Assets, BitmapText, Container, Renderer, Sprite } from "pixi.js";

const maxHeightFraction = 0.11;

class MainButton {
  public container: Container;
  private btnSprite: Sprite;
  private textBitmap: BitmapText;
  private onClick: VoidFunction;

  constructor() {
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  loadContainer(
    sizeReference: Renderer | Container,
    sizeWidthFraction: number,
    text: string,
    onClick: VoidFunction
  ) {
    this.container = new Container();
    this.btnSprite = Sprite.from('normal-btn');
    this.textBitmap = new BitmapText({
      text,
      style: {
        fontFamily: "ArialBitmap",
        fontSize: 64,
        fill: 0xffffff,
      }
    });
    this.onClick = onClick;

    this.container.addChild(this.btnSprite);
    this.container.addChild(this.textBitmap);

    this.btnSprite.anchor.set(0.5, 0.5);
    this.textBitmap.anchor.set(0.5, 0.5);

    this.resize(sizeReference, sizeWidthFraction);

    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.on('pointerdown', this.onClick);
    this.container.on('mouseover', this.handleMouseOver);
    this.container.on('mouseleave', this.handleMouseLeave);
  }

  resize(
    sizeReference: Renderer | Container,
    sizeWidthFraction: number
  ) {

    let newWidth = sizeReference.width * sizeWidthFraction;
    let newHeight = this.btnSprite.texture.height * (newWidth / this.btnSprite.texture.width);

    if ((newHeight / sizeReference.height) > maxHeightFraction) {
      newHeight = sizeReference.height * maxHeightFraction;
      newWidth = this.btnSprite.texture.width * (newHeight / this.btnSprite.texture.height);
    }

    this.btnSprite.width = newWidth;
    this.btnSprite.height = newHeight;

    const txtTargetWidth = this.btnSprite.width * 0.98;
    const txtTargetHeight = this.btnSprite.height * 0.7;


    this.textBitmap.scale.set(1);
    this.textBitmap.scale.set(Math.min(txtTargetWidth / this.textBitmap.width, txtTargetHeight / this.textBitmap.height, 1));

    this.textBitmap.x = -2.0;
    this.textBitmap.y = 0;
  }

  destroy() {
    this.btnSprite.visible = false;
    this.textBitmap.visible = false;
    this.container.visible = false;
    this.btnSprite.destroy({
      children: true,
      context: true,
    });

    this.textBitmap.destroy({
      children: true,
      context: true,
    });

    this.container.removeChildren();
    this.container.off('pointerdown', this.onClick);
    this.container.off('mouseover', this.handleMouseOver);
    this.container.off('mouseleave', this.handleMouseLeave);
    this.onClick = null;
    this.handleMouseOver = null;
    this.handleMouseLeave = null;
    this.container.removeAllListeners();
    this.container.eventMode = 'none';
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
      context: true,
      style: true,
    });
    this.btnSprite = null;
    this.textBitmap = null;
    this.container = null;
  }

  private handleMouseOver() {
    this.btnSprite.texture = Assets.get('clicked-btn');
  }

  private handleMouseLeave() {
    this.btnSprite.texture = Assets.get('normal-btn');
  }
}

export default MainButton;
