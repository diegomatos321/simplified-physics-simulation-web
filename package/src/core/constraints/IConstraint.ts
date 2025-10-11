import { vec3 } from 'gl-matrix';

import type Particle from '../Particle';

export default abstract class IConstraint {
    public isActive: boolean = true;
    public restlength: number;

    constructor(
        public p0: Particle,
        public p1: Particle,
        public restitution: number = 0.5,
    ) {
        this.restlength = vec3.distance(p0.position, p1.position);
    }

    abstract relax(): void;
}
