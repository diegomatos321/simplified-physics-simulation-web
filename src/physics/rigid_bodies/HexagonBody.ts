import LinearConstraint from '@/physics/constraints/LinearConstraint'
import PolygonBody from './PolygonBody'

export default class HexagonBody extends PolygonBody {
    constructor(
        gl: WebGLRenderingContext,
        x: number,
        y: number,
        size: number,
        texture: WebGLTexture,
        restitution: number = 1,
    ) {
        const vertices = []
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * 2 * Math.PI // Start from right
            vertices.push([x + size * Math.cos(angle), y + size * Math.sin(angle)])
        }
        super(gl, vertices, texture, restitution)
    }
}
