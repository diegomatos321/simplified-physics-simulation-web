<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>GJK/EPA Implementation - Demo 1 2D</strong></h1>

        <canvas ref="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'
import PolygonBody from '@/geometry/PolygonBody'
import gjk from '@/physics/collision/gjk'
import { epa } from '@/physics/collision/epa'
import * as twgl from 'twgl.js'

const canvas = ref<HTMLCanvasElement | null>(null)
let gl: WebGLRenderingContext | null = null

let isRunning = false
let animationId: number

const vs = `
attribute vec2 a_position;

uniform vec2 u_resolution;

void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1,-1), 0, 1);
    gl_PointSize = 5.0;
}
`

const fs = `
precision mediump float;

// uniform sampler2D u_texture;
uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}
`

let bodies: PolygonBody[] = []
let lastTime = 0,
    deltaTime = 0

onMounted(() => {
    if (!canvas.value || isRunning === false) return

    gl = canvas.value.getContext('webgl')
    if (!gl) {
        console.error('WebGL not supported')
        return
    }

    const startTime = Date.now()

    const body1 = new PolygonBody(gl, [
        [200, 100],
        [250, 100],
        [250, 150],
        [200, 150],
    ])
    const body2 = new PolygonBody(gl, [
        [140, 101],
        [210, 100],
        [160, 150],
    ])
    bodies.push(body1, body2)

    lastTime = Date.now() - startTime
    isRunning = true
    animationId = requestAnimationFrame(loop)
})

function loop(time: number) {
    if (gl === null) {
        return
    }

    deltaTime = (time - lastTime) / 1000
    lastTime = time

    for (const body of bodies) {
        body.update(deltaTime)
    }

    const hit = CollisionDetection_Gjk(body1, body2)
    if (hit) {
        body1.isOverlapping = true
        let mvp = epa(body1, body2, hit)

        let edge1 = body1.getFarthestEdgeInDirection(twgl.v3.negate(mvp.normal))
        edge1.forEach((p) => {
            p.move(
                twgl.v3.add(p.position, twgl.v3.mulScalar(twgl.v3.negate(mvp.normal), mvp.depth)),
            )
        })

        let edge2 = body2.getFarthestEdgeInDirection(mvp.normal)
        edge2.forEach((p) => {
            p.move(twgl.v3.add(p.position, twgl.v3.mulScalar(mvp.normal, mvp.depth)))
        })
    } else {
        body1.isOverlapping = false
    }

    // Rendering
    twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    for (const body of bodies) {
        body.draw()
    }

    animationId = requestAnimationFrame(loop)
}

onBeforeMount(() => {
    isRunning = true

    if (animationId) {
        cancelAnimationFrame(animationId)
    }
})
</script>
