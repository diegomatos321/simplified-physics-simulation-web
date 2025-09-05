import LinearConstraint from '@/physics/constraints/LinearConstraint'
import PolygonBody from './PolygonBody'

export default class PentagonBody extends PolygonBody {
    constructor(
        gl: WebGLRenderingContext,
        x: number,
        y: number,
        size: number,
        texture: WebGLTexture,
        restitution: number = 1,
    ) {
        const vertices = []
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * 2 * Math.PI + Math.PI / 2 // Start from top
            vertices.push([x + size * Math.cos(angle), y + size * Math.sin(angle)])
        }
        super(gl, vertices, texture, restitution)
    }
}
