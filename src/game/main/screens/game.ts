import { Application, Ticker } from "pixi.js";
import background from "../components/background";
import characterItemShelf from '../components/hud/character-items/characterItemShelf';
import character from '../components/character';
import CharacterItems from '../components/hud/character-items/characterItems';
import Box from '../components/hud/box';
import blackAndWhite from '../../shaders/blackAndWhite';
import storePts from '../../backend-driver/storePts';
import { VANNILA_GAME } from '../../../shared/pointsBelonging';
import { AbstractScreen } from './abstractScreen';
import IconButton from '../components/hud/iconButton';
import characterManager from '../context-holders/characterManager';
import PauseMenu from '../components/hud/menus/pause-menu/pauseMenu';
import overlay from "../components/hud/menus/overlay";
import HelpMenu from "../components/hud/menus/help-menu/helpMenu";

const pauseBtntargetFraction: number = 0.04;
const pauseBtnmaxHeightFraction: number = 0.05;

const helpBtntargetFraction: number = 0.03;
const helpBtnmaxHeightFraction: number = 0.04;

export class Game extends AbstractScreen {
  private pointsBox: Box;
  private pauseButton: IconButton;
  private helpButton: IconButton;
  private pauseMenu: PauseMenu;
  private helpMenu: HelpMenu;
  private ticker: Ticker;
  private animationTicker: Ticker;
  private lastSavedPts: number;
  private pointsSavingInterval: NodeJS.Timeout;
  private isPaused: boolean;

  private points: number = 0;
  private isMouseDown = false;
  private canIncPoints = false;

  constructor() {
    super();
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.savePts = this.savePts.bind(this);
    this.togglePaused = this.togglePaused.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);
  }

  resize(app: Application): void {
    background.resize(app);
    overlay.resize(app);
    characterItemShelf.resize(app);
    character.resize(app);
    this.pointsBox.resize(app, 0.28);
    this.pauseButton.resize(app);
    this.helpButton.resize(app);
    this.pauseMenu.resize(app);
    this.helpMenu.resize(app);
    this.positionWorld(app);
  }

  destroy(app: Application) {
    app.stage.removeChildren();
    characterItemShelf.destroy();
    character.destroy();
    background.destroy(true);

    this.pointsBox.destroy();
    this.pointsBox = null;

    clearInterval(this.pointsSavingInterval);
    this.pointsSavingInterval = null;

    this.ticker.destroy();
    this.animationTicker.destroy();
    this.pauseButton.destroy();
    this.helpButton.destroy();
    this.pauseMenu.destroy();

    overlay.destroy();

    this.pauseButton = null;
    this.helpButton = null;
    this.pauseMenu = null;
    this.ticker = null;
    this.animationTicker = null;
    this.canIncPoints = false;
    this.isMouseDown = false;

    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
  }

  protected addToStage(app: Application): void {
    app.stage.addChild(background.sprite);
    app.stage.addChild(character.container);
    app.stage.addChild(this.pointsBox.container);
    app.stage.addChild(characterItemShelf.shelfContainer);
    app.stage.addChild(this.pauseButton.container);
    app.stage.addChild(this.helpButton.container);
    app.stage.addChild(overlay.graphic);
    app.stage.addChild(this.pauseMenu.container);
    app.stage.addChild(this.helpMenu.container);
  }

  protected async load(app: Application) {
    this.isPaused = false;
    this.points = await this.getPts();
    this.lastSavedPts = -1;
    this.pointsBox = new Box();
    this.pointsBox.loadSprite(app, 'SIMP XP', this.points + '', 0.25);

    const characterItems = [];

    for (let index = 3; index >= 0; index--) {
      characterItems.push(new CharacterItems());
    }

    blackAndWhite.loadTempShader();

    await Promise.all([
      background.loadSprite(app, `${characterManager.characterPath}/background.png`, 2),
      characterItems[0].loadItem(app, 10, 5, `${characterManager.characterPath}/item10pts.png`, 'Z'),
      characterItems[1].loadItem(app, 20, 10, `${characterManager.characterPath}/item20pts.png`, 'X'),
      characterItems[2].loadItem(app, 30, 15, `${characterManager.characterPath}/item30pts.png`, 'O'),
      characterItems[3].loadItem(app, 40, 20, `${characterManager.characterPath}/item40pts.png`, 'P'),
      character.loadContainer(app),
    ]);

    blackAndWhite.destroyTempShader();

    overlay.loadOverlay(app);

    this.pauseMenu = new PauseMenu();
    this.pauseMenu.loadContainer(app, this.togglePaused);

    this.helpMenu = new HelpMenu();
    this.helpMenu.loadContainer(app, this.toggleHelp);

    this.pauseButton = new IconButton();
    this.pauseButton.loadContainer(
      app,
      this.togglePaused,
      'pause',
      pauseBtntargetFraction,
      pauseBtnmaxHeightFraction
    );

    this.helpButton = new IconButton();
    this.helpButton.loadContainer(
      app,
      this.toggleHelp,
      'help-btn',
      helpBtntargetFraction,
      helpBtnmaxHeightFraction
    );

    characterItemShelf.loadShelfConatainer(app, characterItems);
    this.startPointsSaveInterval();
    this.startTickers();
  }

  protected positionWorld(app: Application) {
    const halfWidthRender = app.renderer.width * 0.5;
    const halfHeightShelf = characterItemShelf.shelfContainer.height * 0.5

    background.sprite.x = halfWidthRender;
    background.sprite.y = app.renderer.height * 0.5;

    characterItemShelf.shelfContainer.x = halfWidthRender;
    characterItemShelf.shelfContainer.y = app.renderer.height - (halfHeightShelf);

    character.container.x = halfWidthRender;
    character.container.y = characterItemShelf.shelfContainer.y - (halfHeightShelf);

    this.pointsBox.container.x = (this.pointsBox.container.width * 0.5) + (app.renderer.width * 0.01);
    this.pointsBox.container.y = (this.pointsBox.container.height * 0.62);

    this.pauseButton.container.x = halfWidthRender;
    this.pauseButton.container.y = this.pauseButton.container.height * 0.62;

    this.helpButton.container.x = app.renderer.width - this.helpButton.container.width * 0.72;
    this.helpButton.container.y = this.helpButton.container.height * 0.62
  }

  private startPointsSaveInterval() {
    this.pointsSavingInterval = setInterval(this.savePts, 3000);
  }

  private startTickers() {
    this.ticker = new Ticker();
    this.animationTicker = new Ticker();
    const countPointsFrameTime = 1000 / 19;
    const showPointsFrameTime = 1000 / 4;
    let lastUpdate = Date.now();
    let animationLastUpdate = Date.now();
    this.animationTicker.maxFPS = 5;

    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);

    this.ticker.add(() => {
      const now = Date.now();

      if (now - lastUpdate >= countPointsFrameTime) {
        if (this.canIncPoints && character.isMouseOver) {
          this.points++;

          this.canIncPoints = false;
        }
        lastUpdate = now;
      }
    });

    this.animationTicker.add(() => {
      for (let i = characterItemShelf.characterItems.length - 1; i >= 0; i--) {
        characterItemShelf.characterItems[i].update();
      }
    });

    this.animationTicker.add(() => {
      const now = Date.now();

      if (now - animationLastUpdate >= showPointsFrameTime) {
        this.pointsBox.updateContent(this.points + '');
        animationLastUpdate = now;
      }
    });

    this.ticker.start();
    this.animationTicker.start();
  }

  private handleKeydown(event: KeyboardEvent) {
    if (this.isPaused) return;

    switch(event.key) {
      case 'Z':
      case 'z':
        if (characterItemShelf.characterItems[0].startCountdown()) {
          this.points += 10;
        }
        break;
      case 'X':
      case 'x':
        if (characterItemShelf.characterItems[1].startCountdown()) {
          this.points += 20;
        }
        break;
      case 'O':
      case 'o':
        if (characterItemShelf.characterItems[2].startCountdown()) {
          this.points += 30;
        }
        break;
      case 'P':
      case 'p':
        if(characterItemShelf.characterItems[3].startCountdown()) {
          this.points += 40;
        }
        break;
      default:
        return;
    }
  }

  private handleMouseDown() {
    this.isMouseDown = true;
  }

  private handleMouseUp() {
    this.isMouseDown = false;
  }

  private handleMouseMove() {
    if (this.isMouseDown) {
      this.canIncPoints = true;
    }
  }

  private togglePaused() {
    this.isPaused = !this.isPaused;
    this.pauseMenu.setVisibility(this.isPaused);

    if (this.isPaused) {
      this.ticker.stop();
    } else {
      this.ticker.start();
    }
  }

  private toggleHelp() {
    this.isPaused = !this.isPaused;
    this.helpMenu.setVisibility(this.isPaused);

    if (this.isPaused) {
      this.ticker.stop();
    } else {
      this.ticker.start();
    }
  }

  private savePts() {
    if (this.points === this.lastSavedPts) return;

    this.lastSavedPts = this.points;
    storePts.persistPts(this.points, VANNILA_GAME);
  }

  private async getPts(): Promise<number> {
    const pointsRegister = await storePts.getPts();
    return +pointsRegister.vanillaGame;
  }
}
