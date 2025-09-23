import { vec3 } from 'gl-matrix';

export default class Particle {
    public oldPosition: vec3 = vec3.create();
    public mass: number = 1;
    public invmass: number = 1;
    public pinned: boolean = false;
    public color = [0, 0, 1, 1];

    constructor(public position: vec3) {
        vec3.copy(this.oldPosition, this.position);
    }

    move(delta: vec3): void {
        if (this.pinned) {
            return;
        }

        vec3.add(this.position, this.position, delta);
    }
}
