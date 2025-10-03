import type { vec3 } from 'gl-matrix';

export default class AABB {
    constructor(
        public min: vec3,
        public max: vec3,
    ) {}

    public intersects(other: AABB): boolean {
        return !(this.max[0] < other.min[0] || this.min[0] > other.max[0] || this.max[1] < other.min[1] || this.min[1] > other.max[1]);
    }
}
