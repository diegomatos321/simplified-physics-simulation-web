import type { vec3 } from 'gl-matrix';
import type Body from './Body';

export default class Collider {
    constructor(
        public normal: vec3,
        public depth: number,
    ) {}
}
