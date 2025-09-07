export default interface Entity {
    update(dt: number): void;
    draw(gl: WebGLRenderingContext): void;
}
