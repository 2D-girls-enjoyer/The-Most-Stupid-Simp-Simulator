import { appPath } from '../../constants';
import { Application, Container } from "pixi.js";
import { AbstractScreen } from "./abstractScreen";
import ScrollContainer from "../components/util/scrollable/scrollContainer";
import Text from "../components/util/text";
import background from "../components/background";
import BackButton from '../components/general/backButton';

const txtColor = 0xEC10CA;

export class Credits extends AbstractScreen {
  private backBtn: BackButton;
  private scrollContainer: ScrollContainer;

  private sutemoCreditTxt: Text;
  private micaTeamCreditTxt: Text;
  private creditsContainers: Container[];

  public resize(app: Application): void {
    background.resize(app);
    this.backBtn.resize(app);
    this.scrollContainer.resize(
      app.renderer.height * 0.7,
      app.renderer.width * 0.99,
      this.creditsContainers,
      false,
    );
    this.positionWorld(app);
  }

  public destroy(app: Application): void {
    app.stage.removeChildren();
    background.destroy(true);
    this.backBtn.destroy();
    this.scrollContainer.destroy();
    this.sutemoCreditTxt.destroy();
    this.micaTeamCreditTxt.destroy();

    this.backBtn = null;
    this.scrollContainer = null;
    this.sutemoCreditTxt = null;
    this.micaTeamCreditTxt = null;
    this.creditsContainers = [];
  }

  protected async load(app: Application): Promise<void> {
    await background.loadSprite(app, appPath + '/assets/background-blurred.png');
    this.scrollContainer = new ScrollContainer();
    this.sutemoCreditTxt = new Text();
    this.micaTeamCreditTxt = new Text();
    this.backBtn = new BackButton();

    this.backBtn.loadContainer(app, 0);

    this.sutemoCreditTxt.loadContainer(
      'GIRLFAILURE & MOMMY by sutemo',
      txtColor,
      app.renderer.width,
      0.4,
      app.renderer.height,
      0.08
    );
    this.micaTeamCreditTxt.loadContainer(
      'Florence by MICA Team',
      txtColor,
      app.renderer.width,
      0.3,
      app.renderer.height,
      0.08
    );

    this.creditsContainers = [];
    this.creditsContainers.push(
      this.sutemoCreditTxt.container,
      this.micaTeamCreditTxt.container,
    );

    this.scrollContainer.loadContainer(this.creditsContainers, app.renderer.height * 0.7,
      app.renderer.width * 0.99);
  }
  protected positionWorld(app: Application): void {
    const halfAppWidth = app.renderer.width * 0.5;
    background.sprite.x = halfAppWidth;
    background.sprite.y = app.renderer.height * 0.5;

    this.backBtn.container.x = app.renderer.width * 0.01;
    this.backBtn.container.y = app.renderer.height * 0.03;

    this.scrollContainer.container.x = halfAppWidth;
    this.scrollContainer.container.y = app.renderer.height - (this.scrollContainer.container.height * 0.53);
  }
  protected addToStage(app: Application): void {
    app.stage.addChild(background.sprite);
    app.stage.addChild(this.backBtn.container);
    app.stage.addChild(this.scrollContainer.container);
  }

}
