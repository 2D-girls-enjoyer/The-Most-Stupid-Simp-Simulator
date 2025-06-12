import { Application, Container } from "pixi.js";
import SelectionFrame from "./selectionFrame";
import characterNameList from "../../../backend-driver/characterNameList";
import ScrollContainer from "../util/scrollable/scrollContainer";

const selectionFrameFractionSize = 0.9;
const scrollFractionSizeHeight = 0.7;
const scrollFractionSizeWidth = 0.99;


class SelectionList {
  private scrollContainer: ScrollContainer;
  private selectionFrames: SelectionFrame[];
  private selectionFramesContainers: Container[] = [];

  get container() {
    return this.scrollContainer.container;
  }

  async loadList(app: Application, onItemSelected: (name: string) => void) {
    const charactersName = await characterNameList.getCharaNameList();
    const promises: Promise<SelectionFrame>[] = [];

    for (let i = charactersName.length - 1; i >= 0; i--) {
      promises.push(new SelectionFrame().loadSprite(
        app,
        charactersName[i],
        selectionFrameFractionSize,
        onItemSelected,
      ));
    }

    this.scrollContainer = new ScrollContainer();
    this.selectionFrames = await Promise.all(promises);

    for (let i = 0; i < this.selectionFrames.length; i++) {
      this.selectionFramesContainers.push(this.selectionFrames[i].container);
    }

    this.scrollContainer.loadContainer(
      this.selectionFramesContainers,
      app.renderer.height * scrollFractionSizeHeight,
      app.renderer.width * scrollFractionSizeWidth
    );
  }

  resize(app: Application) {
    this.selectionFrames.forEach(item => item.resize(app, selectionFrameFractionSize));
    this.scrollContainer.resize(
      app.renderer.height * scrollFractionSizeHeight,
      app.renderer.width * scrollFractionSizeWidth,
      this.selectionFramesContainers,
      false
    );
  }

  destroy() {
    this.selectionFrames.forEach(selectionFrame => selectionFrame.destroy());
    this.selectionFramesContainers = [];
    this.selectionFrames = [];
    this.scrollContainer.destroy();
    this.scrollContainer = null;
  }
}

export default SelectionList;