import Particle from '@/physics/Particle'
import IConstraint from '@/physics/constraints/IConstraint'
import LinearConstraint from '@/physics/constraints/LinearConstraint'
import Projection from '@/physics/Projection'
import earcut from 'earcut'
import vs from '@/render/shaders/main.vert?raw'
import fs from '@/render/shaders/main.frag?raw'
import * as twgl from 'twgl.js'

export default class PolygonBody {
    public particles: Array<Particle> = []
    public constraints: Array<IConstraint> = []
    public isOverlapping: boolean = false

    public wireframe: boolean = false

    // protected gl: WebGLRenderingContext
    protected bufferInfo: twgl.BufferInfo
    protected programInfo: twgl.ProgramInfo

    protected uvs: number[] = []
    protected indices: number[] = []

    protected NUM_ITERATIONS: number = 10

    constructor(
        protected gl: WebGLRenderingContext,
        vertex_positions: Array<number[]>,
        protected texture: WebGLTexture,
        restitution: number = 0.5,
    ) {
        this.gl = gl

        // 1. Setup Particles and Constraints (Physics)
        this.particles = vertex_positions.map((v) => new Particle(gl, twgl.v3.create(v[0], v[1])))

        // Create constraints for the outer edges
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i]
            const p2 = this.particles[(i + 1) % this.particles.length]
            this.constraints.push(new LinearConstraint(gl, p1, p2, restitution))
        }

        // Internal strut constraints for rigidity (connecting every other vertex)
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i]
            const p2 = this.particles[(i + 2) % this.particles.length]
            this.constraints.push(new LinearConstraint(gl, p1, p2))
        }

        // 2a. Automatic UV Generation via Bounding Box
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity
        for (const pos of vertex_positions) {
            minX = Math.min(minX, pos[0])
            minY = Math.min(minY, pos[1])
            maxX = Math.max(maxX, pos[0])
            maxY = Math.max(maxY, pos[1])
        }
        this.uvs = vertex_positions
            .map(([x, y]) => [(x - minX) / (maxX - minX), (y - minY) / (maxY - minY)])
            .flat()

        // 2b. Automatic Triangulation with Earcut
        const flattened_vertices = vertex_positions.flat()
        this.indices = earcut(flattened_vertices)

        // 3. Setup webgl render variables
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            a_position: {
                numComponents: 2,
                data: flattened_vertices,
                drawType: gl.DYNAMIC_DRAW,
            },
            a_texcoord: {
                numComponents: 2,
                data: this.uvs,
                drawType: gl.STATIC_DRAW,
            },
            indices: this.indices,
        })

        this.programInfo = twgl.createProgramInfo(gl, [vs, fs])
    }

    update(dt: number) {
        for (const particle of this.particles) {
            particle.update(dt)
        }

        for (let i = 0; i < this.NUM_ITERATIONS; i++) {
            for (const particle of this.particles) {
                let x = Math.max(Math.min(particle.position[0], this.gl.canvas.width), 0)
                let y = Math.max(Math.min(particle.position[1], this.gl.canvas.height), 0)
                particle.move(twgl.v3.create(x, y))

                // particle.move(twgl.v3.create(
                //     particle.position[0] * (1 - 0.5) + x * 0.5,
                //     particle.position[1] * (1 - 0.5) + y * 0.5,
                // ))
            }

            for (const constraint of this.constraints) {
                constraint.relax()
            }
        }
    }

    draw() {
        if (this.wireframe === true) {
            for (const particle of this.particles) {
                if (this.isOverlapping === true) {
                    particle.color = [1, 0.2, 0.2, 1]
                } else {
                    particle.color = [0, 0, 1, 1]
                }
                particle.draw()
            }

            for (const constraint of this.constraints) {
                constraint.draw()
            }
        } else {
            const flattened_vertices = this.particles
                .map((p) => [p.position[0], p.position[1]])
                .flat()

            const uniforms = {
                u_resolution: [this.gl.canvas.width, this.gl.canvas.height],
                u_texture: this.texture,
                // u_color: this.color,
                // time: time * 0.001,
            }

            this.gl.useProgram(this.programInfo.program)
            twgl.setAttribInfoBufferFromArray(
                this.gl,
                this.bufferInfo.attribs!.a_position,
                flattened_vertices,
            )

            twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo)
            twgl.setUniforms(this.programInfo, uniforms)
            twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLES)
        }
    }

    axes(): twgl.v3.Vec3[] {
        const axes = []
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i].position

            const nextIndex = (i + 1) % this.particles.length
            const p2 = this.particles[nextIndex].position

            const edge = twgl.v3.subtract(p1, p2)
            const normal = twgl.v3.create(-edge[1], edge[0])
            axes.push(normal)
        }

        return axes
    }

    project(axis: twgl.v3.Vec3) {
        let min = twgl.v3.dot(axis, this.particles[0].position)
        let max = min

        for (let i = 1; i < this.particles.length; i++) {
            const proj = twgl.v3.dot(axis, this.particles[i].position)
            if (proj < min) {
                min = proj
            } else if (proj > max) {
                max = proj
            }
        }

        return new Projection(min, max)
    }

    // Centroid of a Polygon
    getCenter() {
        let area = 0
        let cx = 0
        let cy = 0

        const n = this.particles.length
        for (let i = 0; i < n; i++) {
            const [x0, y0] = this.particles[i].position
            const [x1, y1] = this.particles[(i + 1) % n].position

            const cross = x0 * y1 - x1 * y0
            area += cross
            cx += (x0 + x1) * cross
            cy += (y0 + y1) * cross
        }

        area *= 0.5
        cx /= 6 * area
        cy /= 6 * area

        return [cx, cy, 0]
    }

    getFarthestPointInDirection(d: twgl.v3.Vec3): Particle {
        let max = Number.NEGATIVE_INFINITY
        let best = this.particles[0]

        for (const particle of this.particles) {
            let candidate = twgl.v3.dot(d, particle.position)
            if (candidate > max) {
                max = candidate
                best = particle
            }
        }

        return best
    }

    getFarthestEdgeInDirection(d: twgl.v3.Vec3): Particle[] {
        let max = Number.NEGATIVE_INFINITY
        let max2 = Number.NEGATIVE_INFINITY
        let best = this.particles[0],
            best2 = this.particles[1]

        for (const particle of this.particles) {
            let candidate = twgl.v3.dot(d, particle.position)
            if (candidate > max) {
                max2 = max
                best2 = best

                max = candidate
                best = particle
            } else if (candidate > max2) {
                max2 = candidate
                best2 = particle
            }
        }

        if (Math.abs(max - max2) < 0.01) {
            return [best2, best]
        }

        return [best]
    }
}
