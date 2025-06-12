import characterNameList from "../../../backend-driver/characterNameList";
import { appPath } from "../../../constants";
import { Application, Assets, BitmapText, Container, Sprite } from "pixi.js";

class SelectionFrame {
  public container: Container;
  private path: string;
  private handleSelect: VoidFunction;

  async loadSprite(
    app: Application,
    name: string,
    sizePercentage: number,
    onItemSelected: (name: string) => void,
  ) {
    this.path = `${appPath}/characters/${name}/normal.png`;
    const promsises = Promise.all([
      Assets.load(this.path),
      characterNameList.getCharaAuthor(name),
    ]);

    this.handleSelect = () => onItemSelected(name);

    this.container = new Container();
    const frame = Sprite.from('frame-ui');
    frame.anchor.set(0.5, 0.5);

    const nameText = new BitmapText({
      text: name,
      style: {
        fontFamily: "ArialBitmap",
        fontSize: 96,
        fill: 0xffffff,
      }
    });
    nameText.anchor.set(1, 0);

    const [charaAsset, author] = await promsises;

    const authorText = new BitmapText({
      text: author,
      style: {
        fontFamily: "ArialBitmap",
        fontSize: 86,
        fill: 0xffffff,
      }
    });
    authorText.anchor.set(1, 0);

    const characterSprite = Sprite.from(charaAsset);
    characterSprite.anchor.set(0, 0.5);


    this.container.addChild(frame);
    this.container.addChild(nameText);
    this.container.addChild(authorText);
    this.container.addChild(characterSprite);
    this.resize(app, sizePercentage);

    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.on('pointerdown', this.handleSelect);

    return this;
  }

  destroy() {
    Assets.unload(this.path)
      .then(() => {
        const frame = this.container.getChildAt(0) as Sprite;
        const nameText = this.container.getChildAt(1) as BitmapText;
        const authorText = this.container.getChildAt(2) as BitmapText;
        const characterSprite = this.container.getChildAt(3) as Sprite;

        frame.destroy({
          children: true,
          context: true,
        });

        nameText.destroy({
          children: true,
          context: true,
        });

        authorText.destroy({
          children: true,
          context: true,
        });

        characterSprite.destroy({
          children: true,
          context: true,
          style: true,
        });

        this.container.removeChildren();
        this.container.off('pointerdown', this.handleSelect, this);
        this.container.eventMode = 'none';
        this.handleSelect = null;
        this.container.removeAllListeners();
        this.container.destroy({
          children: true,
          texture: true,
          textureSource: true,
          context: true,
          style: true,
        });
        this.container = null;
        this.path = null;
      });
  }

  resize(app: Application, sizePercentage: number) {
    const frame = this.container.getChildAt(0) as Sprite;
    const nameText = this.container.getChildAt(1) as BitmapText;
    const authorText = this.container.getChildAt(2) as BitmapText;
    const characterSprite = this.container.getChildAt(3) as Sprite;

    let newWidth = app.renderer.width * sizePercentage;
    let newHeight = frame.texture.height * (newWidth / frame.texture.width);

    if ((newHeight / app.renderer.height) > 0.35) {
      newHeight = app.renderer.height * 0.35;
      newWidth = frame.texture.width * (newHeight / frame.texture.height);
    }

    frame.width = newWidth;
    frame.height = newHeight;

    const halfFrameWidith = frame.width * 0.5;

    this.resizeCharacter(frame, characterSprite);
    characterSprite.x = (frame.width * 0.05) - (halfFrameWidith);
    characterSprite.y = 0;

    this.resizeNameText(frame, nameText);
    nameText.y = -frame.height * 0.45;
    nameText.x = (halfFrameWidith) - (frame.width * 0.034);

    this.resizeAuthorText(frame, authorText);
    authorText.y = nameText.y + nameText.height + (frame.height * 0.1);
    authorText.x = nameText.x;
  }

  private resizeCharacter(frame: Sprite, characterSprite: Sprite) {
    let newWidth = frame.width * 0.3;
    let newHeight = characterSprite.texture.height * (newWidth / characterSprite.texture.width);

    if ((newHeight / frame.height) > 0.98) {
      newHeight = frame.height * 0.98;
      newWidth = characterSprite.texture.width * (newHeight / characterSprite.texture.height);
    }

    characterSprite.width = newWidth;
    characterSprite.height = newHeight;
  }

  private resizeNameText(frame: Sprite, nameText: BitmapText) {
    const targetWidth = frame.width * 0.5;
    const targetHeight = frame.height * 0.4;
    nameText.scale.set(1);
    nameText.scale.set(Math.min(targetWidth / nameText.width, targetHeight / nameText.height));
  }

  private resizeAuthorText(frame: Sprite, authorText: BitmapText) {
    const targetWidth = frame.width * 0.32;
    const targetHeight = frame.height * 0.24;
    authorText.scale.set(1);
    authorText.scale.set(Math.min(targetWidth / authorText.width, targetHeight / authorText.height));
  }
}

export default SelectionFrame;
