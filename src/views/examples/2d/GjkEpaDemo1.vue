<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>GJK/EPA Implementation - Demo 1 2D</strong></h1>

        <div ref="sketchContainer"></div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import p5 from 'p5';
import TriangleBody from '@/physics/polygons/TriangleBody';
import RectangleBody from '@/physics/polygons/RectangleBody';
import PentagonBody from '@/physics/polygons/PentagonBody';
import HexagonBody from '@/physics/polygons/HexagonBody';
import Engine from '@/core/Engine';
import type Body from '@/physics/Body';

const sketchContainer = ref<HTMLCanvasElement | null>(null);
let sketchInstance: p5 | null = null;
let engine = new Engine([600, 600]);
let bodies: Body[] = [];
let texture: p5.Image

onMounted(() => {
    if (!sketchContainer.value) return;

    const sketch = (p: p5) => {
        p.setup = () => setup(p);
        p.draw = () => draw(p);
    };

    sketchInstance = new p5(sketch);
});

async function setup(p: p5) {
    if (sketchContainer.value === null) return;

    p.createCanvas(600, 600, p.WEBGL).parent(sketchContainer.value);

    texture = await p.loadImage("/pizza-sprite.png")

    for (let i = 0; i < 10; i++) {
        const x = Math.random() * p.width - p.width/2;
        const y = Math.random() * p.height - p.height/2;

        const type = Math.random();
        let body;
        if (type <= 0.25) {
            body = new TriangleBody(x, y, 50);
        } else if (type <= 0.5) {
            body = new RectangleBody(x, y, 100, 50);
        } else if (type <= 0.75) {
            body = new PentagonBody(x, y, 50);
        } else {
            body = new HexagonBody(x, y, 50);
        }

        bodies.push(body);
    }
}

function draw(p: p5) {
    p.background(220);

    for (const body of bodies) {
        engine.integrate(body, p.deltaTime / 1000);
    }

    engine.collisionTest(bodies);

    for (const body of bodies) {
        engine.satisfyConstraints(body);
    }

    // Draw constraints
    for (const body of bodies) {
        p.texture(texture)
        p.textureMode(p.NORMAL);
        p.noStroke()
        p.beginShape(p.TRIANGLES)

        for (let i = 0; i < body.indices.length; i++) {
            const indice = body.indices[i]
            const particle = body.particles[indice];
            const uv = body.uvs[indice]
            p.vertex(particle.position[0], particle.position[1], 0, uv[0], uv[1])
        }

        p.endShape()

        p.stroke(150, 200, 255);
        p.strokeWeight(2);
        for (let constraint of body.constraints) {
            p.line(constraint.p0.position[0], constraint.p0.position[1], constraint.p1.position[0], constraint.p1.position[1]);
        }

        // Draw particles
        p.noStroke();
        p.fill(255, 100, 100);
        for (let particle of body.particles) {
            p.circle(particle.position[0], particle.position[1], 10);
        }
    }
}

onBeforeUnmount(() => {
    console.log('Clean up');
    // isRunning = false;

    // if (animationId) {
    //     cancelAnimationFrame(animationId);
    // }

    if (sketchInstance) {
        sketchInstance.remove();
        sketchInstance = null;
    }
});
</script>
