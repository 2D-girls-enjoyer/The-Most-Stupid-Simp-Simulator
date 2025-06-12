import { Application, BitmapText, Container, Sprite } from "pixi.js";

class Box {
  public container: Container;
  private frame: Sprite;
  private descriptionText: BitmapText;
  private contentText: BitmapText;

  loadSprite(app: Application, description: string, content: string, sizeFraction: number) {
    this.container = new Container();
    this.frame = Sprite.from('box-ui');
    this.frame.anchor.set(0.5, 0.5);

    this.descriptionText = new BitmapText({
      text: description,
      style: {
        fontFamily: "ArialBitmap",
        fontSize: 64,
        fill: 0xffffff,
      }
    });

    this.descriptionText.anchor.set(0.5, 1);

    this.contentText = new BitmapText({
      text: content,
      style: {
        fontFamily: "ArialBitmap",
        fontSize: 64,
        fill: 0xffffff,
      }
    });
    this.contentText.anchor.set(0.5, 0.5);

    this.container.addChild(this.frame);
    this.container.addChild(this.descriptionText);
    this.container.addChild(this.contentText);
    this.resize(app, sizeFraction);
  }

  destroy() {
    this.contentText.destroy({
      children: true,
      context: true,
    });

    this.descriptionText.destroy({
      children: true,
      context: true,
    });

    this.frame.destroy({
      children: true,
      context: true,
    });

    this.container.removeAllListeners();
    this.container.eventMode = 'none';
    this.container.removeChildren();

    this.container.destroy({
      children: true,
      texture: true,
      context: true,
      textureSource: false,
      style: true,
    });

    this.frame = null;
    this.container = null;
    this.descriptionText = null;
    this.contentText = null;
  }

  resize(app: Application, sizeFraction: number) {
    let newWidth = app.renderer.width * sizeFraction;
    let newHeight = this.frame.texture.height * (newWidth / this.frame.texture.width);

    if ((newHeight / app.renderer.height) > 0.2) {
      newHeight = app.renderer.height * 0.2;
      newWidth = this.frame.texture.width * (newHeight / this.frame.texture.height);
    }

    this.frame.width = newWidth;
    this.frame.height = newHeight;

    this.descriptionText.scale.set(1);
    this.descriptionText.scale.set((this.frame.width * 0.6) / this.descriptionText.width);
    this.descriptionText.y = (-this.frame.height * 0.5);

    const targetWidth = this.frame.width * 0.735;
    const targetHeight = this.frame.height * 0.366;
    this.contentText.scale.set(1);
    this.contentText.scale.set(Math.min(targetWidth / this.contentText.width, targetHeight / this.contentText.height));
    this.contentText.y = -(this.frame.height * 0.194444444);
  }

  updateContent(newContentText: string) {
    if (this.contentText.text !== newContentText) {
      this.contentText.text = newContentText;
    }
  }
}

export default Box;
