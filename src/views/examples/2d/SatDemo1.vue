<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>SAT Implementation - Demo 1</strong></h1>

        <canvas ref="canvas" width="600" height="600" style="border: 1px solid black"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import TriangleBody from '@/physics/polygons/TriangleBody';
import RectangleBody from '@/physics/polygons/RectangleBody';
import PentagonBody from '@/physics/polygons/PentagonBody';
import HexagonBody from '@/physics/polygons/HexagonBody';
import * as twgl from 'twgl.js';
import World from '@/core/World';
import Renderer from '@/core/Renderer';
import EngineSat from '@/core/Engine_Sat';

const canvas = ref<HTMLCanvasElement | null>(null);
let gl: WebGLRenderingContext | null = null;

let isRunning = false;
let animationId: number;

let world: World;
let lastTime = 0,
    deltaTime = 0;

onMounted(async () => {
    if (!canvas.value) return;

    gl = canvas.value.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    world = new World(new Renderer(gl), new EngineSat([gl.canvas.width, gl.canvas.height]));

    const { texture } = await twgl.createTextureAsync(gl, {
        src: '/pizza-sprite.png',
        min: gl.NEAREST,
        mag: gl.NEAREST,
    });

    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.value.width;
        const y = Math.random() * canvas.value.height;

        const type = Math.random();
        let body;
        if (type <= 0.25) {
            body = new TriangleBody(gl, x, y, 50, texture);
        } else if (type <= 0.5) {
            body = new RectangleBody(gl, x, y, 100, 50, texture);
        } else if (type <= 0.75) {
            body = new PentagonBody(gl, x, y, 50, texture);
        } else {
            body = new HexagonBody(gl, x, y, 50, texture);
        }

        world.add(body);
        console.log(body);
    }

    lastTime = performance.now();
    isRunning = true;
    animationId = requestAnimationFrame(loop);
});

function loop(time: number = 0) {
    if (gl === null || isRunning === false || world === undefined) {
        return;
    }

    deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    world.update(deltaTime);
    world.render(gl);

    animationId = requestAnimationFrame(loop);
}

onBeforeUnmount(() => {
    console.log('Clean up');
    isRunning = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});
</script>
