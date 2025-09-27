import type Collider from '@/physics/Collider';

export default class ColliderInfo {
    constructor(
        public bodyIndex: number,
        public collider: Collider,
    ) {}
}
