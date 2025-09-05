import type Particle from '../Particle'
import IConstraint from './IConstraint'
import vs from "@/render/shaders/simple_2d.vert?raw";
import fs from "@/render/shaders/fill_color.frag?raw";
import * as twgl from 'twgl.js'

export default class LinearConstraint extends IConstraint {
    private bufferInfo: twgl.BufferInfo
    private programInfo: twgl.ProgramInfo

    constructor(gl: WebGLRenderingContext, p0: Particle, p1: Particle, restitution: number = 0.5) {
        super(gl, p0, p1, restitution)

        const p1a = [this.p0.position[0], this.p0.position[1] + 1]
        const p1b = [this.p0.position[0], this.p0.position[1] - 1]
        const p2a = [this.p1.position[0], this.p1.position[1] + 1]
        const p2b = [this.p1.position[0], this.p1.position[1] - 1]
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            a_position: {
                numComponents: 2,
                data: [...p1a, ...p1b, ...p2a, ...p1b, ...p2b, ...p2a],
                drawType: gl.DYNAMIC_DRAW,
            },
        })

        this.programInfo = twgl.createProgramInfo(gl, [vs, fs])

        this.relax()
    }

    relax(): void {
        if (this.isActive === false) return

        let delta = twgl.v3.subtract(this.p1.position, this.p0.position)
        let deltalength = twgl.v3.length(delta)
        let diff =
            (deltalength - this.restlength) / (deltalength * (1 / this.p0.mass + 1 / this.p1.mass))
        this.p0.move(
            twgl.v3.add(
                this.p0.position,
                twgl.v3.mulScalar(delta, (1 / this.p0.mass) * diff * this.restitution),
            ),
        )
        this.p1.move(
            twgl.v3.subtract(
                this.p1.position,
                twgl.v3.mulScalar(delta, (1 / this.p1.mass) * diff * this.restitution),
            ),
        )
    }

    draw(): void {
        if (this.isActive === false) return

        const uniforms = {
            u_resolution: [this.gl.canvas.width, this.gl.canvas.height],
            u_color: [0, 0, 0, 1],
            // time: time * 0.001,
        }

        const p1a = [this.p0.position[0], this.p0.position[1] + 1]
        const p1b = [this.p0.position[0], this.p0.position[1] - 1]
        const p2a = [this.p1.position[0], this.p1.position[1] + 1]
        const p2b = [this.p1.position[0], this.p1.position[1] - 1]

        this.gl.useProgram(this.programInfo.program)
        twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs!.a_position, [
            ...p1a,
            ...p1b,
            ...p2a,
            ...p1b,
            ...p2b,
            ...p2a,
        ])

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo)
        twgl.setUniforms(this.programInfo, uniforms)
        twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLES)
    }
}
