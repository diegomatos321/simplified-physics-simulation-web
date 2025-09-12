import type { vec3 } from 'gl-matrix';

export default class Collider {
    constructor(
        public normal: vec3,
        public depth: number,
    ) {}
}
