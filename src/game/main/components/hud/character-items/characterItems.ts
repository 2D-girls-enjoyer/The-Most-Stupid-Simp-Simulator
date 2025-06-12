import { Application, Assets, BitmapText, Container, RenderTexture, Sprite, Texture } from "pixi.js";
import blackAndWhite from "../../../../shaders/blackAndWhite"

class CharacterItems {
  public container: Container;
  private originalTime: number;
  private isCoutingDown = false;
  private startTime = 0;
  private lastDisplayedTime: number;
  private normalTexture: Texture;
  private bwTexture: Texture;

  private itemSprite: Sprite;
  private pointsText: BitmapText;
  private cooldownText: BitmapText;
  private keyboardKeySprite: Sprite;
  private itemPath: string;
  private widthByHeightAspect: number;
  private heightByWidthAspect: number;

  async loadItem(
    app: Application,
    points: number,
    cooldown: number,
    itemPath: string,
    keyboardKey: string,
  ) {
    this.itemPath = itemPath;
    const texture = Assets.load(this.itemPath);

    this.container = new Container();
    this.pointsText = new BitmapText({
      text: `${points} PTS`,
      style: {
        fontFamily: "ArialBitmap",
        fontSize: 98,
        fill: 0xffffff,
      }
    });
    this.cooldownText = new BitmapText({
      text: `CD: ${cooldown} SEC`,
      style: {
        fontFamily: "ArialBitmap",
        fontSize: 98,
        fill: 0xffffff,
      }
    });
    this.keyboardKeySprite = Sprite.from(keyboardKey);

    const resolvedTexture = await texture;
    this.itemSprite = Sprite.from(resolvedTexture);
    const tempSprite = Sprite.from(resolvedTexture);
    tempSprite.eventMode = 'none';
    const rendererTexture = RenderTexture.create({ width: tempSprite.width, height: tempSprite.height });

    tempSprite.filters = [blackAndWhite.shader];

    app.renderer.render({
      container: tempSprite,
      target: rendererTexture
    });

    this.container.addChild(this.itemSprite);
    this.container.addChild(this.pointsText);
    this.container.addChild(this.cooldownText);
    this.container.addChild(this.keyboardKeySprite);

    this.itemSprite .anchor.set(0.5, 0.5);
    this.pointsText.anchor.set(0.5, 0);
    this.cooldownText.anchor.set(0.5, 1);
    this.keyboardKeySprite.anchor.set(1, 0.5);

    this.container = this.container;
    this.originalTime = cooldown;

    this.bwTexture = rendererTexture;
    this.normalTexture = resolvedTexture;

    tempSprite.filters = null;
    tempSprite.texture = null;
    tempSprite.destroy({
      children: true,
      context: true,
      style: true,
    });

    this.widthByHeightAspect = this.itemSprite.texture.width / this.itemSprite.texture.height;
    this.heightByWidthAspect = this.itemSprite.texture.height / this.itemSprite.texture.width;
  }

  destroy() {
    Assets.unload(this.itemPath).then(() => {
      this.bwTexture.destroy(true);
      this.normalTexture.destroy(true);
      this.bwTexture = null;
      this.normalTexture = null;

      this.itemSprite.destroy({
        children: true,
        context: true,
        style: true,
      });
      this.cooldownText.destroy({
        children: true,
        context: true,
      });
      this.pointsText.destroy({
        children: true,
        context: true,
      });

      this.keyboardKeySprite.destroy({
        children: true,
        context: true,
      });

      this.container.removeChildren();
      this.container.destroy({
        children: true,
        context: true,
        style: true,
        texture: true,
        textureSource: true,
      });

      this.itemSprite = null;
      this.cooldownText = null;
      this.pointsText = null;
      this.keyboardKeySprite = null;
      this.container = null;
      this.itemPath = null;
    });
  }

  resize(itemShelf: Sprite) {
    let newWidth = itemShelf.width * 0.178;
    let newHeight = newWidth * this.heightByWidthAspect;

    if ((newHeight / itemShelf.height) > 0.48) {
      newHeight = itemShelf.height * 0.48;
      newWidth = newHeight * this.widthByHeightAspect;
    }

    this.itemSprite.width = newWidth;
    this.itemSprite.height = newHeight;

    this.pointsText.scale.set(1);
    const scaleByHeightPointText = (itemShelf.height * 0.13) / this.pointsText.height;
    this.pointsText.scale.set(Math.min(scaleByHeightPointText, 1));

    this.cooldownText.scale.set(1);
    const scaleByHeightCooldownText = (itemShelf.height * 0.09) / this.cooldownText.height;
    this.cooldownText.scale.set(Math.min(scaleByHeightCooldownText, 1));

    const itemHalfHeight = this.itemSprite.height * 0.5;
    this.pointsText.y = this.itemSprite.y + (itemShelf.height * 0.01) + itemHalfHeight;
    this.cooldownText.y = this.itemSprite.y - (itemShelf.height * 0.017) - itemHalfHeight;

    this.keyboardKeySprite.width = itemShelf.width * 0.032;
    this.keyboardKeySprite.height = this.keyboardKeySprite.width;
    this.keyboardKeySprite.y = this.itemSprite.y;
    this.keyboardKeySprite.x = -((this.itemSprite.width * 0.5) + (this.itemSprite.width * 0.002));

    this.pointsText.updateCacheTexture();
  }

  startCountdown(): boolean {
    if (this.isCoutingDown) {
      return false;
    }

    this.startTime = Date.now();
    this.isCoutingDown = true;

    this.itemSprite.texture = this.bwTexture;

    return true;
  }

  update() {
    if (!this.isCoutingDown) return;

    const remaining = Math.max(0, this.originalTime - ((Date.now() - this.startTime) * 0.001));
    const displayedTime = remaining >> 0;

    if (displayedTime !== this.lastDisplayedTime) {
      this.cooldownText.text  = `CD: ${displayedTime} SEC`;
      this.lastDisplayedTime = displayedTime;
    }

    if (remaining <= 0) this.reset();
  }

  private reset() {
    this.isCoutingDown = false;
    this.cooldownText.text =  `CD: ${this.originalTime} SEC`;
    this.itemSprite.texture = this.normalTexture;
  }
}

export default CharacterItems;
