import { Application, Container, FederatedPointerEvent, Sprite } from "pixi.js";
import MainButton from "../../../mainButton";
import ScrollContainer from "../../../util/scrollable/scrollContainer";
import overlay from "../overlay";

const heightFraction = 0.98;
const btnFraction = 0.5;

const overlayIdentifier = 'h';

class HelpMenu {
  public container: Container;
  private frame: Sprite;
  private scrollContainer: ScrollContainer;
  private onResume: VoidFunction;
  private closeButton: MainButton;
  private guidanceSprite: Sprite;

  private scrollContents: Container[];

  private isVisible = false;

  loadContainer(app: Application, onResume: VoidFunction) {
    this.container = new Container();
    this.frame = Sprite.from('help');
    this.frame.anchor.set(0.5, 0.5);
    this.frame.eventMode = 'static';
    this.frame.on('pointerdown', this.preventPropagation);

    this.guidanceSprite = Sprite.from('guidance');
    this.guidanceSprite.anchor.set(0.5, 0.5);

    this.onResume = onResume;
    overlay.addOnClick(overlayIdentifier, this.onResume);
    this.resize(app);

    this.closeButton = new MainButton();
    this.closeButton.loadContainer(this.frame, btnFraction, 'CLOSE', () => {
      this.setVisibility(false);
      this.onResume();
    });
    this.closeButton.container.renderable = this.isVisible;

    this.scrollContents = [this.closeButton.container, (this.guidanceSprite as Container)];

    this.scrollContainer = new ScrollContainer();
    this.scrollContainer.loadContainer(
      this.scrollContents,
      this.frame.height * 0.73,
      this.frame.width * 0.92,
      0.2
    );
    this.scrollContainer.container.renderable = this.isVisible;
    this.scrollContainer.container.x = app.renderer.width * 0.5;
    this.scrollContainer.container.y = this.frame.y + (this.frame.height * 0.04);

    this.container.addChild(this.frame);
    this.container.addChild(this.scrollContainer.container);
  }

  resize(app: Application) {
    this.frame.renderable = this.isVisible;

    let newFrameHeight = app.renderer.height * heightFraction;
    let newFrameWidth = this.frame.texture.width * (newFrameHeight / this.frame.texture.height);

    if (newFrameWidth > app.renderer.width * 0.91) {
      newFrameWidth = app.renderer.width * 0.91;
      newFrameHeight = this.frame.texture.height * (newFrameWidth / this.frame.texture.width);
    }

    this.frame.height = newFrameHeight;
    this.frame.width = newFrameWidth;

    this.frame.x = app.renderer.width * 0.5;
    this.frame.y = app.renderer.height * 0.5;

    this.guidanceSprite.width = this.frame.width * 0.81;
    this.guidanceSprite.height = (this.guidanceSprite.texture.height * this.guidanceSprite.width) / this.guidanceSprite.texture.width;

    this.closeButton?.resize(this.frame, btnFraction);

    this.scrollContainer?.resize(
      this.frame.height * 0.73,
      this.frame.width * 0.92,
      this.scrollContents,
      false
    );

    if (this.scrollContainer) {
      this.scrollContainer.container.x = app.renderer.width * 0.5;
      this.scrollContainer.container.y = this.frame.y + (this.frame.height * 0.04);
    }
  }

  setVisibility(visible: boolean) {
    this.isVisible = visible;

    if (this.isVisible) {
      overlay.setVisible(overlayIdentifier);
    } else {
      overlay.setInvisible();
    }

    this.frame.renderable = this.isVisible;
    this.closeButton.container.renderable = this.isVisible;
    this.scrollContainer.container.renderable = this.isVisible;
  }

  private preventPropagation(e: FederatedPointerEvent) {
    e.preventDefault();
  }
}

export default HelpMenu;
