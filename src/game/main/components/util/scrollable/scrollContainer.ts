import { Container, FederatedWheelEvent, Graphics, Ticker } from "pixi.js";
import ScrollBar from "./scrollBar";

const scrollAmount = 30;

class ScrollContainer {
  public container: Container;
  private scrollableContainer: Container;
  private wrapper: Container;
  private scrollBar: ScrollBar;
  private mask: Graphics;
  private minScrollY: number;
  private ticker: Ticker;
  private visibleHeight: number;
  private maxScrollBarWidthFraction: number;
  private targetScrollY = 0;
  private maxScrollY = 0;
  private totalHeight = 0;
  private currentScrollY = 0;


  constructor() {
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMoveBottomScroll = this.handleMoveBottomScroll.bind(this);
    this.handleMoveTopScroll = this.handleMoveTopScroll.bind(this);
  }

  loadContainer(
    items: Container[],
    height: number,
    width: number,
    maxScrollBarWidthFraction = 0.031,
  ) {
    this.scrollableContainer = new Container();
    this.scrollBar = new ScrollBar();
    this.container = new Container();
    this.mask = new Graphics();
    this.wrapper = new Container();
    this.visibleHeight = height;
    this.maxScrollBarWidthFraction = maxScrollBarWidthFraction;

    this.fillScrollableContainer(items);

    this.wrapper.addChild(this.scrollableContainer);
    this.wrapper.addChild(this.mask);
    this.scrollableContainer.mask = this.mask

    this.resizeScrollContainerMask(width, height);
    this.scrollBar.loadBar(
      height,
      this.calcScrollBarWidth(width),
      this.totalHeight,
      this.handleMoveTopScroll,
      this.handleMoveBottomScroll);

    this.container.addChild(this.wrapper);
    this.container.addChild(this.scrollBar.container);

    this.scrollableContainer.eventMode = 'static';
    this.scrollableContainer.on('wheel', this.handleWheel);
    this.initAnimationTicker();
    this.resize(height, width, items, true);
  }

  resize(height: number, width: number, items: Container[], skipScrollableReloadAdjustment: boolean) {
    if (!skipScrollableReloadAdjustment) {
      this.visibleHeight = height;
      this.scrollableContainer.removeChildren();
      this.fillScrollableContainer(items);
      this.resizeScrollContainerMask(width, height);
    }

    this.minScrollY = this.visibleHeight - this.totalHeight - (this.visibleHeight * 0.08);

    if (this.totalHeight > this.visibleHeight) {
      if (!this.ticker?.started) {
        this.ticker?.start();
      }

      this.scrollBar.setRender(true);
      this.scrollBar.resize(height, this.calcScrollBarWidth(width), this.totalHeight);
      this.scrollBar.updateProgress(Math.abs(this.scrollableContainer.y) + this.visibleHeight);

      this.scrollBar.container.x = (width * 0.5);
    } else {
      this.scrollBar.setRender(false);
      this.scrollableContainer.y = 0;
      this.ticker?.stop();
      return;
    }

    if (this.scrollableContainer.y < this.minScrollY) {
      this.targetScrollY = this.minScrollY;
    }
  }

  destroy() {
    //messy destroy because pixijs gc is a crap and refuse to free memory (small leaks may still happen)
    this.scrollableContainer.off('wheel', this.handleWheel);
    this.scrollableContainer.removeAllListeners();

    this.ticker.destroy();
    this.scrollBar.destroy();
    this.mask.destroy({
      texture: true,
      children: true,
      context: true,
      style: true,
      textureSource: true,
    });

    this.scrollableContainer.removeAllListeners();
    this.scrollableContainer.eventMode = 'none';
    this.scrollableContainer.mask = null;
    this.scrollableContainer.removeChildren();
    this.scrollableContainer.destroy({ context: true, children: true });

    this.wrapper.destroy({
      children: true,
      context: true,
      texture: true,
      textureSource: true,
    });

    this.container.destroy({ children: true });

    this.ticker = null;
    this.scrollableContainer = null;
    this.visibleHeight = null;
    this.minScrollY = null;
    this.mask = null;
    this.scrollableContainer = null;
    this.wrapper = null;
    this.container = null;
    this.scrollBar = null;
    this.currentScrollY = this.totalHeight = 0;
  }

  private calcScrollBarWidth(width: number) {
    const maxWidth = this.wrapper.width * this.maxScrollBarWidthFraction;
    const newWidth = (width - this.wrapper.width) * 0.3;

    return newWidth > maxWidth ? maxWidth : newWidth;
  }

  private fillScrollableContainer(items: Container[]) {
    this.totalHeight = 0;

    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i + 1]) {
        items[i].y = (-this.visibleHeight * 0.5) + (items[i].height * 0.5) + (this.visibleHeight * 0.02);
        this.totalHeight += items[i].height;
      } else {
        const space = this.visibleHeight * 0.03;

        items[i].y = items[i + 1].y + (items[i].height * 0.5) + (items[i + 1].height * 0.5) + space;
        this.totalHeight += ( space + items[i].height);
      }

      this.scrollableContainer.addChild(items[i]);
    }
  }

  private resizeScrollContainerMask(width: number, height: number) {
    this.mask.clear();
    this.mask
      .rect(width * -0.5, height * -0.5, width, height)
      .fill(0xEBCCEC);
    this.mask.eventMode = 'none';
  }

  private handleWheel(event: FederatedWheelEvent) {
    event.preventDefault();

    if (this.totalHeight <= this.visibleHeight) return;

    this.targetScrollY -= event.deltaY > 0 ? scrollAmount : -scrollAmount;
    this.targetScrollY = Math.max(this.minScrollY, Math.min(this.maxScrollY, this.targetScrollY));
  }

  private handleMoveTopScroll() {
    this.targetScrollY = 0;
  }

  private handleMoveBottomScroll() {
    if (this.totalHeight <= this.visibleHeight) return;

    this.targetScrollY = this.minScrollY;
  }

  private initAnimationTicker() {
    this.ticker = new Ticker();
    this.ticker.maxFPS = 15;
    this.ticker.add(() => {
      if (this.targetScrollY === this.scrollableContainer.y) return;

      this.currentScrollY += (this.targetScrollY - this.currentScrollY) *  0.25;
      this.scrollableContainer.y = this.currentScrollY;
      this.scrollBar.updateProgress(Math.abs(this.scrollableContainer.y) + this.visibleHeight);
    });
    //this.ticker.start();
  }
}

export default ScrollContainer;
