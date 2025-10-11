<style>
canvas {
    border-radius: 12px;
    width: 100% !important;
    height: 100% !important;
}
</style>

<template>
    <div style="max-width: 1000px" class="mx-auto space-y-4">
        <div>
            <h1 class="text-3xl"><strong>Gravity and Stack</strong></h1>
            <p>Click to spawn a random Polygon</p>
        </div>

        <div class="w-full flex flex-col md:flex-row gap-6">
            <div class="md:w-2/3" ref="sketchContainer"></div>
            <div class="md:w-1/3 border border-slate-200 rounded p-4 space-y-2">
                <div class="flex justify-between">
                    <p>FPS</p>
                    <p>{{ fps }}</p>
                </div>
                <div class="flex justify-between">
                    <label for="totalEntities">Entities</label>
                    <p>{{ totalEntities }}</p>
                </div>
                <div class="flex justify-between">
                    <p>Particles</p>
                    <p>{{ engine.particlesCount }}</p>
                </div>
                <div class="flex justify-between">
                    <p>Constraints</p>
                    <p>{{ engine.constraintsCount }}</p>
                </div>
                <div class="flex justify-between">
                    <p>Collision Tests</p>
                    <p>{{ engine.collisionsTests }}</p>
                </div>

                <hr class="my-4 border-slate-200" />
                <div class="flex justify-between">
                    <label for="debug">Debug Mode</label>
                    <input id="debug" name="debug" type="checkbox" v-model="debug" />
                </div>

                <div class="flex justify-between">
                    <label for="pauseOnCollision">Pause on Collision</label>
                    <input id="pauseOnCollision" name="pauseOnCollision" type="checkbox" v-model="engine.pauseOnCollision" @click="OnPauseCollisionBtn" />
                </div>

                <div class="flex justify-between">
                    <label for="broadPhaseMode">Broad Phase</label>
                    <select
                        style="max-width: 100px"
                        name="broadPhaseMode"
                        id="broadPhaseMode"
                        v-model="engine.config.BroadPhase"
                        class="border border-slate-200 rounded"
                    >
                        <option value="0">Naive</option>
                        <option value="1">Grid Spatial Partition</option>
                    </select>
                </div>

                <div class="flex justify-between">
                    <label for="collisionDetectionMode">Collision Detection</label>
                    <select
                        style="max-width: 100px"
                        name="collisionDetectionMode"
                        id="collisionDetectionMode"
                        v-model="engine.config.CollisionDetection"
                        class="border border-slate-200 rounded"
                    >
                        <option value="0">GJK/EPA</option>
                        <option value="1">Sat</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import p5 from 'p5';
import { type Body, PolygonBody, TriangleBody, RectangleBody } from '@devdiegomatos/liso-engine/bodies';
import { Engine, BroadPhaseMode, CollisionDetectionMode } from '@devdiegomatos/liso-engine';
import { vec3 } from 'gl-matrix';

const sketchContainer = ref<HTMLDivElement | null>(null);
let sketchInstance: p5 | null = null;
let engine = new Engine({
    worldBoundings: {
        top: [0, 0],
        right: [600, 600],
    },
    BroadPhase: BroadPhaseMode.GridSpatialPartition,
    CollisionDetection: CollisionDetectionMode.GjkEpa,
    gravity: vec3.fromValues(0, 98, 0),
    gridSize: 40,
});
let debug = true,
    hasStarted = false;
let entities: { uvs: [number, number][]; indices: number[]; body: Body }[] = [];
let texture: p5.Image;
let totalEntities = 0;
const fps = ref(0);

onMounted(() => {
    if (!sketchContainer.value) return;

    hasStarted = true;
    const sketch = (p: p5) => {
        p.setup = () => setup(p);
        p.draw = () => loop(p);
    };

    sketchInstance = new p5(sketch);
    window.addEventListener('keydown', handleKeyDown);
    sketchContainer.value.addEventListener('pointerdown', handlePointerDown);
});

async function setup(p: p5) {
    if (sketchContainer.value === null) return;

    p.createCanvas(600, 600).parent(sketchContainer.value);

    texture = await p.loadImage('/pizza-sprite.png');

    const body = new RectangleBody(300, 550, 450, 50, true);
    engine.addBody(body);
    const { uvs, indices } = body.triangulation();
    entities.push({
        uvs,
        indices,
        body,
    });
}

function loop(p: p5) {
    p.background('#ffffff');

    // Draw grid
    p.push();
    p.stroke('#e0e0e0');
    p.strokeWeight(1);

    // linhas verticais
    for (let x = 0; x <= p.width; x += engine.config.gridSize) {
        p.line(x + 0.5, 0, x + 0.5, p.height); // 0.5 corrige artefatos de subpixel
    }

    // linhas horizontais
    for (let y = 0; y <= p.height; y += engine.config.gridSize) {
        p.line(0, y + 0.5, p.width, y + 0.5);
    }

    p.pop();

    fps.value = Math.round(p.frameRate());

    const dtMs = p.deltaTime / 1000;
    const substeps = 5;
    for (let i = 0; i < substeps; i++) {
        engine.step(dtMs / substeps);
    }

    if (debug) {
        // Batch draw all constraints as lines
        p.stroke(0, 0, 0);
        p.strokeWeight(1);
        p.beginShape(p.LINES);
        for (const entity of entities) {
            for (const constraint of entity.body.constraints) {
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
            // const body = engine.bodies[colliderInfo.bodyIndex];
            const body = colliderInfo.body;
            const convexHull = body.convexHull();

            for (let i = 0; i < convexHull.particles.length; i++) {
                const v1 = convexHull.particles[i];
                const v2 = convexHull.particles[(i + 1) % convexHull.particles.length];
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
            // Draw the contact points and normal direction
            for (const particle of colliderInfo.contactPoints) {
                p.vertex(particle.position[0], particle.position[1]);
            }
        }
        p.endShape();

        // Batch draw all separation normals in red
        p.stroke(255, 0, 0);
        p.strokeWeight(1);
        p.beginShape(p.LINES);
        for (const colliderInfo of engine.collidersInfo) {
            for (const particle of colliderInfo.contactPoints) {
                const delta = vec3.scale(vec3.create(), colliderInfo.normal, 5);
                const p2 = vec3.add(vec3.create(), particle.position, delta);
                p.vertex(particle.position[0], particle.position[1]);
                p.vertex(p2[0], p2[1]);
            }
        }
        p.endShape();
    } else {
        p.texture(texture);
        p.textureMode(p.NORMAL);
        p.noStroke();
        p.beginShape(p.TRIANGLES);
        for (const entity of entities) {
            for (let i = 0; i < entity.indices.length; i++) {
                const indice = entity.indices[i];
                const particle = entity.body.particles[indice];
                const uv = entity.uvs[indice];
                p.vertex(particle.position[0], particle.position[1], 0, uv[0], uv[1]);
            }
        }
        p.endShape();
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
    sketchContainer.value?.removeEventListener('pointerdown', handlePointerDown);
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

function handlePointerDown(e: PointerEvent) {
    if (sketchContainer.value === null) {
        return;
    }
    const containerRect = sketchContainer.value?.getBoundingClientRect();

    const x = e.clientX - containerRect?.left;
    const y = e.clientY - containerRect?.top;

    const type = Math.random();
    const size = 40;
    let body;
    if (type <= 0.25) {
        body = new TriangleBody(x, y, size);
    } else if (type <= 0.5) {
        body = new RectangleBody(x, y, size, size / 2);
    } else if (type <= 0.75) {
        body = PolygonBody.PolygonBuilder(x, y, size, 5);
    } else {
        body = PolygonBody.PolygonBuilder(x, y, size, 6);
    }

    engine.addBody(body);
    const { uvs, indices } = body.triangulation();
    entities.push({
        uvs,
        indices,
        body,
    });
}
</script>
