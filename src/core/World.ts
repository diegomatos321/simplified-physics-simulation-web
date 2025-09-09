import type Entity from './Entity';
import Renderer from './Renderer';
import RigidBody from '@/physics/RigidBody';
import type Engine from './Engine';
import type EngineSat from './Engine_Sat';

export default class World {
    private entites: Entity[] = [];

    constructor(
        private renderer: Renderer,
        private engine: Engine | EngineSat,
    ) {}

    update(dt: number) {
        for (const entity of this.entites) {
            if (entity instanceof RigidBody) {
                this.engine.integrate(entity, dt);
            }
        }

        this.engine.collisionTest(this.entites);

        for (const entity of this.entites) {
            if (entity instanceof RigidBody) {
                this.engine.satisfyConstraints(entity);
            }
        }

        // Handle individual update method, case its implemented
        for (const entity of this.entites) {
            entity.update(dt);
        }
    }

    render(gl: WebGLRenderingContext) {
        this.renderer.render(gl, this.entites);
    }

    add(obj: Entity) {
        this.entites.push(obj);
    }
}
