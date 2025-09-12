import PolygonBody from './PolygonBody';

export default class TriangleBody extends PolygonBody {
    constructor(x: number, y: number, size: number, restitution: number = 0.5) {
        const h = size * (Math.sqrt(3) / 2); // Height of equilateral triangle
        const vertices = [
            [x, y + (2 / 3) * h],
            [x - size / 2, y - (1 / 3) * h],
            [x + size / 2, y - (1 / 3) * h],
        ];
        super(vertices, restitution);
    }
}
