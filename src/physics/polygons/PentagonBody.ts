import LinearConstraint from '@/physics/constraints/LinearConstraint';
import PolygonBody from './PolygonBody';

export default class PentagonBody extends PolygonBody {
    constructor(x: number, y: number, size: number, restitution: number = 1) {
        const vertices = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * 2 * Math.PI + Math.PI / 2; // Start from top
            vertices.push([x + size * Math.cos(angle), y + size * Math.sin(angle)]);
        }
        super(vertices, restitution);
    }
}
