import type Body from '@/physics/Body';
import gjk from '@/physics/collision/gjk';
import { epa } from '@/physics/collision/epa';
import { vec3 } from 'gl-matrix';
import sat from '@/physics/collision/sat';
import ColliderInfo from './ColliderInfo';
import GridSpatialPartition from './GridSpatialPartition';

export enum Mode {
    GjkEpa,
    Sat,
}

export default class Engine {
    public gravity: vec3 = vec3.fromValues(0, 98, 0);

    public contactPairs: [Body, Body][] = [];
    public collidersInfo: ColliderInfo[] = [];

    // Debug states
    public isPaused: boolean = false;
    public pauseOnCollision: boolean = false;
    public skip: boolean = false;

    protected bodies: Body[] = [];
    protected spatialPartition: GridSpatialPartition;
    protected NUM_ITERATIONS: number = 3;

    constructor(
        public worldBoundings: { top: [number, number]; right: [number, number] },
        public engineMode: Mode = Mode.GjkEpa,
    ) {
        this.spatialPartition = new GridSpatialPartition(10, 10);
    }

    step(dt: number) {
        if (this.isPaused) {
            return;
        }

        // for (const body of this.bodies) {
        //     this.integrate(body, dt);
        // }

        // Reset contact list
        this.contactPairs.length = 0;
        this.collidersInfo.length = 0;

        this.broadPhase();
        this.narrowPhase();
        this.resolveCollisions();

        for (const body of this.bodies) {
            this.satisfyConstraints(body);
        }

        this.skip = false;
    }

    /**
     * Jakobson's particle phsyics through verlet integration
     * @param body
     * @returns
     */
    integrate(body: Body, dt: number) {
        for (const particle of body.particles) {
            if (particle.pinned) continue;

            const velocity = vec3.subtract(vec3.create(), particle.position, particle.oldPosition);
            vec3.copy(particle.oldPosition, particle.position);

            const drag = vec3.fromValues(-10 * velocity[0], -10 * velocity[1], 0);
            const acc = vec3.add(vec3.create(), drag, this.gravity);
            vec3.scale(acc, acc, dt * dt);

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
                let x = Math.max(Math.min(particle.position[0], this.worldBoundings.right[0]), this.worldBoundings.top[0]);
                let y = Math.max(Math.min(particle.position[1], this.worldBoundings.right[1]), this.worldBoundings.top[1]);
                vec3.set(particle.position, x, y, 0);
            }

            for (const constraint of body.constraints) {
                constraint.relax();
            }
        }
    }

    public broadPhase() {
        for (let i = 0; i < this.spatialPartition.nrows; i++) {
            for (let j = 0; j < this.spatialPartition.ncols; j++) {
                const bodies = this.spatialPartition.grid[i][j];

                for (let ii = 0; ii < bodies.length - 1; ii++) {
                    const bodyA = bodies[ii];

                    for (let jj = ii + 1; jj < bodies.length; jj++) {
                        const bodyB = bodies[jj];

                        // Invalidate aabb cache
                        bodyA.aabb = null;
                        bodyB.aabb = null;

                        const boundingBoxA = bodyA.getAABB();
                        const boundingBoxB = bodyB.getAABB();

                        if (boundingBoxA.intersercts(boundingBoxB)) {
                            this.contactPairs.push([bodyA, bodyB]);
                        }
                    }
                }
            }
        }
    }

    public narrowPhase() {
        for (const pair of this.contactPairs) {
            const bodyA = pair[0];
            const bodyB = pair[1];

            // Invalidate convexhull cache
            bodyA._convexHull = null;
            bodyB._convexHull = null;

            const convexHullA = bodyA.convexHull();
            const convexHullB = bodyB.convexHull();

            // The direction of the separation plane goes from A to B
            // So the separation required for A is in the oppositive direction
            if (this.engineMode === Mode.GjkEpa) {
                const hit = gjk(convexHullA, convexHullB);
                if (hit) {
                    const mvp = epa(convexHullA, convexHullB, hit);
                    const colliderA = new ColliderInfo(bodyA, vec3.negate(vec3.create(), mvp.normal), mvp.depth);
                    const colliderB = new ColliderInfo(bodyB, mvp.normal, mvp.depth);
                    this.collidersInfo.push(colliderA, colliderB);
                }
            } else if (this.engineMode === Mode.Sat) {
                const hit = sat(convexHullA, convexHullB);
                if (hit) {
                    const colliderA = new ColliderInfo(bodyA, vec3.negate(vec3.create(), hit.normal), hit.depth);
                    const colliderB = new ColliderInfo(bodyB, hit.normal, hit.depth);
                    this.collidersInfo.push(colliderA, colliderB);
                }
            }
        }
    }

    public resolveCollisions() {
        for (const c of this.collidersInfo) {
            // The separation direction is pointing away from the colliding points
            // We should look for the contact edges on the oppositive direction
            const convexHull = c.body.convexHull();
            let edge = convexHull.getFarthestEdgeInDirection(vec3.negate(vec3.create(), c.normal));
            c.contactPoints = edge;

            if (this.pauseOnCollision && this.skip === false) {
                this.isPaused = true;
                // Should not resolve collision, just pause the simulation
                // however you need to calculate all the contact points for
                // rendering debug
                continue;
            }
            for (const particle of edge) {
                const delta = vec3.scale(vec3.create(), c.normal, c.depth);

                particle.move(delta);
            }
        }
    }

    public addBody(body: Body) {
        this.bodies.push(body);
        this.spatialPartition.insert(body);
    }
}
