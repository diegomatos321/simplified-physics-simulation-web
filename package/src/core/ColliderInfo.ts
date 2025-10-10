import type Body from '../bodies/Body';
import type Particle from './Particle';
import type { vec3 } from 'gl-matrix';

export default class ColliderInfo {
    public contactPoints: Particle[] = [];

    constructor(
        public body: Body,
        public normal: vec3,
        public depth: number,
    ) {}
}
