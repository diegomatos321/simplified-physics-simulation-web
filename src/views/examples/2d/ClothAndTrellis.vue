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
            <h1 class="text-3xl"><strong>Tecido e Treliças</strong></h1>
        </div>

        <div class="w-full flex flex-col md:flex-row gap-6">
            <div class="md:w-2/3" ref="sketchContainer"></div>
            <div class="md:w-1/3 border border-slate-200 rounded p-4 space-y-2">
                <div class="flex justify-between">
                    <p>FPS</p>
                    <p>{{ fps }}</p>
                </div>
                <div class="flex justify-between">
                    <p>Entities</p>
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
                    <input id="pauseOnCollision" name="pauseOnCollision" type="checkbox" v-bind:value="engine.pauseOnCollision" @click="OnPauseCollisionBtn" />
                </div>

                <div class="flex justify-between">
                    <label for="broadPhaseMode">Broad Phase</label>
                    <select style="max-width: 100px" name="broadPhaseMode" id="broadPhaseMode" class="border border-slate-200 rounded">
                        <option value="gridSpatialPartition">Grid Spatial Partition</option>
                        <option value="naive">Naive</option>
                    </select>
                </div>

                <div class="flex justify-between">
                    <label for="collisionDetectionMode">Collision Detection</label>
                    <select style="max-width: 100px" name="collisionDetectionMode" id="collisionDetectionMode" class="border border-slate-200 rounded">
                        <option value="gjk">GJK/EPA</option>
                        <option value="sat">Sat</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import p5 from 'p5';
import type Body from '@/physics/Body';
import PolygonBody from '@/physics/PolygonBody';
import TrellisBody from '@/physics/TrellisBody';
import Engine, { BroadPhaseMode, CollisionDetectionMode } from '@/core/Engine';
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
let debug = true;
let entities: { uvs: [number, number][]; indices: number[]; body: Body }[] = [];
let texture: p5.Image;
const totalEntities = 50;
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

    p.createCanvas(600, 600).parent(sketchContainer.value);

    texture = await p.loadImage('/pizza-sprite.png');

    let trelis1 = new TrellisBody(vec3.fromValues(130, 200, 0), vec3.fromValues(100, 100, 0), 4, 4, true, true);
    trelis1.particles[0].isStatic = true;
    // trelis1.particles[10].isStatic = true;
    const triangulation1 = trelis1.triangulation();
    engine.addBody(trelis1);
    entities.push({
        uvs: triangulation1.uvs,
        indices: triangulation1.indices,
        body: trelis1,
    });

    let trelis2 = new TrellisBody(vec3.fromValues(100, 450, 0), vec3.fromValues(200, 100, 0), 3, 2, true);
    const triangulation2 = trelis2.triangulation();
    engine.addBody(trelis2);
    entities.push({
        uvs: triangulation2.uvs,
        indices: triangulation2.indices,
        body: trelis2,
    });

    let cloth = new TrellisBody(vec3.fromValues(250, 200, 0), vec3.fromValues(100, 100, 0), 10, 10);
    cloth.particles[0].isStatic = true;
    cloth.particles[10].isStatic = true;
    const triangulation4 = cloth.triangulation();
    engine.addBody(cloth);
    entities.push({
        uvs: triangulation4.uvs,
        indices: triangulation4.indices,
        body: cloth,
    });

    const pentagonPoly = PolygonBody.PolygonBuilder(200, 50, 100, 5);
    const triangulation3 = pentagonPoly.triangulation();
    engine.addBody(pentagonPoly);
    entities.push({
        uvs: triangulation3.uvs,
        indices: triangulation3.indices,
        body: pentagonPoly,
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
    engine.step(dtMs);
    // const substeps = 5;
    // for (let i = 0; i < substeps; i++) {
    //     engine.step(dtMs / substeps);
    // }

    if (debug) {
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
