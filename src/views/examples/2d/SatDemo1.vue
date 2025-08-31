<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>Separate Axis Theorem (Demo 1)</strong></h1>

        <canvas ref="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'

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

onMounted(() => {
    if (!canvas.value || isRunning === false) return

    gl = canvas.value.getContext('webgl')
    if (!gl) {
        console.error('WebGL not supported')
        return
    }

    isRunning = true
    animationId = requestAnimationFrame(loop)
})

function loop() {
    animationId = requestAnimationFrame(loop)
}

onBeforeMount(() => {
    isRunning = true

    if (animationId) {
        cancelAnimationFrame(animationId)
    }
})
</script>
