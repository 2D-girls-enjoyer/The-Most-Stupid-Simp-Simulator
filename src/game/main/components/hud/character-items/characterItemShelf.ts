import { Application, Container, Sprite } from "pixi.js";
import CharacterItems from "./characterItems";

class CharacterItemsShelf {
  public shelfContainer: Container;
  public characterItems: CharacterItems[] = [];

  loadShelfConatainer(app: Application, items: CharacterItems[]) {
    this.shelfContainer = new Container();
    const itemShelf = Sprite.from('item-shelf');

    itemShelf.anchor.set(0.5, 0.5);
    this.shelfContainer.addChild(itemShelf);

    const itemContainer = new Container();

    for (let i = 0; i < items.length; i++) {
      itemContainer.addChild(items[i].container);
    }

    this.characterItems = items;
    this.shelfContainer.addChild(itemContainer);
    this.resize(app);
  }

  destroy() {
    (this.shelfContainer.getChildAt(0) as Sprite).destroy({ children: true });
    this.shelfContainer.removeChildren();

    for (let i = 0; i < this.characterItems.length; i++) {
      this.characterItems[i].destroy();
    }

    this.characterItems = [];
    this.shelfContainer = null;
  }

  resize(app: Application) {
    const shelf = (this.shelfContainer.getChildAt(0) as Sprite);
    let newWidth = app.renderer.width * 0.989;
    let newHeight = (shelf.texture.height / shelf.texture.width) * newWidth;

    if ((newHeight / app.renderer.height) > 0.25) {
      newHeight = app.renderer.height * 0.25;
      newWidth = (shelf.texture.width / shelf.texture.height) * newHeight;
    }

    shelf.width = newWidth;
    shelf.height = newHeight;

    const defaultHeight = -(shelf.height * 0.015);
    const defaultSpacing = shelf.width * 0.02;

    this.characterItems[0].resize(shelf);

    let lastItemHalfWidth = this.characterItems[0].container.width * 0.5;
    this.characterItems[0].container.y = defaultHeight;
    this.characterItems[0].container.x = 0;

    let lastItemX = this.characterItems[0].container.x;

    for (let i = 1; i < this.characterItems.length; i++) {
      this.characterItems[i].resize(shelf);
      this.characterItems[i].container.y = defaultHeight;
      this.characterItems[i].container.x = lastItemX + defaultSpacing + lastItemHalfWidth + (this.characterItems[i].container.width * 0.5);

      lastItemX = this.characterItems[i].container.x;
      lastItemHalfWidth = this.characterItems[i].container.width * 0.5;
    }

    const itemsContainer = (this.shelfContainer.getChildAt(1) as Container);
    itemsContainer.x = -(itemsContainer.width * 0.5) + (shelf.width * 0.033) ;
  }
}

export default new CharacterItemsShelf();
