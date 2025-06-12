import { IPointRegister } from "../../shared/types/pointsRegister";

function persistPts(pts: number, belongTo: string): void {
  window.app.savePoint(pts + '', belongTo);
}

async function getPts(): Promise<IPointRegister> {
  return await window.app.getPoints();
}

export default {
  persistPts,
  getPts
}
