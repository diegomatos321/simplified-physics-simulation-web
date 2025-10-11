import { vec3 } from 'gl-matrix';

export default class Particle {
    public oldPosition: vec3 = vec3.create();
    public invmass: number;
    public color = [0, 0, 1, 1];

    constructor(
        public position: vec3,
        public mass: number = 1,
        public isStatic: boolean = false,
    ) {
        vec3.copy(this.oldPosition, this.position);

        if (isStatic) {
            this.invmass = 0;
        } else {
            this.invmass = 1 / mass;
        }
    }

    move(delta: vec3): void {
        if (this.isStatic) {
            return;
        }

        vec3.add(this.position, this.position, delta);
    }
}
