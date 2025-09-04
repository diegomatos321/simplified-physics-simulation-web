let fs = `
precision mediump float;

// uniform sampler2D u_texture;
uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}
`

export default fs