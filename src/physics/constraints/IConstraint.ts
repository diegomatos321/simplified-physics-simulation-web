import * as twgl from 'twgl.js';
import type Particle from '../Particle';

export default abstract class IConstraint {
    public p0: Particle;
    public p1: Particle;
    public isActive: boolean = true;
    public restitution: number;
    public restlength: number;

    protected gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, p0: Particle, p1: Particle, restitution: number = 0.5) {
        this.gl = gl;
        this.p0 = p0;
        this.p1 = p1;

        this.restlength = twgl.v3.distance(p0.position, p1.position);
        this.restitution = restitution;
    }

    abstract relax(): void;
    abstract draw(): void;
}
