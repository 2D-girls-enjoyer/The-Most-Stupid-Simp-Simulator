import { Container, Graphics, Sprite, Ticker } from "pixi.js";

class ScrollBar {
  public container: Container;
  private bar: Graphics;
  private ticker: Ticker;
  private currentProgress = 0;
  private canRender = false;
  private maxProgress: number;
  private currentBarHeight: number;
  private maxBarHeight: number;
  private barWidth: number;
  private barYPos: number;
  private barXPos: number;

  private onTopArrowClickCb: VoidFunction;
  private onBottomArrowClickCb: VoidFunction;

  private topArrow: Sprite;
  private bottomArrow: Sprite;
  private topArrowWraper: Container;
  private bottomArrowWraper: Container;

  loadBar(
    height: number,
    width: number,
    maxProgress: number,
    onTopArrowClickCb: VoidFunction,
    onBottomArrowClickCb: VoidFunction,
  ) {
    this.bar = new Graphics();
    this.container = new Container();
    this.topArrow = Sprite.from('arrow');
    this.bottomArrow = Sprite.from('arrow');

    this.topArrowWraper = new Container();
    this.bottomArrowWraper = new Container();

    this.topArrowWraper.addChild(this.topArrow);
    this.bottomArrowWraper.addChild(this.bottomArrow);

    this.bottomArrow.scale.y *= -1;

    this.onBottomArrowClickCb = onBottomArrowClickCb;
    this.onTopArrowClickCb = onTopArrowClickCb;

    this.topArrowWraper.eventMode = 'static';
    this.topArrowWraper.cursor = 'pointer';
    this.topArrowWraper.on('pointerdown', this.onTopArrowClickCb);

    this.bottomArrowWraper.eventMode = 'static';
    this.bottomArrowWraper.cursor = 'pointer';
    this.bottomArrowWraper.on('pointerdown', this.onBottomArrowClickCb);

    this.container.addChild(this.bar);
    this.container.addChild(this.topArrowWraper);
    this.container.addChild(this.bottomArrowWraper);
    this.resize(height, width, maxProgress);
    this.startTicker();
  }

  resize(height: number, width: number, maxProgress: number) {
    this.maxProgress = maxProgress;
    const halfHeight = height * 0.5;

    this.topArrow.width = this.topArrow.height = this.bottomArrow.height = this.bottomArrow.width = width;
    this.topArrow.anchor.set(1, 0);
    this.bottomArrow.anchor.set(1, 0);

    this.topArrow.y = -halfHeight;
    this.bottomArrow.y = halfHeight;

    this.maxBarHeight = height - width - width;
    this.barWidth = width * 0.7;
    this.barYPos = width - halfHeight;
    this.barXPos = -(this.barWidth) - ((width - this.barWidth) * 0.5);
    this.renderBar();
  }

  destroy() {
    this.ticker.destroy();
    this.ticker = null;

    this.bar.destroy({
      children: true,
      context: true,
      style: true,
      texture: true,
      textureSource: true
    });
    this.bar = null;

    this.topArrow.visible = false;
    this.bottomArrow.visible = false;

    this.topArrow.destroy({
      children: true,
      context: true,
    });
    this.bottomArrow.destroy({
      children: true,
      context: true,
    });

    this.topArrowWraper.removeChildren();
    this.topArrowWraper.eventMode = 'none';
    this.topArrowWraper.removeAllListeners();
    this.topArrowWraper.off('pointerdown', this.onTopArrowClickCb);
    this.topArrowWraper.destroy({
      children: true,
      texture: true,
      textureSource: true,
      context: true,
      style: true,
    });

    this.bottomArrowWraper.removeChildren();
    this.bottomArrowWraper.eventMode = 'none';
    this.bottomArrowWraper.removeAllListeners();
    this.bottomArrowWraper.off('pointerdown', this.onBottomArrowClickCb);
    this.bottomArrowWraper.destroy({
      children: true,
      texture: true,
      textureSource: true,
      context: true,
      style: true,
    })

    this.onBottomArrowClickCb = null;
    this.onTopArrowClickCb = null;

    this.container.removeAllListeners()
    this.container.removeChildren();
    this.container.destroy({ children: true,
      texture: true,
      textureSource: true,
      context: true,
      style: true,
    });
    this.container = null;
    this.topArrow = null;
    this.bottomArrow = null;


    this.canRender = false;
  }

  updateProgress(newProgress: number) {
    if (newProgress === this.currentProgress) return;

    this.currentBarHeight = newProgress >= this.maxProgress
      ? this.maxBarHeight
      : (this.maxBarHeight * newProgress) / this.maxProgress;
    this.canRender = true;
  }

  setRender(render: boolean) {
    if (render) {
      this.ticker.start();
      this.container.renderable = true;
      return;
    }

    this.ticker.stop();
    this.container.renderable = false;
  }

  private startTicker() {
    this.ticker = new Ticker();
    this.ticker.maxFPS = 12;
    this.ticker.add(() => {
      if (this.canRender) {
        this.renderBar();
        this.canRender = false;
      }
    });
  }

  private renderBar() {
    this.bar.clear();
    this.bar
      .rect(this.barXPos, this.barYPos, this.barWidth, this.currentBarHeight)
      .fill(0xEBCCEC);
  }
}

export default ScrollBar;
