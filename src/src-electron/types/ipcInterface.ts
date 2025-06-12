import { IPointRegister } from "../../shared/types/pointsRegister";

export interface IIpcInterface {
  setWindowMaximize(): void;
  setWindowMinimize(): void;
  setWindowClose(): void;
  onLeaveFullScreen(cb: () => void): void
  onEnterFullScreen(cb: () => void): void
  setFullScreen(value: boolean): void
  getAppPath(): Promise<string>;
  openKofi(): void;
  savePoint(points: string, belongTo: string): void;
  getPoints(): Promise<IPointRegister>;
  getCharaNames(): Promise<string[]>;
  getCharAuthor(charName: string): Promise<string>;
}
