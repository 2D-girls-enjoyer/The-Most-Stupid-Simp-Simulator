import { ipcRenderer, contextBridge } from 'electron';
import { CLOSE, ENTER_FULL_SCREEN, GET_APP_PATH, GET_AUTHOR, GET_CHARS, GET_PTS, LEAVE_FULL_SCREEN, MAXIMIZE, MINIMIZE, OPEN_DONATION, SAVE_PTS, SET_FULL_SCREEN } from './ipcEvents';
import { IIpcInterface } from './types/ipcInterface';
import { path } from 'pixi.js';

contextBridge.exposeInMainWorld('app', {
  setWindowMaximize() {
    ipcRenderer.send(MAXIMIZE);
  },
  setWindowClose() {
    ipcRenderer.send(CLOSE);
  },
  setWindowMinimize() {
    ipcRenderer.send(MINIMIZE);
  },
  onEnterFullScreen(cb) {
    ipcRenderer.on(ENTER_FULL_SCREEN, () => cb())
  },
  onLeaveFullScreen(cb) {
    ipcRenderer.on(LEAVE_FULL_SCREEN, () =>  cb())
  },
  setFullScreen(value) {
    ipcRenderer.send(SET_FULL_SCREEN, value)
  },
  async getAppPath() {
    return await ipcRenderer.invoke(GET_APP_PATH);
  },
  openKofi() {
    ipcRenderer.send(OPEN_DONATION);
  },
  savePoint(points: string, belongTo: string) {
    return ipcRenderer.send(SAVE_PTS, points, belongTo)
  },
  async getPoints() {
    return await ipcRenderer.invoke(GET_PTS);
  },
  async getCharaNames() {
    return await ipcRenderer.invoke(GET_CHARS);
  },
  async getCharAuthor(charName) {
    return await ipcRenderer.invoke(GET_AUTHOR, charName);
  },

} as IIpcInterface);
