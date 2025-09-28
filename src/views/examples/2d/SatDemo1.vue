<style>
canvas {
    will-change: transform;
    transform: translateZ(0);
}
</style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>SAT Engine</strong></h1>
        <p>Polygons vs Polygons demo</p>

        <div class="flex">
            <div class="relative">
                <div class="absolute">
                    <p>FPS {{ fps }}</p>
                </div>
                <div ref="sketchContainer"></div>
            </div>
            <div>
                <div>
                    <label for="debug">Debug Mode</label>
                    <input id="debug" name="debug" type="checkbox" v-model="debug" />
                </div>

                <div>
                    <label for="pauseOnCollision">Pause on Collision</label>
                    <input id="pauseOnCollision" name="pauseOnCollision" type="checkbox" v-bind:value="engine.pauseOnCollision" @click="OnPauseCollisionBtn" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { vec3 } from 'gl-matrix';
import p5 from 'p5';
import type Body from '@/physics/Body';
import PolygonBody from '@/physics/PolygonBody';
import TriangleBody from '@/physics/TriangleBody';
import RectangleBody from '@/physics/RectangleBody';
import Engine, { Mode } from '@/core/Engine';

const sketchContainer = ref<HTMLCanvasElement | null>(null);
let sketchInstance: p5 | null = null;
let engine = new Engine(
    {
        top: [-300, -300],
        right: [300, 300],
    },
    Mode.Sat,
);
let debug = true;
let entities: { uvs: [number, number][]; indices: number[]; body: Body }[] = [];
let texture: p5.Image;
const fps = ref(0);

onMounted(() => {
    if (!sketchContainer.value) return;

    const sketch = (p: p5) => {
        p.setup = () => setup(p);
        p.draw = () => loop(p);
    };

    sketchInstance = new p5(sketch);
    window.addEventListener('keydown', handleKeyDown);
});

async function setup(p: p5) {
    if (sketchContainer.value === null) return;

    p.createCanvas(600, 600, p.WEBGL).parent(sketchContainer.value);

    texture = await p.loadImage('/pizza-sprite.png');

    for (let i = 0; i < 50; i++) {
        const x = Math.random() * p.width - p.width / 2;
        const y = Math.random() * p.height - p.height / 2;

        const type = Math.random();
        let body;
        if (type <= 0.25) {
            body = new TriangleBody(x, y, 20);
        } else if (type <= 0.5) {
            body = new RectangleBody(x, y, 20, 15);
        } else if (type <= 0.75) {
            body = PolygonBody.PolygonBuilder(x, y, 20, 5);
        } else {
            body = PolygonBody.PolygonBuilder(x, y, 20, 6);
        }

        engine.bodies.push(body);
        const { uvs, indices } = body.triangulation();
        entities.push({
            uvs,
            indices,
            body,
        });
    }
}

function loop(p: p5) {
    p.background(220);

    fps.value = Math.round(p.frameRate());

    engine.step(p.deltaTime / 1000);

    if (debug) {
        // Batch all line draw constraints
        p.stroke(0, 0, 0);
        p.strokeWeight(1);
        p.beginShape(p.LINES);
        for (const entity of entities) {
            for (const constraint of entity.body.constraints) {
                // p.line(constraint.p0.position[0], constraint.p0.position[1], constraint.p1.position[0], constraint.p1.position[1]);
                p.vertex(constraint.p0.position[0], constraint.p0.position[1]);
                p.vertex(constraint.p1.position[0], constraint.p1.position[1]);
            }
        }
        p.endShape();

        // Batch draw all convex hull in blue
        p.stroke(150, 200, 255);
        p.strokeWeight(1);
        p.beginShape(p.LINES);
        for (const colliderInfo of engine.collidersInfo) {
            const body = engine.bodies[colliderInfo.bodyIndex];
            const convexHull = body.convexHull();

            for (let i = 0; i < convexHull.particles.length; i++) {
                const v1 = convexHull.particles[i];
                const v2 = convexHull.particles[(i + 1) % convexHull.particles.length];
                // p.line(v1.position[0], v1.position[1], v2.position[0], v2.position[1]);
                p.vertex(v1.position[0], v1.position[1]);
                p.vertex(v2.position[0], v2.position[1]);
            }
        }
        p.endShape();

        // Batch draw all contact points in red
        p.stroke(255, 0, 0);
        p.strokeWeight(2);
        p.beginShape(p.POINTS);
        for (const colliderInfo of engine.collidersInfo) {
            // Draw object convex hull in blue
            const body = engine.bodies[colliderInfo.bodyIndex];
            const convexHull = body.convexHull();

            // Draw the contact points and normal direction
            // let edge = convexHull.getFarthestEdgeInDirection(vec3.negate(vec3.create(), colliderInfo.collider.normal));
            for (const particle of colliderInfo.contactPoints) {
                // p.point(particle.position[0], particle.position[1]);
                p.vertex(particle.position[0], particle.position[1]);

                // Draw direction of separation
                // p.stroke(255, 0, 0);
                // p.strokeWeight(1);

                // const delta = vec3.scale(vec3.create(), colliderInfo.normal, 20);
                // const p2 = vec3.add(vec3.create(), particle.position, delta);
                // p.line(particle.position[0], particle.position[1], p2[0], p2[1]);
            }
        }
        p.endShape();
    } else {
        for (const entity of entities) {
            p.texture(texture);
            p.textureMode(p.NORMAL);
            p.noStroke();
            p.beginShape(p.TRIANGLES);

            for (let i = 0; i < entity.indices.length; i++) {
                const indice = entity.indices[i];
                const particle = entity.body.particles[indice];
                const uv = entity.uvs[indice];
                p.vertex(particle.position[0], particle.position[1], 0, uv[0], uv[1]);
            }

            p.endShape();
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

    window.removeEventListener('keydown', handleKeyDown);
});

function OnPauseCollisionBtn() {
    engine.pauseOnCollision = !engine.pauseOnCollision;
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.code == 'Space') {
        engine.isPaused = !engine.isPaused;
        engine.skip = !engine.skip;
    }
}
</script>
