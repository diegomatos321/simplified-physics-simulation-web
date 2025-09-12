import { vec3 } from 'gl-matrix';
import type Particle from '../Particle';

export default abstract class IConstraint {
    public p0: Particle;
    public p1: Particle;
    public isActive: boolean = true;
    public restitution: number;
    public restlength: number;

    constructor(p0: Particle, p1: Particle, restitution: number = 0.5) {
        this.p0 = p0;
        this.p1 = p1;

        this.restlength = vec3.distance(p0.position, p1.position);
        this.restitution = restitution;
    }

    abstract relax(): void;
}
