import LinearConstraint from '@/physics/constraints/LinearConstraint'
import PolygonBody from './PolygonBody'

export default class PentagonBody extends PolygonBody {
    constructor(
        gl: WebGLRenderingContext,
        x: number,
        y: number,
        size: number,
        restitution: number = 1,
    ) {
        const vertices = []
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * 2 * Math.PI + Math.PI / 2 // Start from top
            vertices.push([x + size * Math.cos(angle), y + size * Math.sin(angle)])
        }
        super(gl, vertices, restitution)

        // Add internal struts in a star pattern (pentagram) for rigidity.
        // Each vertex is connected to the two opposite it.
        this.constraints.push(new LinearConstraint(gl, this.particles[0], this.particles[2]))
        this.constraints.push(new LinearConstraint(gl, this.particles[0], this.particles[3]))
        this.constraints.push(new LinearConstraint(gl, this.particles[1], this.particles[3]))
        this.constraints.push(new LinearConstraint(gl, this.particles[1], this.particles[4]))
        this.constraints.push(new LinearConstraint(gl, this.particles[2], this.particles[4]))
    }
}
