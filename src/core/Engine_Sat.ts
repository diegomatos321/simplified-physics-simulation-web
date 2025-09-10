import type RigidBody from '@/physics/RigidBody';
import type Entity from './Entity';
import PolygonBody from '@/physics/rigid_bodies/PolygonBody';
import * as twgl from 'twgl.js';
import sat from '@/physics/collision/sat';
import type Collider from '@/physics/Collider';

export default class EngineSat {
    public gravity: twgl.v3.Vec3 = twgl.v3.create(0, 98, 0);
    public dampingFactor: number = 1;

    protected NUM_ITERATIONS: number = 3;

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
            let velocity = twgl.v3.subtract(particle.position, particle.oldPosition)
            let damping = twgl.v3.mulScalar(twgl.v3.normalize(twgl.v3.negate(velocity)), this.dampingFactor);
            
            particle.position[0] = 2 * particle.position[0] - particle.oldPosition[0] + damping[0] * Math.pow(dt, 2)
            particle.position[1] = 2 * particle.position[1] - particle.oldPosition[1] + (damping[1] + this.gravity[1]) * Math.pow(dt, 2)
            
            // console.log(damping)
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

                const hit = sat(body1, body2);
                if (hit) {
                    this.collisionSolver(body1, body2, hit);
                } else {
                    body1.isOverlapping = false;
                    body2.isOverlapping = false;
                }
            }
        }
    }

    public collisionSolver(body1: PolygonBody, body2: PolygonBody, hit: Collider) {
        console.log(hit)
        body1.isOverlapping = true;
        body2.isOverlapping = true;

        let edge1 = body1.getFarthestEdgeInDirection(twgl.v3.negate(hit.normal));
        edge1.forEach((p) => {
            p.move(twgl.v3.add(p.position, twgl.v3.mulScalar(twgl.v3.negate(hit.normal), hit.depth)));
        });

        let edge2 = body2.getFarthestEdgeInDirection(hit.normal);
        edge2.forEach((p) => {
            p.move(twgl.v3.add(p.position, twgl.v3.mulScalar(hit.normal, hit.depth)));
        });
    }
}
