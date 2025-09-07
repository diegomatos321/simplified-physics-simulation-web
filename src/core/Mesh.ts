import * as twgl from 'twgl.js';
import { Material } from './Material';

export default class Mesh {
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
