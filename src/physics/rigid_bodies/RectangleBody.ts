import LinearConstraint from '@/physics/constraints/LinearConstraint';
import PolygonBody from './PolygonBody';

export default class RectangleBody extends PolygonBody {
    constructor(
        gl: WebGLRenderingContext,
        x: number,
        y: number,
        width: number,
        height: number,
        texture: WebGLTexture,
        restitution: number = 1,
    ) {
        const w2 = width / 2;
        const h2 = height / 2;

        const vertices = [
            [x - w2, y - h2], // Bottom-left
            [x + w2, y - h2], // Bottom-right
            [x + w2, y + h2], // Top-right
            [x - w2, y + h2], // Top-left
        ];
        super(gl, vertices, texture, restitution);
    }
}
