import { appPath } from '../constants';
import screenDrawer from './screenDrawer';
import { Application, Assets, TextureStyle,  } from 'pixi.js'
import { MenuScreen } from './screens/menu';
import { CharacterSelectionScreen } from './screens/characterSelection';
import { Game } from './screens/game';
import { Credits } from './screens/credits';

const app = new Application();

window.onload = async () => {
  await app.init({
    resizeTo: document.getElementById('game'),
    background: '#ffa1c4',
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
    roundPixels: false,
    textureGCCheckCountMax: 180,
  });

  TextureStyle.defaultOptions.scaleMode = 'linear';

  app.canvas.style.position = 'absolute';
  app.ticker.maxFPS = 20;

  await Assets.load([
    { alias: 'normal-btn', src: appPath + '/assets/normal-button.png' },
    { alias: 'clicked-btn', src: appPath + '/assets/clicked-button.png' },
    { alias: 'item-shelf',  src: appPath + '/assets/shelf.png' },
    { alias: 'box-ui',  src: appPath + '/assets/box.png' },
    { alias: 'frame-ui', src: appPath + '/assets/frame.png' },
    { alias: 'arrow', src: appPath + '/assets/arrow.png' },
    { alias: 'pause', src: appPath + '/assets/pause.png' },
    { alias: 'pause-menu', src: appPath + '/assets/pause-menu.png' },
    { alias: 'back-btn', src: appPath + '/assets/back-button.png' },
    { alias: 'Z',  src: appPath + '/assets/Z.png' },
    { alias: 'X',  src: appPath + '/assets/X.png' },
    { alias: 'O',  src: appPath + '/assets/O.png' },
    { alias: 'P',  src: appPath + '/assets/P.png' },
    { alias: 'help-btn',  src: appPath + '/assets/help-btn.png' },
    { alias: 'help',  src: appPath + '/assets/help.png' },
    { alias: 'guidance',  src: appPath + '/assets/guidance.png' },
  ]);

  document.getElementById('game').appendChild(app.canvas);
  screenDrawer.defineScreens(app, [
    new MenuScreen(),
    new CharacterSelectionScreen(),
    new Game(),
    new Credits(),
  ]);
  screenDrawer.drawDefined(0);
}

window.addEventListener('resize', () => {
  app.resizeTo = document.getElementById('game');
  screenDrawer.resizeCurrent(app);
});
