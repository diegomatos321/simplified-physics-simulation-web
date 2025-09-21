import { vec3 } from 'gl-matrix';
import Body from './Body';
import Particle from './Particle';
import LinearConstraint from './constraints/LinearConstraint';
import type IConstraint from './constraints/IConstraint';

export default class TrellisBody extends Body {
    constructor(
        corner: vec3,
        size: vec3,
        protected nx: number,
        protected ny: number,
        stiff: boolean = false,
        reinforce: boolean = false,
    ) {
        let particles: Particle[] = [];
        let constraints: IConstraint[] = [];

        let dx = vec3.fromValues(size[0] / nx, 0, 0);
        let dy = vec3.fromValues(0, size[1] / ny, 0);

        let m = nx + 1;
        for (let i = 0; i <= ny; i++) {
            let q = vec3.scaleAndAdd(vec3.create(), corner, dy, i);
            for (let j = 0; j <= nx; j++) {
                let p = vec3.scaleAndAdd(vec3.create(), q, dx, j);
                particles.push(new Particle(p));

                let k = i * m + j;
                if (j > 0) constraints.push(new LinearConstraint(particles[k], particles[k - 1]));
                if (i > 0) constraints.push(new LinearConstraint(particles[k], particles[k - m]));
                if (i > 0 && j > 0 && stiff) {
                    constraints.push(new LinearConstraint(particles[k - 1], particles[k - m]), new LinearConstraint(particles[k], particles[k - m - 1]));
                }
            }
        }

        if (nx > 1 && ny > 1 && reinforce) {
            constraints.push(
                new LinearConstraint(particles[0], particles[particles.length - 1]),
                new LinearConstraint(particles[0], particles[m - 1]),
                new LinearConstraint(particles[0], particles[particles.length - m]),
                new LinearConstraint(particles[particles.length - m], particles[m - 1]),
                new LinearConstraint(particles[m - 1], particles[particles.length - 1]),
                new LinearConstraint(particles[particles.length - m], particles[particles.length - 1]),
            );
        }

        super(particles, constraints);
    }

    triangulation() {
        const uvs: [number, number][] = [];

        const cols = this.nx + 1,
            rows = this.ny + 1;
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const u = i / (cols - 1);
                const v = j / (rows - 1);
                uvs.push([u, v]);
            }
        }

        const indices: number[] = [];
        for (let j = 0; j < rows - 1; j++) {
            for (let i = 0; i < cols - 1; i++) {
                // compute indices of the 4 corners of the cell
                const v0 = j * cols + i;
                const v1 = j * cols + (i + 1);
                const v2 = (j + 1) * cols + i;
                const v3 = (j + 1) * cols + (i + 1);

                // two triangles per quad
                indices.push(v0, v1, v2); // lower-left triangle
                indices.push(v1, v3, v2); // upper-right triangle
            }
        }

        return { uvs, indices };
    }
}
