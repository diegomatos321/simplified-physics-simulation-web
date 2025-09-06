<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>Separate Axis Theorem 2D - Demo 1</strong></h1>

        <canvas ref="canvas" width="600" height="600"></canvas>
    </div>
</template>

<script setup lang="ts">
import TriangleBody from '@/physics/rigid_bodies/TriangleBody'
import RectangleBody from '@/physics/rigid_bodies/RectangleBody'
import PentagonBody from '@/physics/rigid_bodies/PentagonBody'
import HexagonBody from '@/physics/rigid_bodies/HexagonBody'
import type PolygonBody from '@/physics/rigid_bodies/PolygonBody'
import sat from '@/physics/collision/sat'
import { onBeforeMount, onMounted, ref } from 'vue'
import * as twgl from 'twgl.js'

const canvas = ref<HTMLCanvasElement | null>(null)
let gl: WebGLRenderingContext | null = null

let isRunning = false
let animationId: number

let bodies: PolygonBody[] = []
let lastTime = 0,
    deltaTime = 0

onMounted(() => {
    if (!canvas.value) return

    const startTime = Date.now()

    gl = canvas.value.getContext('webgl')
    if (!gl) {
        console.error('WebGL not supported')
        return
    }

    const texture = twgl.createTexture(gl, {
        src: '/pizza-sprite.png',
        min: gl.NEAREST,
        mag: gl.NEAREST,
    })

    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.value.width
        const y = Math.random() * canvas.value.height

        const type = Math.random()
        let body
        if (type <= 0.25) {
            body = new TriangleBody(gl, x, y, 50, texture)
        } else if (type <= 0.5) {
            body = new RectangleBody(gl, x, y, 100, 50, texture)
        } else if (type <= 0.75) {
            body = new PentagonBody(gl, x, y, 50, texture)
        } else {
            body = new HexagonBody(gl, x, y, 50, texture)
        }

        bodies.push(body)
    }

    lastTime = Date.now() - startTime
    isRunning = true
    animationId = requestAnimationFrame(loop)
})

function loop(time: number = 0) {
    if (gl === null || isRunning === false) {
        return
    }

    deltaTime = (time - lastTime) / 1000
    lastTime = time

    for (const body of bodies) {
        body.update(deltaTime)
    }

    for (let i = 0; i < bodies.length; i++) {
        const body1 = bodies[i]
        for (let j = 0; j < bodies.length; j++) {
            if (i == j) continue

            const body2 = bodies[j]

            const hit = sat(body1, body2)
            if (hit) {
                body1.isOverlapping = true
                body2.isOverlapping = true

                let edge1 = body1.getFarthestEdgeInDirection(twgl.v3.negate(hit.normal))
                edge1.forEach((p) => {
                    p.move(
                        twgl.v3.add(
                            p.position,
                            // twgl.v3.negate(hit.normal)
                            twgl.v3.mulScalar(twgl.v3.negate(hit.normal), deltaTime),
                        ),
                    )
                })

                let edge2 = body2.getFarthestEdgeInDirection(hit.normal)
                edge2.forEach((p) => {
                    p.move(twgl.v3.add(p.position, twgl.v3.mulScalar(hit.normal, deltaTime)))
                })
            } else {
                body1.isOverlapping = false
                body2.isOverlapping = false
            }
        }
    }

    // Rendering
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

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
