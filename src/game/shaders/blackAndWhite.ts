import { ColorMatrixFilter } from "pixi.js";

class BlackAndWhiteShader {
  public shader: ColorMatrixFilter;

  loadTempShader() {
    this.shader = new ColorMatrixFilter();
    this.shader.blackAndWhite(true);
  }

  destroyTempShader() {
    this.shader.destroy(false);
    this.shader = null;
  }
}

export default new BlackAndWhiteShader();
