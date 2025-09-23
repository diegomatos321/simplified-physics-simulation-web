import { vec3 } from 'gl-matrix';
import Collider from './Collider';
import Particle from './Particle';
import type IConstraint from './constraints/IConstraint';

export default abstract class Body {
    public colliders: Collider[] = [];

    // cache convex hull
    public _convexHull: Particle[] | null = null;

    constructor(
        public particles: Particle[] = [],
        public constraints: IConstraint[] = [],
    ) {}

    abstract triangulation(): {
        uvs: [number, number][];
        indices: number[];
    };

    // Compute the convex hull of the body using quickhull algorithm
    convexHull(): Particle[] {
        if (this._convexHull) {
            return this._convexHull;
        }

        // The convex hull is not defined by less than 3 points
        if (this.particles.length < 3) {
            return this.particles;
        }

        const candidates: Particle[] = this.particles.slice(); // A reference copy of the particles objects

        // 1. Find the extreme points
        let pmin: Particle = this.particles[0],
            pmax: Particle = this.particles[0];
        let imin: number = 0,
            imax: number = 0;
        for (let i = 1; i < candidates.length; i++) {
            const particle = candidates[i];
            if (particle.position[0] < pmin.position[0]) {
                pmin = particle;
                imin = i;
            } else if (particle.position[0] > pmax.position[0]) {
                pmax = particle;
                imax = i;
            }
        }

        // 2. Se todos são colineares: retornar potnos ordenados ao longo da linha
        // ex: caso em que o corpo colapse formando uma linha
        let allColinear = true;
        for (const p of candidates) {
            const ab = vec3.subtract(vec3.create(), pmax.position, pmin.position);
            const ap = vec3.subtract(vec3.create(), p.position, pmin.position);
            const cross = vec3.cross(vec3.create(), ab, ap);
            if (Math.abs(vec3.length(cross)) > 1e-12) {
                allColinear = false;
                break;
            }
        }
        if (allColinear) {
            // ordenar por x então y e retornar extremos
            const sorted = candidates.slice().sort((a, b) => a.position[0] - b.position[0] || a.position[1] - b.position[1]);
            // retorne linha de um extremo ao outro (não repetir)
            return [sorted[0], sorted[sorted.length - 1]];
        }

        //  3. Init hull with pmin and pmax
        const convexHull: Particle[] = [pmin, pmax];
        // After the splice call the indices shift, you must remove the elements
        // in descending index order
        const maxIndex = Math.max(imin, imax);
        const minIndex = Math.min(imin, imax);
        candidates.splice(maxIndex, 1);
        candidates.splice(minIndex, 1);

        // 3. Divide the candidates into above and bellow the line
        const above: Particle[] = [];
        const bellow: Particle[] = [];
        for (const particle of candidates) {
            const d = this.distancePointToLine(pmin, pmax, particle);
            if (d > 0) {
                above.push(particle);
            } else {
                bellow.push(particle);
            }
        }
        this.quickhull(pmin, pmax, above, convexHull);
        this.quickhull(pmin, pmax, bellow, convexHull);

        this._convexHull = convexHull;
        return convexHull;
    }

    protected quickhull(p0: Particle, p1: Particle, candidates: Particle[], hull: Particle[]) {
        // 4. Find the most distance point from the line
        let farthestDistance = -Infinity;
        let farthestPoint: Particle | null = null;
        let pointIndex = -1;
        for (let i = 0; i < candidates.length; i++) {
            const particle = candidates[i];
            const d = this.distancePointToLine(p0, p1, particle);
            if (d > farthestDistance) {
                farthestPoint = particle;
                pointIndex = i;
            }
        }

        if (farthestPoint === null) return;

        const insertIndex = hull.findIndex((pt) => pt === p1);
        if (insertIndex >= 0) {
            hull.splice(insertIndex, 0, farthestPoint);
        }

        // 5. Divide the candidates from lines (p0, farthestPoint) and (p1, farthestPoint)
        // We can ignore the points inside the triangle formed by: p0, p1, farthestPoint
        // The bellows checks of farthestPoint and candidatesLength avoid the next recursive call
        const set1: Particle[] = [];
        const set2: Particle[] = [];
        for (const p of candidates) {
            if (this.distancePointToLine(p0, farthestPoint, p) > 0) {
                set1.push(p);
            } else if (this.distancePointToLine(farthestPoint, p1, p)) {
                set2.push(p);
            }
        }

        this.quickhull(p0, farthestPoint, set1, hull);
        this.quickhull(farthestPoint, p1, set2, hull);
    }

    // distância perpendicular do ponto p à linha ab
    protected distancePointToLine(a: Particle, b: Particle, p: Particle) {
        // cross of (b - a) x (c - a)
        const ab = vec3.subtract(vec3.create(), b.position, a.position);
        const ap = vec3.subtract(vec3.create(), p.position, a.position);
        const cross = vec3.cross(vec3.create(), ab, ap);
        return cross[2];
    }
}
