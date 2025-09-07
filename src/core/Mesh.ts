import * as twgl from 'twgl.js';
import { Material } from './Material';

export interface Renderable {
    draw(gl: WebGLRenderingContext): void;
}

export class Mesh implements Renderable {
    constructor(
        private bufferInfo: twgl.BufferInfo,
        private material: Material,
    ) {}

    draw(gl: WebGLRenderingContext) {
        this.material.apply(gl);

        twgl.setBuffersAndAttributes(gl, this.material.programInfo, this.bufferInfo);
        twgl.drawBufferInfo(gl, this.bufferInfo);
    }

    updateBufferInfo(gl: WebGLRenderingContext, attr: string, value: number[]) {
        twgl.setAttribInfoBufferFromArray(gl, this.bufferInfo.attribs![attr], value);
    }
}
