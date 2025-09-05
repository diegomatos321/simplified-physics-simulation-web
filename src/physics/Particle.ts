import vs from '@/render/shaders/simple_2d.vert?raw'
import fs from '@/render/shaders/fill_color.frag?raw'
import * as twgl from 'twgl.js'

export default class Particle {
    public position: twgl.v3.Vec3
    public oldPosition: twgl.v3.Vec3
    public mass: number = 1
    public pinned: boolean = false
    public gravity: twgl.v3.Vec3 = twgl.v3.create(0, 98, 0)
    // color = [1, 0.2, 0.2, 1]
    public color = [0, 0, 1, 1]

    private gl: WebGLRenderingContext
    private bufferInfo: twgl.BufferInfo
    private programInfo: twgl.ProgramInfo

    constructor(gl: WebGLRenderingContext, position: twgl.v3.Vec3 = twgl.v3.create()) {
        this.gl = gl
        this.position = position
        this.oldPosition = twgl.v3.copy(position)

        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            a_position: {
                numComponents: 2,
                data: [position[0], position[1]],
                drawType: gl.DYNAMIC_DRAW,
            },
        })

        this.programInfo = twgl.createProgramInfo(gl, [vs, fs])
    }

    update(dt: number): void {
        if (this.pinned) return

        let tmp = twgl.v3.copy(this.position)
        this.position[0] = 2 * this.position[0] - this.oldPosition[0]
        this.position[1] =
            2 * this.position[1] - this.oldPosition[1] + this.gravity[1] * Math.pow(dt, 2)
        this.oldPosition = tmp
    }

    move(newPosition: twgl.v3.Vec3): void {
        if (this.pinned) return

        this.position[0] = newPosition[0]
        this.position[1] = newPosition[1]
    }

    draw(): void {
        const uniforms = {
            u_resolution: [this.gl.canvas.width, this.gl.canvas.height],
            u_color: this.color,
            // time: time * 0.001,
        }

        this.gl.useProgram(this.programInfo.program)
        twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs!.a_position, [
            this.position[0],
            this.position[1],
        ])

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo)
        twgl.setUniforms(this.programInfo, uniforms)
        twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.POINTS)
    }
}
