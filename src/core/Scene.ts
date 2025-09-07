import type { Renderable } from './Mesh'

export default class Scene {
    private objects: Renderable[] = []
    constructor() {}

    add(obj: Renderable) {
        this.objects.push(obj)
    }

    render(gl: WebGLRenderingContext) {
        for (const obj of this.objects) {
            obj.draw(gl)
        }
    }
}
