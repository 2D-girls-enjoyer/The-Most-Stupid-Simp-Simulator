import fs from 'fs';
import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import path from 'path';
import { CLOSE, ENTER_FULL_SCREEN, GET_APP_PATH, GET_AUTHOR, GET_CHARS, GET_PTS, LEAVE_FULL_SCREEN, MAXIMIZE, MINIMIZE, OPEN_DONATION, SAVE_PTS, SET_FULL_SCREEN } from './ipcEvents';
import { VANNILA_GAME } from '../shared/pointsBelonging';
import { IPointRegister } from '../shared/types/pointsRegister';
import { getAllCharactersName, getCharAuthor, readJson, saveJson } from './services';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const gotTheLock = app.requestSingleInstanceLock();
const pointsRegisterPath = path.join(app.getPath('userData'), 'points.json.gz');

let mainWindow: BrowserWindow;
let pointsRegister: IPointRegister = {
  vanillaGame: '0',
};

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  if (require('electron-squirrel-startup')) {
    app.quit();
  }

  const initPointsRegister = () => {
    if (!fs.existsSync(pointsRegisterPath)) {
      saveJson(pointsRegister, pointsRegisterPath);
    } else {
      pointsRegister = readJson(pointsRegisterPath);
    }
  }

  const registerWindowIpc = (mainWindow: BrowserWindow) => {
    ipcMain.on(CLOSE, () => {
      mainWindow?.close();
    });
    ipcMain.on(MAXIMIZE, () => {
      if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow?.maximize();
      }
    });
    ipcMain.on(MINIMIZE, () => {
      mainWindow?.minimize();
    });
    ipcMain.on(SET_FULL_SCREEN, (_, fullscreen) => {
      mainWindow.setFullScreen(fullscreen);
    });
    ipcMain.on(OPEN_DONATION, () => {
      shell.openExternal('https://ko-fi.com/2dgirlenjoyer')
    })
    ipcMain.handle(GET_APP_PATH, () => {
      return path.dirname(app.getAppPath());
    });
    ipcMain.on(SAVE_PTS, (_, points, belongTo) => {
      switch(belongTo) {
        case VANNILA_GAME: {
          pointsRegister.vanillaGame = points;
          saveJson(pointsRegister, pointsRegisterPath);
          break;
        }

        default: {
          return;
        }
      }
    });
    ipcMain.handle(GET_PTS, () => {
      return pointsRegister;
    });
    ipcMain.handle(GET_CHARS, async () => {
      return getAllCharactersName();
    });
    ipcMain.handle(GET_AUTHOR, async (_, charName) => {
      return getCharAuthor(charName);
    });
  }

  const createWindow = (): void => {
    const {
      x, y, width, height,
    } = screen.getPrimaryDisplay().workArea;
    mainWindow = new BrowserWindow({
      icon: path.join('./icons/icon.png'),
      x: x + Math.floor(width * 0.07),
      y: y + Math.floor(height * 0.09),
      width: 600,
      height: 600,
      minWidth: 500,
      minHeight: 500,
      frame: false,
      backgroundColor: '#000000',
      webPreferences: {
        devTools: false,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        contextIsolation: true,
        nodeIntegration: false,
        webviewTag: true,
        backgroundThrottling: true,
        spellcheck: false,
        experimentalFeatures: false,
        enableWebSQL: false,
        disableBlinkFeatures: 'CSS3DTransforms, SpeechSynthesis, WebRTC, IdleDetection, Notifications, EncryptedMedia, Clipboard, WebAnimations, FontDisplay, PictureInPicture, Gamepad, WebXR, MediaSession, PaymentRequest, TextFragment, CacheStorage, ClipboardRead, DragAndDrop, LegacyInputMode, TextEncoderStream, IndexedDB, SessionStorage, LocalStorage, WebSockets, HTTP2Push, DeviceOrientation, AmbientLightSensor, Geolocation, WebAssembly, Autofill, FormValidation, NotificationTriggers'
      },
    });
    mainWindow.on('enter-full-screen', () => mainWindow.webContents.send(ENTER_FULL_SCREEN));
    mainWindow.on('leave-full-screen', () => mainWindow.webContents.send(LEAVE_FULL_SCREEN));

    initPointsRegister()
    registerWindowIpc(mainWindow);

    app.commandLine.appendSwitch('disable-gpu-compositing');
    app.commandLine.appendSwitch('enable-zero-copy');

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    //mainWindow.webContents.openDevTools();
  };

  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
