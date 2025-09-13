import { vec3 } from 'gl-matrix';
import Collider from './Collider';
import type Particle from './Particle';
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

    convexHull(): PolygonBody {
        return new PolygonBody([]);
    }
}
