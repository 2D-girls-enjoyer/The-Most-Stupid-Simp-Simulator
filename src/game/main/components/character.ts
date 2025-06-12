import { appPath } from "../../../game/constants";
import { Application, Assets, Container, Sprite, Texture } from "pixi.js";
import characterManager from "../context-holders/characterManager";

class Character {
  public container: Container;
  private sprite: Sprite;
  public currentCharacterPath: string;
  public isMouseOver: boolean;
  private normal: Texture;
  private headpating: Texture;
  private headpatCursorStr: string;
  private isClicked: boolean;

  private normalPath: string;
  private headpatingPath: string;

  constructor() {
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  async loadContainer(app: Application) {
    if (characterManager.characterPath === this.currentCharacterPath) {
      return;
    }

    if (!this.headpatCursorStr) {
      const normalizedBigCursorPath = `${appPath}/assets/headpat-64x52.png`.replace(/\\/g, "/");
      const normalizedSmallCursorPath = `${appPath}/assets/headpat-31x25.png`.replace(/\\/g, "/");

      this.headpatCursorStr = `url(${normalizedBigCursorPath}) 32 26, url(${normalizedSmallCursorPath}) 16 13, auto`;
    }

    this.normalPath = characterManager.characterPath + '/normal.png';
    this.headpatingPath = characterManager.characterPath + '/headpating.png';

    const [normal, headpating] = await Promise.all([
      Assets.load(this.normalPath),
      Assets.load(this.headpatingPath)
    ]);

    this.normal = normal;
    this.headpating = headpating;
    this.sprite = Sprite.from(normal);

    this.container = new Container();
    this.container.addChild(this.sprite);

    this.sprite.anchor.set(0.5, 1);
    this.resize(app);
    this.currentCharacterPath = characterManager.characterPath;

    this.container.eventMode = 'static';
    this.container.on('pointerover', this.handleMouseOver);
    this.container.on('pointerout', this.handleMouseOut);

    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  destroy() {
    Promise.all([
      Assets.unload(this.normalPath),
      Assets.unload(this.headpatingPath),
    ]).then(() => {
      this.normal.destroy(true);
      this.headpating.destroy(true);

      this.container.removeChildren();
      this.container.cursor = 'default';
      this.container.off('pointerover', this.handleMouseOver);
      this.container.off('pointerout', this.handleMouseOut);
      this.container.removeAllListeners();
      this.container.eventMode = 'none';

      this.container.destroy({
        children: true,
        context: true,
        texture: true,
        style: true,
        textureSource: true,
      });
      this.sprite.destroy({
        children: true,
        context: true,
        texture: true,
        style: true,
        textureSource: true,
      });


      this.normal = null;
      this.headpating = null;
      this.container = null;
      this.sprite = null;
      this.currentCharacterPath = null;
      this.headpatingPath = null;
      this.normalPath = null;
      document.removeEventListener('mousedown', this.handleMouseDown);
      document.removeEventListener('mouseup', this.handleMouseUp);
    });
  }

  resize(app: Application) {
    let newWidth = app.renderer.width * 0.67;
    let newHeight = this.sprite.texture.height * (newWidth / this.sprite.texture.width);

    if ((newHeight / app.renderer.height) > 0.68) {
      newHeight = app.renderer.height * 0.68;
      newWidth = this.sprite.texture.width * (newHeight / this.sprite.texture.height);
    }

    this.sprite.width = newWidth;
    this.sprite.height = newHeight;
  }

  toggle(emotion: string) {
    this.sprite.texture = emotion === 'normal'
      ? this.normal
      : this.headpating;
  }

  private handleMouseDown() {
    this.isClicked = true;
    if (this.isMouseOver) {
      this.container.cursor = this.headpatCursorStr;
      this.sprite.texture = this.headpating;
    }
  }

  private handleMouseUp() {
    this.isClicked = false;
    this.container.cursor = 'default';
    this.sprite.texture = this.normal;
  }

  private handleMouseOver() {
    this.isMouseOver = true;

    if (this.isClicked) {
      this.container.cursor = this.headpatCursorStr;
      this.sprite.texture = this.headpating;
    }
  }

  private handleMouseOut() {
    this.isMouseOver = false;
    this.container.cursor = 'default';
    this.sprite.texture = this.normal;
  }
}

export default new Character();
