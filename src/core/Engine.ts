import Body from '@/physics/Body';
import PolygonBody from '@/physics/polygons/PolygonBody';
import gjk from '@/physics/collision/gjk';
import { epa } from '@/physics/collision/epa';
import { vec3 } from 'gl-matrix';
import Collider from '@/physics/Collider';
import sat from '@/physics/collision/sat';

export enum Mode {
    GjkEpa,
    Sat,
}

export default class Engine {
    public gravity: vec3 = vec3.fromValues(0, 98, 0);
    public bodies: Body[] = [];

    // Debug states
    public isPaused: boolean = false;
    public pauseOnCollision: boolean = false;
    public skip: boolean = false;

    protected NUM_ITERATIONS: number = 3;

    constructor(
        public worldBoundings: number[],
        public engineMode: Mode = Mode.GjkEpa,
    ) {}

    step(dt: number) {
        if (this.isPaused) {
            return;
        }

        for (const body of this.bodies) {
            this.integrate(body, dt);
        }

        // Reset body colliders and cached convex hull
        for (const body of this.bodies) {
            body._convexHull = null;
            body.colliders = [];
        }

        this.narrowPhase();

        for (const body of this.bodies) {
            // pause on debug if has any collisions
            if (body.colliders.length > 0 && this.pauseOnCollision && this.skip === false) {
                this.isPaused = true;
                break;
            }

            for (const collider of body.colliders) {
                const convexHull = body.convexHull();
                const bodyHull = new PolygonBody([]);
                bodyHull.particles = convexHull;
                let edge = bodyHull.getFarthestEdgeInDirection(collider.normal);
                for (const particle of edge) {
                    const delta = vec3.scale(vec3.create(), vec3.negate(vec3.create(), collider.normal), collider.depth);

                    particle.move(delta);
                }
            }
        }

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
            }

            for (const constraint of body.constraints) {
                constraint.relax();
            }
        }
    }

    public narrowPhase() {
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];

            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyB = this.bodies[j];

                const convexHullA = bodyA.convexHull();
                const convexHullB = bodyB.convexHull();

                const polygonA = new PolygonBody([]);
                polygonA.particles = convexHullA;
                const polygonB = new PolygonBody([]);
                polygonB.particles = convexHullB;

                if (this.engineMode === Mode.GjkEpa) {
                    const hit = gjk(polygonA, polygonB);
                    if (hit) {
                        const mvp = epa(polygonA, polygonB, hit);
                        if (mvp) {
                            bodyA.colliders.push(new Collider(mvp.normal, mvp.depth));
                            bodyB.colliders.push(new Collider(vec3.negate(vec3.create(), mvp.normal), mvp.depth));
                        }
                    }
                } else if (this.engineMode === Mode.Sat) {
                    const hit = sat(polygonA, polygonB);
                    if (hit) {
                        bodyA.colliders.push(new Collider(hit.normal, hit.depth));
                        bodyB.colliders.push(new Collider(vec3.negate(vec3.create(), hit.normal), hit.depth));
                    }
                }
            }
        }
    }
}
