import { vec3 } from 'gl-matrix';
import type Particle from '../Particle';
import IConstraint from './IConstraint';

export default class LinearConstraint extends IConstraint {
    constructor(p0: Particle, p1: Particle, restitution: number = 0.5) {
        super(p0, p1, restitution);

        this.relax();
    }

    relax(): void {
        if (this.isActive === false) return;

        let delta = vec3.subtract(vec3.create(), this.p1.position, this.p0.position);
        let deltalength = vec3.length(delta);
        let diff = (deltalength - this.restlength) / (deltalength * (1 / this.p0.mass + 1 / this.p1.mass));

        const vel1 = vec3.scale(vec3.create(), delta, (1 / this.p0.mass) * diff * this.restitution);
        this.p0.move(vel1);

        const vel2 = vec3.scale(vec3.create(), delta, -(1 / this.p1.mass) * diff * this.restitution);
        this.p1.move(vel2);
        // this.p0.move(
        //     twgl.v3.add(
        //         this.p0.position,
        //         twgl.v3.mulScalar(delta, (1 / this.p0.mass) * diff * this.restitution),
        //     ),
        // );
        // this.p1.move(
        //     twgl.v3.subtract(
        //         this.p1.position,
        //         twgl.v3.mulScalar(delta, (1 / this.p1.mass) * diff * this.restitution),
        //     ),
        // );
    }

    // draw(): void {
    //     if (this.isActive === false) return;

    //     const uniforms = {
    //         u_resolution: [this.gl.canvas.width, this.gl.canvas.height],
    //         u_color: [0, 0, 0, 1],
    //         // time: time * 0.001,
    //     };

    //     const p1a = [this.p0.position[0], this.p0.position[1] + 1];
    //     const p1b = [this.p0.position[0], this.p0.position[1] - 1];
    //     const p2a = [this.p1.position[0], this.p1.position[1] + 1];
    //     const p2b = [this.p1.position[0], this.p1.position[1] - 1];

    //     this.gl.useProgram(this.programInfo.program);
    //     twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs!.a_position, [
    //         ...p1a,
    //         ...p1b,
    //         ...p2a,
    //         ...p1b,
    //         ...p2b,
    //         ...p2a,
    //     ]);

    //     twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
    //     twgl.setUniforms(this.programInfo, uniforms);
    //     twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLES);
    // }
}
