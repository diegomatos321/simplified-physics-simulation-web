import * as twgl from 'twgl.js'

export default class Collider {
    constructor(
        public normal: twgl.v3.Vec3,
        public depth: number,
    ) {}
}
