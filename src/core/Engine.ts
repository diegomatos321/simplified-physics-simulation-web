import type RigidBody from '@/physics/RigidBody';
import type Entity from './Entity';
import PolygonBody from '@/physics/rigid_bodies/PolygonBody';
import gjk from '@/physics/collision/gjk';
import { epa } from '@/physics/collision/epa';
import * as twgl from 'twgl.js';

export default class Engine {
    public gravity: twgl.v3.Vec3 = twgl.v3.create(0, 98, 0);

    protected NUM_ITERATIONS: number = 2;

    constructor(public worldBoundings: number[]) {}

    /**
     * Jakobson's particle phsyics through verlet integration
     * @param body
     * @returns
     */
    integrate(body: RigidBody, dt: number) {
        for (const particle of body.particles) {
            if (particle.pinned) return;

            let tmp = twgl.v3.copy(particle.position);
            particle.position[0] = 2 * particle.position[0] - particle.oldPosition[0];
            particle.position[1] =
                2 * particle.position[1] -
                particle.oldPosition[1] +
                this.gravity[1] * Math.pow(dt, 2);
            particle.oldPosition = tmp;
        }
    }

    /**
     * Jakobson's constraints solver
     * @param body
     * @returns
     */
    satisfyConstraints(body: RigidBody) {
        for (let i = 0; i < this.NUM_ITERATIONS; i++) {
            for (const particle of body.particles) {
                let x = Math.max(Math.min(particle.position[0], this.worldBoundings[0]), 0);
                let y = Math.max(Math.min(particle.position[1], this.worldBoundings[1]), 0);
                particle.move(twgl.v3.create(x, y));

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

    public collisionTest(entites: Entity[]) {
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

    public collisionSolver(body1: PolygonBody, body2: PolygonBody, hit: twgl.v3.Vec3[]) {
        body1.isOverlapping = true;
        body2.isOverlapping = true;

        let mvp = epa(body1, body2, hit);
        if (mvp) {
            let edge1 = body1.getFarthestEdgeInDirection(twgl.v3.negate(mvp.normal));
            edge1.forEach((p) => {
                p.move(
                    twgl.v3.add(
                        p.position,
                        twgl.v3.mulScalar(twgl.v3.negate(mvp.normal), mvp.depth),
                    ),
                );
            });

            let edge2 = body2.getFarthestEdgeInDirection(mvp.normal);
            edge2.forEach((p) => {
                p.move(twgl.v3.add(p.position, twgl.v3.mulScalar(mvp.normal, mvp.depth)));
            });
        }
    }
}
