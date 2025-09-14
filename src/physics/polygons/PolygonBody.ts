import Particle from '@/physics/Particle';
import IConstraint from '@/physics/constraints/IConstraint';
import LinearConstraint from '@/physics/constraints/LinearConstraint';
import Projection from '@/physics/Projection';
import Body from '../Body';
import earcut from 'earcut';
import { vec3 } from 'gl-matrix';

export default class PolygonBody extends Body {
    public wireframe: boolean = false;

    constructor(vertex_positions: number[][], restitution: number = 0.5) {
        // 1. Setup Particles and Constraints (Physics)
        const particles = vertex_positions.map((v) => new Particle(vec3.fromValues(v[0], v[1], 0)));
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
        super(particles, constraints, restitution);
    }

    // draw(gl: WebGLRenderingContext) {
    //     if (this.wireframe === true) {
    //         super.draw(gl);
    //     } else {
    //         const flattened_vertices = this.particles
    //             .map((p) => [p.position[0], p.position[1]])
    //             .flat();

    //         this.mesh.updateBufferInfo(gl, 'a_position', flattened_vertices);
    //         this.mesh.draw(gl);
    //     }
    // }

    // The convex of a polygon is itself
    convexHull(): Particle[] {
        return this.particles;
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
