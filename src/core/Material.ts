import * as twgl from 'twgl.js'

export class Material {
    constructor(
        public programInfo: twgl.ProgramInfo,
        public uniforms: Record<string, any> = {},
    ) {}

    apply(gl: WebGLRenderingContext) {
        gl.useProgram(this.programInfo.program)

        twgl.setUniforms(this.programInfo, {
            ...this.uniforms,
        })
    }
}
