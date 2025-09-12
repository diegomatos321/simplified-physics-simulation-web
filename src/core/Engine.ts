import Body from '@/physics/Body';
import PolygonBody from '@/physics/polygons/PolygonBody';
import gjk from '@/physics/collision/gjk';
import { epa } from '@/physics/collision/epa';
import { vec3 } from 'gl-matrix';

export default class Engine {
    public gravity: vec3 = vec3.fromValues(0, 98, 0);
    public dampingFactor: number = 1;

    protected NUM_ITERATIONS: number = 3;

    constructor(public worldBoundings: number[]) {}

    /**
     * Jakobson's particle phsyics through verlet integration
     * @param body
     * @returns
     */
    integrate(body: Body, dt: number) {
        for (const particle of body.particles) {
            if (particle.pinned) return;

            const velocity = vec3.subtract(vec3.create(), particle.position, particle.oldPosition);

            vec3.copy(particle.oldPosition, particle.position);

            const acc = vec3.scale(vec3.create(), this.gravity, dt * dt);

            // pos = pos + velocity + acc
            vec3.add(particle.position, particle.position, velocity);
            vec3.add(particle.position, particle.position, acc);
        }
    }

    /**
     * Jakobson's constraints solver
     * @param body
     * @returns
     */
    satisfyConstraints(body: Body) {
        for (let i = 0; i < this.NUM_ITERATIONS; i++) {
            for (const particle of body.particles) {
                let x = Math.max(Math.min(particle.position[0], this.worldBoundings[0]/2), -this.worldBoundings[0]/2);
                let y = Math.max(Math.min(particle.position[1], this.worldBoundings[1]/2), -this.worldBoundings[1]/2);
                vec3.set(particle.position, x, y, 0);

                // particle.move(twgl.v3.create(
                //     particle.position[0] * (1 - 0.5) + x * 0.5,
                //     particle.position[1] * (1 - 0.5) + y * 0.5,
                // ))
            }

            for (const constraint of body.constraints) {
                constraint.relax();
            }
        }
    }

    public collisionTest(entites: Body[]) {
        for (let i = 0; i < entites.length; i++) {
            const body1 = entites[i];
            if (!(body1 instanceof PolygonBody)) continue;

            for (let j = 0; j < entites.length; j++) {
                if (i == j) continue;

                const body2 = entites[j];
                if (!(body2 instanceof PolygonBody)) continue;

                const hit = gjk(body1, body2);
                if (hit) {
                    this.collisionSolver(body1, body2, hit);
                } else {
                    body1.isOverlapping = false;
                    body2.isOverlapping = false;
                }
            }
        }
    }

    public collisionSolver(body1: PolygonBody, body2: PolygonBody, simplex: vec3[]) {
        body1.isOverlapping = true;
        body2.isOverlapping = true;

        let mvp = epa(body1, body2, simplex);
        if (mvp) {
            const normalA = vec3.negate(vec3.create(), mvp.normal);
            let edge1 = body1.getFarthestEdgeInDirection(normalA);
            edge1.forEach((p) => {
                const vel = vec3.scale(vec3.create(), normalA, mvp.depth);
                p.move(vel);
            });

            let edge2 = body2.getFarthestEdgeInDirection(mvp.normal);
            edge2.forEach((p) => {
                const vel = vec3.scale(vec3.create(), mvp.normal, mvp.depth);
                p.move(vel);
            });
        }
    }
}
