import type Body from '@/physics/Body';
import type Particle from '@/physics/Particle';
import type { vec3 } from 'gl-matrix';

export default class ColliderInfo {
    public contactPoints: Particle[] = [];

    constructor(
        public body: Body,
        public normal: vec3,
        public depth: number,
    ) {}
}
