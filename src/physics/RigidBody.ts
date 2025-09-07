import type Entity from '@/core/Entity';
import type Particle from './Particle';
import type IConstraint from './constraints/IConstraint';

export default class RigidBody implements Entity {
    public isOverlapping: boolean = false;

    constructor(
        public particles: Array<Particle> = [],
        public constraints: Array<IConstraint> = [],
        protected restitution: number = 0.5,
    ) {}

    update(dt: number) {}

    draw(gl: WebGLRenderingContext): void {
        for (const particle of this.particles) {
            if (this.isOverlapping === true) {
                particle.color = [1, 0.2, 0.2, 1];
            } else {
                particle.color = [0, 0, 1, 1];
            }
            particle.draw();
        }

        for (const constraint of this.constraints) {
            constraint.draw();
        }
    }
}
