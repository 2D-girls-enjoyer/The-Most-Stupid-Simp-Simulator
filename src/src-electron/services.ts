import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { IPointRegister } from '../shared/types/pointsRegister';
import zlib from 'zlib';

export function saveJson(pointsRegister: IPointRegister, pointsRegisterPath: string) {
  const jsonString = JSON.stringify(pointsRegister);

  zlib.gzip(jsonString, { level: 4 }, (err, compressedData) => {
    if (err) {
      return;
    }

    fs.writeFile(pointsRegisterPath, compressedData, (err) => {
      if (err) {
        throw new Error('Error saving compressed file:' + err);
      }
    });
  });
}

export function readJson(pointsRegisterPath: string): IPointRegister {
  try {
    const compressedData = fs.readFileSync(pointsRegisterPath);
    const decompressedBuffer = zlib.gunzipSync(compressedData);
    return JSON.parse(decompressedBuffer.toString('utf8'));
  } catch (err) {
    throw new Error(
      'Error reading compressed file.\n\nᗜˬᗜ ᗜˬᗜ ᗜˬᗜ ᗜˬᗜ ᗜˬᗜ ᗜˬᗜ-> HAVE YOU TRIED TO CHEAT AND CHANGE POINTS MANUALLY????????? WELL, YOU MESSED UP!!!!!ᗜˬᗜ ᗜˬᗜ ᗜˬᗜ ᗜˬᗜ ᗜˬᗜ ᗜˬᗜ ᗜˬᗜ\n\n Error: ' + err
    );
  }
}

export async function getAllCharactersName(): Promise<string[]> {
  const names: string[] = [];
  try {
    const files = await fs.promises.readdir(`${path.dirname(app.getAppPath())}/characters`, { withFileTypes: true });

    for (let i = files.length - 1; i >= 0; i--) {
      if (files[i].isDirectory) names.push(files[i].name);
    }
  } catch (err) {
    console.error('Error reading directory:', err);
  }

  return names;
}

export async function getCharAuthor(charName: string) {
  const author = await fs.promises.readFile(
    `${path.dirname(app.getAppPath())}/characters/${charName}/author.txt`,
     { encoding: 'utf-8' }
    );
  return author.trim();
}
