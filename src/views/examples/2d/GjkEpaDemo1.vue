<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>GJK/EPA Implementation - Demo 1 2D</strong></h1>

        <canvas ref="canvas" width="600" height="600" style="border: 1px solid black"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import TriangleBody from '@/physics/rigid_bodies/TriangleBody'
import RectangleBody from '@/physics/rigid_bodies/RectangleBody'
import PentagonBody from '@/physics/rigid_bodies/PentagonBody'
import HexagonBody from '@/physics/rigid_bodies/HexagonBody'
import type PolygonBody from '@/physics/rigid_bodies/PolygonBody'
import gjk from '@/physics/collision/gjk'
import { epa } from '@/physics/collision/epa'
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

    gl = canvas.value.getContext('webgl')
    if (!gl) {
        console.error('WebGL not supported')
        return
    }

    const startTime = Date.now()
    // Create a checkerboard texture to visualize UV mapping
    // const texture = twgl.createTexture(gl, {
    //     min: gl.NEAREST,
    //     mag: gl.NEAREST,
    //     src: [255, 100, 255, 255, 192, 192, 192, 255, 192, 192, 192, 255, 255, 100, 255, 255],
    // })
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

            const hit = gjk(body1, body2)
            if (hit) {
                body1.isOverlapping = true
                body2.isOverlapping = true
                let mvp = epa(body1, body2, hit)
                if (mvp) {
                    let edge1 = body1.getFarthestEdgeInDirection(twgl.v3.negate(mvp.normal))
                    edge1.forEach((p) => {
                        p.move(
                            twgl.v3.add(
                                p.position,
                                twgl.v3.mulScalar(twgl.v3.negate(mvp.normal), mvp.depth),
                            ),
                        )
                    })

                    let edge2 = body2.getFarthestEdgeInDirection(mvp.normal)
                    edge2.forEach((p) => {
                        p.move(twgl.v3.add(p.position, twgl.v3.mulScalar(mvp.normal, mvp.depth)))
                    })
                }
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

onBeforeUnmount(() => {
    console.log('Clean up')
    isRunning = true

    if (animationId) {
        cancelAnimationFrame(animationId)
    }
})
</script>
