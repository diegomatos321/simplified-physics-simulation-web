import LinearConstraint from '@/physics/constraints/LinearConstraint';
import PolygonBody from './PolygonBody';

export default class HexagonBody extends PolygonBody {
    constructor(x: number, y: number, size: number, restitution: number = 0.5) {
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * 2 * Math.PI; // Start from right
            vertices.push([x + size * Math.cos(angle), y + size * Math.sin(angle)]);
        }
        super(vertices, restitution);
    }
}
