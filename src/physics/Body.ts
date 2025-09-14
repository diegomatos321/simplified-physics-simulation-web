import { vec3 } from 'gl-matrix';
import Collider from './Collider';
import Particle from './Particle';
import type IConstraint from './constraints/IConstraint';
import earcut from 'earcut';
import PolygonBody from './polygons/PolygonBody';

export default class Body {
    public colliders: Collider[] = [];

    constructor(
        public particles: Particle[] = [],
        public constraints: IConstraint[] = [],
        protected restitution: number = 0.5,
    ) {}

    update(dt: number) {}

    draw() {}
    // draw(gl: WebGLRenderingContext): void {
    //     for (const particle of this.particles) {
    //         if (this.isOverlapping === true) {
    //             particle.color = [1, 0.2, 0.2, 1];
    //         } else {
    //             particle.color = [0, 0, 1, 1];
    //         }
    //         particle.draw();
    //     }

    //     for (const constraint of this.constraints) {
    //         constraint.draw();
    //     }
    // }

    triangulation() {
        // Automatic UV Generation via Bounding Box
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        for (const particle of this.particles) {
            minX = Math.min(minX, particle.position[0]);
            minY = Math.min(minY, particle.position[1]);
            maxX = Math.max(maxX, particle.position[0]);
            maxY = Math.max(maxY, particle.position[1]);
        }
        const uvs = this.particles.map((particle) => {
            const x = particle.position[0];
            const y = particle.position[1];
            return [(x - minX) / (maxX - minX), (y - minY) / (maxY - minY)];
        });

        // Automatic Triangulation with Earcut
        const flattened_vertices = this.particles.map((p) => [p.position[0], p.position[1]]).flat();
        const indices = earcut(flattened_vertices);

        return {
            uvs,
            indices,
        };
    }

    // Compute the convex hull of the body using quickhull algorithm
    convexHull(): Particle[] {
        // The convex hull is not defined by less than 3 points
        if (this.particles.length < 3) {
            return this.particles;
        }

        const convexHull: Particle[] = [];
        const candidates: Particle[] = this.particles.map((p) => p); // A reference copy of the particles objects

        // 1. Find the extreme points
        let pmin: Particle = this.particles[0],
            pmax: Particle = this.particles[this.particles.length - 1];
        let imin: number = 0,
            imax: number = 0;
        for (let i = 1; i < candidates.length - 1; i++) {
            const particle = candidates[i];
            if (particle.position[0] < pmin.position[0]) {
                pmin = particle;
                imin = i;
            } else if (particle.position[0] > pmax.position[0]) {
                pmax = particle;
                imax = i;
            }
        }

        // 2. Insert them into hull and remove from candidates
        convexHull.push(pmin, pmax);
        candidates.splice(imin, 1);
        candidates.splice(imax, 1);

        // 3. Divide the candidates into above and bellow the line
        const { above, bellow } = this.createSegment(pmin, pmax, candidates);
        convexHull.push(...this.quickhull(pmin, pmax, above, 'above'));
        convexHull.push(...this.quickhull(pmin, pmax, bellow, 'below'));

        return convexHull;
    }

    protected quickhull(p0: Particle, p1: Particle, candidates: Particle[], flag: string): Particle[] {
        const convexHull: Particle[] = [];

        // 4. Find the most distance point from the line
        let farthestDistance = -Infinity;
        let farthestPoint: Particle | null = null;
        let pointIndex = -1;
        for (let i = 0; i < candidates.length; i++) {
            const particle = candidates[i];
            const d = this.pointLineDistance(p0, p1, particle);
            if (d > farthestDistance) {
                farthestPoint = particle;
                pointIndex = i;
            }
        }

        // 5. Divide the candidates from lines (p0, farthestPoint) and (p1, farthestPoint)
        // We can ignore the points inside the triangle formed by: p0, p1, farthestPoint
        // The bellows checks of farthestPoint and candidatesLength avoid the next recursive call
        if (farthestPoint) {
            convexHull.push(farthestPoint);
            candidates.splice(pointIndex, 1);

            if (candidates.length > 0) {
                const { above: point1Above, bellow: point1Bellow } = this.createSegment(p0, farthestPoint, candidates);
                const { above: point2Above, bellow: point2Bellow } = this.createSegment(p1, farthestPoint, candidates);

                if (flag === 'above') {
                    convexHull.push(...this.quickhull(p0, farthestPoint, point1Above, flag));
                    convexHull.push(...this.quickhull(p1, farthestPoint, point2Above, flag));
                } else {
                    convexHull.push(...this.quickhull(p0, farthestPoint, point1Bellow, flag));
                    convexHull.push(...this.quickhull(p1, farthestPoint, point2Bellow, flag));
                }
            }
        }

        return convexHull;
    }

    protected createSegment(p0: Particle, p1: Particle, candidates: Particle[]) {
        const above: Particle[] = [];
        const bellow: Particle[] = [];

        // There is no 'above' or 'bellow' on a vertical line
        if (p1.position[0] - p0.position[0] == 0) {
            return { above, bellow };
        }

        // Calculate m and c from y = mx + c
        const m = (p1.position[1] - p0.position[1]) / (p1.position[0] - p0.position[0]);
        const c = -m * p0.position[0] + p0.position[1];

        for (const particle of candidates) {
            if (particle.position[1] > m * particle.position[0] + c) {
                above.push(particle);
            } else if (particle.position[1] < m * particle.position[0] + c) {
                bellow.push(particle);
            }
        }

        return { above, bellow };
    }

    protected pointLineDistance(p0: Particle, p1: Particle, p2: Particle): number {
        const a = p1.position[1] - p0.position[1];
        const b = p1.position[0] - p0.position[0];
        const c = p1.position[0] * p0.position[1] - p1.position[1] * p0.position[0];

        return Math.abs(a * p2.position[0] + b * p2.position[1] + c) / Math.sqrt(a * a + b * b);
    }
}
