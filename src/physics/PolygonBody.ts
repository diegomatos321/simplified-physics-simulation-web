import { vec3 } from 'gl-matrix';
import earcut from 'earcut';
import Particle from '@/physics/Particle';
import IConstraint from '@/physics/constraints/IConstraint';
import LinearConstraint from '@/physics/constraints/LinearConstraint';
import Body from './Body';
import Projection from '@/physics/Projection';

export default class PolygonBody extends Body {
    public wireframe: boolean = false;

    constructor(particles: Particle[], restitution: number = 0.5) {
        // 1. Setup Constrains
        const constraints: IConstraint[] = [];

        // Create constraints for the outer edges
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            const p2 = particles[(i + 1) % particles.length];
            constraints.push(new LinearConstraint(p1, p2, restitution));
        }

        // Internal strut constraints for rigidity (connecting every other vertex)
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            const p2 = particles[(i + 2) % particles.length];
            constraints.push(new LinearConstraint(p1, p2));
        }
        super(particles, constraints);
    }

    static PolygonBuilder(x: number, y: number, size: number, k: number, restitution: number = 0.5) {
        const particles: Particle[] = [];
        for (let i = 0; i < k; i++) {
            const angle = (i / k) * 2 * Math.PI; // Start from right
            particles.push(new Particle(vec3.fromValues(x + size * Math.cos(angle), y + size * Math.sin(angle), 0)));
        }

        return new PolygonBody(particles, restitution);
    }

    triangulation(): { uvs: [number, number][]; indices: number[] } {
        const convexHull = this.convexHull(); // Automatic UV Generation via Bounding Box

        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        for (const particle of convexHull.particles) {
            minX = Math.min(minX, particle.position[0]);
            minY = Math.min(minY, particle.position[1]);
            maxX = Math.max(maxX, particle.position[0]);
            maxY = Math.max(maxY, particle.position[1]);
        }

        const uvs: [number, number][] = convexHull.particles.map((particle) => {
            const x = particle.position[0];
            const y = particle.position[1];

            return [(x - minX) / (maxX - minX), (y - minY) / (maxY - minY)];
        }); // Automatic Triangulation with Earcut

        const flattened_vertices = convexHull.particles.map((p) => [p.position[0], p.position[1]]).flat();

        const indices = earcut(flattened_vertices);

        return {
            uvs,
            indices,
        };
    }

    // The convex of a polygon is itself
    convexHull(): PolygonBody {
        return this;
    }

    axes(): vec3[] {
        const axes = [];
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i].position;

            const nextIndex = (i + 1) % this.particles.length;
            const p2 = this.particles[nextIndex].position;

            const edge = vec3.create();
            vec3.subtract(edge, p1, p2);
            const perp = vec3.create();
            vec3.set(perp, -edge[1], edge[0], 0); // Assumes 2D for now
            const normal = vec3.create();
            vec3.normalize(normal, perp);

            axes.push(normal);
        }

        return axes;
    }

    project(axis: vec3) {
        let min = vec3.dot(axis, this.particles[0].position);
        let max = min;

        for (let i = 1; i < this.particles.length; i++) {
            const proj = vec3.dot(axis, this.particles[i].position);
            if (proj < min) {
                min = proj;
            } else if (proj > max) {
                max = proj;
            }
        }

        return new Projection(min, max);
    }

    // Centroid of a Polygon
    getCenter(): vec3 {
        let area = 0;
        let cx = 0;
        let cy = 0;

        const n = this.particles.length;
        for (let i = 0; i < n; i++) {
            const [x0, y0] = this.particles[i].position;
            const [x1, y1] = this.particles[(i + 1) % n].position;

            const cross = x0 * y1 - x1 * y0;
            area += cross;
            cx += (x0 + x1) * cross;
            cy += (y0 + y1) * cross;
        }

        area *= 0.5;
        cx /= 6 * area;
        cy /= 6 * area;

        let result = vec3.create();
        return vec3.set(result, cx, cy, 0);
    }

    getFarthestPointInDirection(d: vec3): Particle {
        let max = Number.NEGATIVE_INFINITY;
        let best = this.particles[0];

        for (const particle of this.particles) {
            let candidate = vec3.dot(d, particle.position);
            if (candidate > max) {
                max = candidate;
                best = particle;
            }
        }

        return best;
    }

    getFarthestEdgeInDirection(d: vec3): Particle[] {
        let max = Number.NEGATIVE_INFINITY;
        let max2 = Number.NEGATIVE_INFINITY;
        let best = this.particles[0],
            best2 = this.particles[1];

        for (const particle of this.particles) {
            let candidate = vec3.dot(d, particle.position);
            if (candidate > max) {
                max2 = max;
                best2 = best;

                max = candidate;
                best = particle;
            } else if (candidate > max2) {
                max2 = candidate;
                best2 = particle;
            }
        }

        if (Math.abs(max - max2) < 0.01) {
            return [best2, best];
        }

        return [best];
    }
}
