import { appPath } from "../../constants";

class CharacterManager {
  public characterPath: string;

  public select(character: string) {
    this.characterPath = appPath + `/characters/${character}`
  }
}

export default new CharacterManager();
