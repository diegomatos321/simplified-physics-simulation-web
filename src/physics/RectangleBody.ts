import PolygonBody from './PolygonBody';
import Particle from './Particle';
import { vec3 } from 'gl-matrix';

export default class RectangleBody extends PolygonBody {
    constructor(x: number, y: number, width: number, height: number, restitution: number = 0.5) {
        const w2 = width / 2;
        const h2 = height / 2;

        const particles = [
            new Particle(vec3.fromValues(x - w2, y - h2, 0)),
            new Particle(vec3.fromValues(x + w2, y - h2, 0)),
            new Particle(vec3.fromValues(x + w2, y + h2, 0)),
            new Particle(vec3.fromValues(x - w2, y + h2, 0)),
        ];
        super(particles, restitution);
    }
}
