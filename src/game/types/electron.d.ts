import { IIpcInterface } from '../../src-electron/types/ipcInterface';

declare global {
  interface Window {
    app: IIpcInterface
  }
}
