import { Application, Container, FederatedPointerEvent, Sprite } from "pixi.js";
import ScrollContainer from "../../../util/scrollable/scrollContainer";
import MainButton from "../../../mainButton";
import screenDrawer from "../../../../screenDrawer";
import overlay from "../overlay";

const heightFraction = 0.95;
const btnFraction = 0.7;

const overlayIdentifier = 'p';

class PauseMenu {
  public container: Container;
  private frame: Sprite;
  private scrollContainer: ScrollContainer;
  private onResume: VoidFunction;
  private resumeButton: MainButton;
  private exitButton: MainButton;
  private mainOptButtonContainers: Container[];

  private isVisible = false;

  loadContainer(app: Application, onResume: VoidFunction) {
    this.container = new Container();
    this.frame = Sprite.from('pause-menu');
    this.frame.anchor.set(0.5, 0.5);
    this.frame.eventMode = 'static';
    this.frame.on('pointerdown', this.preventPropagation);

    this.onResume = onResume;
    overlay.addOnClick(overlayIdentifier, this.onResume);
    this.resize(app);

    this.resumeButton = new MainButton();
    this.resumeButton.loadContainer(this.frame, btnFraction, 'RESUME', () => {
      this.setVisibility(false);
      this.onResume();
    });
    this.resumeButton.container.renderable = this.isVisible;

    this.exitButton = new MainButton();
    this.exitButton.loadContainer(this.frame, btnFraction, 'EXIT', () => {
      screenDrawer.drawDefined(0);
    });
    this.exitButton.container.renderable = this.isVisible;

    this.mainOptButtonContainers = [this.exitButton.container, this.resumeButton.container];

    this.scrollContainer = new ScrollContainer();
    this.scrollContainer.loadContainer(
      this.mainOptButtonContainers,
      this.frame.height * 0.86,
      this.frame.width * 0.88,
      0.09
    );
    this.scrollContainer.container.renderable = this.isVisible;
    this.scrollContainer.container.x = app.renderer.width * 0.5;
    this.scrollContainer.container.y = this.frame.y + (this.frame.height * 0.04);

    this.container.addChild(this.frame);
    this.container.addChild(this.scrollContainer.container);
  }

  destroy() {
    this.frame.eventMode = 'none';
    this.frame.removeAllListeners();
    this.frame.off('pointerdown', this.preventPropagation);
    this.frame.destroy({
      children: true,
      context: true,
      style: true,
    });

    this.scrollContainer.destroy();

    this.container.eventMode = 'none';
    this.container.removeAllListeners();
    this.container.removeChildren();
    this.container.destroy({
      children: true,
      context: true,
      texture: true,
      style: true,
      textureSource: true,
    })

    this.mainOptButtonContainers = null;

    this.resumeButton.destroy();
    this.exitButton.destroy();

    this.onResume = null;
    this.exitButton = null;
    this.resumeButton = null;
    this.scrollContainer = null;
    this.frame = null;
    this.container = null;
  }

  resize(app: Application) {
    this.frame.renderable = this.isVisible;
    this.frame.height = app.renderer.height * heightFraction;
    this.frame.width = this.frame.texture.width * (this.frame.height / this.frame.texture.height);

    this.frame.x = app.renderer.width * 0.5;
    this.frame.y = app.renderer.height * 0.5;

    this.resumeButton?.resize(this.frame, btnFraction);
    this.exitButton?.resize(this.frame, btnFraction);

    this.scrollContainer?.resize(this.frame.height * 0.86, this.frame.width * 0.88, this.mainOptButtonContainers, false);

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
    this.resumeButton.container.renderable = this.isVisible;
    this.exitButton.container.renderable = this.isVisible;
    this.scrollContainer.container.renderable = this.isVisible;
  }

  private preventPropagation(e: FederatedPointerEvent) {
    e.preventDefault();
  }
}

export default PauseMenu;
