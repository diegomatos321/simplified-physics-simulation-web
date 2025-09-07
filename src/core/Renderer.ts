import type Entity from './Entity';
import * as twgl from 'twgl.js';

export default class Renderer {
    constructor(gl: WebGLRenderingContext) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }

    render(gl: WebGLRenderingContext, entities: Entity[]) {
        twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        for (const entity of entities) {
            entity.draw(gl);
        }
    }
}
