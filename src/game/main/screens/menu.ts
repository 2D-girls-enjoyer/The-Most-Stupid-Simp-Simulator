import { appPath } from '../../constants';
import { Application, Container } from "pixi.js";
import background from "../components/background";
import mainButton from '../components/mainButton';
import logo from '../components/general/logo';
import screenDrawer from '../screenDrawer';
import donationPlz from '../components/general/donationPlz';
import { AbstractScreen } from './abstractScreen';
import MainButton from '../components/mainButton';

const btnFraction = 0.28;
const logoPSize = 0.48;

export class MenuScreen extends AbstractScreen {
  private btnContainer: Container;
  private btnPlay: MainButton;
  private btnCredits: MainButton;

  resize(app: Application) {
    background.resize(app);
    this.btnPlay.resize(app.renderer, btnFraction);
    this.btnCredits.resize(app.renderer, btnFraction);

    logo.resize(app, logoPSize);
    donationPlz.resize(app);

    this.positionWorld(app);
  }

  destroy(app: Application) {
    app.stage.removeChildren();

    logo.destroy();

    this.btnPlay.destroy();
    this.btnCredits.destroy();

    this.btnContainer.removeChildren();
    this.btnContainer.destroy({
      children: true,
      context: true,
      style: true,
      texture: true,
      textureSource: true,
    });
    background.destroy(false);
    donationPlz.destroy();

    this.btnContainer = null;
    this.btnPlay = null;
    this.btnCredits = null;
  }

  protected addToStage(app: Application): void {
    app.stage.addChild(background.sprite);
    app.stage.addChild(logo.sprite);
    app.stage.addChild(this.btnContainer);
    app.stage.addChild(donationPlz.sprite);
  }

  protected async load(app: Application) {
    await Promise.all([
      background.loadSprite(app, appPath + '/assets/background.png'),
      logo.loadSprite(app, logoPSize),
      donationPlz.loadSprites(app),
    ]);

    this.btnContainer = new Container();
    this.btnPlay = new MainButton();
    this.btnCredits = new MainButton();

    this.btnPlay.loadContainer(app.renderer, btnFraction, 'PLAY', () => {
      screenDrawer.drawDefined(1);
    });
    this.btnCredits.loadContainer(app.renderer, btnFraction, 'CREDITS', () => {
      screenDrawer.drawDefined(3);
    });

    this.btnContainer.addChild(this.btnPlay.container);
    this.btnContainer.addChild(this.btnCredits.container);
  }

  protected positionWorld(app: Application) {
    // background adjustments
    background.sprite.x = app.renderer.width * 0.5;
    background.sprite.y = app.renderer.height * 0.5;

    // logo adjustments
    logo.sprite.x = logo.sprite.width * 0.5 + (app.renderer.width * 0.03);
    logo.sprite.y = logo.sprite.height * 0.5 + (app.renderer.height * 0.02);

    // button math adjustments
    this.btnContainer.pivot.y = 0;
    this.btnContainer.x = (this.btnContainer.width * 0.5) + (app.renderer.width * 0.08);
    this.btnContainer.y = logo.sprite.y + (logo.sprite.height * 0.5) + (app.renderer.height * 0.15);

    this.btnCredits.container.y = this.btnPlay.container.y
    + this.btnPlay.container.height
    + (app.renderer.height * 0.016);

    donationPlz.sprite.x = app.renderer.width - (donationPlz.sprite.width * 0.5) - (app.renderer.width * 0.02);
    donationPlz.sprite.y = app.renderer.height - (donationPlz.sprite.height * 0.5) - (app.renderer.width * 0.02);
  }
}
