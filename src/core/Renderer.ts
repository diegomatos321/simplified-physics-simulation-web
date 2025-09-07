import Scene from './Scene';
import * as twgl from 'twgl.js';

export default class Renderer {
    constructor(
        private gl: WebGLRenderingContext,
        private scene: Scene,
    ) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }

    render() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.scene.render(this.gl);
    }
}
