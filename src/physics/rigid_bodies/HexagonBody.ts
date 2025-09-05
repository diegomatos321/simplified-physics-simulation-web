import LinearConstraint from '@/physics/constraints/LinearConstraint'
import PolygonBody from './PolygonBody'

export default class HexagonBody extends PolygonBody {
    constructor(
        gl: WebGLRenderingContext,
        x: number,
        y: number,
        size: number,
        restitution: number = 1,
    ) {
        const vertices = []
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * 2 * Math.PI // Start from right
            vertices.push([x + size * Math.cos(angle), y + size * Math.sin(angle)])
        }
        super(gl, vertices, restitution)

        // Add internal struts by connecting opposite vertices.
        this.constraints.push(new LinearConstraint(gl, this.particles[0], this.particles[3]))
        this.constraints.push(new LinearConstraint(gl, this.particles[1], this.particles[4]))
        this.constraints.push(new LinearConstraint(gl, this.particles[2], this.particles[5]))
    }
}
