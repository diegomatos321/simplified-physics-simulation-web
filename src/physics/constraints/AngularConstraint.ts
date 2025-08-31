import type Particle from '../Particle'
import IConstraint from './IConstraint'
import * as twgl from 'twgl.js'

export default class LinearConstraint extends IConstraint {
    isActive = true

    constructor(gl: WebGLRenderingContext, p0: Particle, p1: Particle, restitution = 0.5) {
        super(gl, p0, p1, restitution)

        this.relax()
    }

    relax(): void {
        if (this.isActive === false) return

        let delta = twgl.v3.subtract(this.p1.position, this.p0.position)
        let deltalength = twgl.v3.length(delta)
        if (deltalength > 30) {
            let diff =
                (deltalength - this.restlength) /
                (deltalength * (1 / this.p0.mass + 1 / this.p1.mass))
            this.p0.move(
                twgl.v3.add(
                    this.p0.position,
                    twgl.v3.mulScalar(delta, (1 / this.p0.mass) * diff * this.restitution),
                ),
            )
            this.p1.move(
                twgl.v3.subtract(
                    this.p1.position,
                    twgl.v3.mulScalar(delta, (1 / this.p1.mass) * diff * this.restitution),
                ),
            )
        }
    }

    draw(): void {}
}
