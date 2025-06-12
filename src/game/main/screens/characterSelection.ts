import { appPath } from '../../constants';
import { Application } from "pixi.js";
import background from "../components/background";
import { AbstractScreen } from './abstractScreen';
import SelectionList from '../components/char-selection/selectionList';
import characterManager from '../context-holders/characterManager';
import screenDrawer from '../screenDrawer';
import BackButton from '../components/general/backButton';
import Text from '../components/util/text';

const titleText = 'SIMP TO YOUR FAVORITE';

export class CharacterSelectionScreen extends AbstractScreen {
  private selectionList: SelectionList;
  private backBtn: BackButton;
  private title: Text;

  constructor() {
    super();
  }

  resize(app: Application): void {
    background.resize(app);
    this.selectionList.resize(app);
    this.backBtn.resize(app);
    this.title.resize(app.renderer.width, 0.5, app.renderer.height, 0.06);
    this.positionWorld(app);
  }

  destroy(app: Application) {
    app.stage.removeChildren();
    background.destroy(false);
    this.selectionList.destroy();
    this.backBtn.destroy();
    this.title.destroy();

    this.selectionList = null;
    this.backBtn = null;
    this.title = null;
  }

  protected addToStage(app: Application): void {
    app.stage.addChild(background.sprite);
    app.stage.addChild(this.selectionList.container);
    app.stage.addChild(this.backBtn.container);
    app.stage.addChild(this.title.container);
  }

  protected async load(app: Application) {
    this.selectionList = new SelectionList();
    const promise = Promise.all([
      background.loadSprite(app, appPath + '/assets/background-blurred.png'),
      this.selectionList.loadList(app, this.handleCharacterSelect),
    ]);

    this.title = new Text();
    this.title.loadContainer(titleText, 0xEC10CA, app.renderer.width, 0.5, app.renderer.height, 0.06);

    this.backBtn = new BackButton();
    this.backBtn.loadContainer(app, 0);
    await promise;
  }

  protected positionWorld(app: Application) {
    const halfAppWidth = app.renderer.width * 0.5;

    background.sprite.x = halfAppWidth;
    background.sprite.y = app.renderer.height * 0.5;

    this.selectionList.container.x = halfAppWidth;
    this.selectionList.container.y = app.renderer.height - (this.selectionList.container.height * 0.53);

    this.backBtn.container.x = app.renderer.width * 0.01;
    this.backBtn.container.y = app.renderer.height * 0.03;

    this.title.container.x = halfAppWidth;
    this.title.container.y = this.backBtn.container.y + (this.title.container.height * 0.5) + (app.renderer.height * 0.08);
  }

  private handleCharacterSelect(name: string) {
    characterManager.select(name);
    screenDrawer.drawDefined(2);
  }
}
