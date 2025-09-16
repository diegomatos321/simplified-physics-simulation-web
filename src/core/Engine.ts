import Body from '@/physics/Body';
import PolygonBody from '@/physics/polygons/PolygonBody';
import gjk from '@/physics/collision/gjk';
import { epa } from '@/physics/collision/epa';
import { vec3 } from 'gl-matrix';
import Collider from '@/physics/Collider';

export default class Engine {
    public gravity: vec3 = vec3.fromValues(0, 98, 0);

    protected NUM_ITERATIONS: number = 3;

    constructor(public worldBoundings: number[]) {}

    /**
     * Jakobson's particle phsyics through verlet integration
     * @param body
     * @returns
     */
    integrate(body: Body, dt: number) {
        for (const particle of body.particles) {
            if (particle.pinned) continue;

            const velocity = vec3.subtract(vec3.create(), particle.position, particle.oldPosition);
            // if (vec3.squaredLength(velocity) <= 1e-3) {
            //     velocity[0] = 0;
            //     velocity[1] = 0;
            // }

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
                let x = Math.max(Math.min(particle.position[0], this.worldBoundings[0] / 2), -this.worldBoundings[0] / 2);
                let y = Math.max(Math.min(particle.position[1], this.worldBoundings[1] / 2), -this.worldBoundings[1] / 2);
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

    public narrowPhase(entites: Body[]) {
        for (let i = 0; i < entites.length; i++) {
            const bodyA = entites[i];

            for (let j = i + 1; j < entites.length; j++) {
                const bodyB = entites[j];

                const convexHullA = bodyA.convexHull();
                const convexHullB = bodyB.convexHull();

                const polygonA = new PolygonBody([]);
                polygonA.particles = convexHullA;
                const polygonB = new PolygonBody([]);
                polygonB.particles = convexHullB;

                const hit = gjk(polygonA, polygonB);
                if (hit) {
                    const mvp = epa(polygonA, polygonB, hit);
                    if (mvp) {
                        bodyA.colliders.push(new Collider(mvp.normal, mvp.depth));
                        bodyB.colliders.push(new Collider(vec3.negate(vec3.create(), mvp.normal), mvp.depth));
                    }
                }
            }
        }
    }
}
