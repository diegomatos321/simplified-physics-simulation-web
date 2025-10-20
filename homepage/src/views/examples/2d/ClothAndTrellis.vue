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
                    <label for="threaded">Threaded Mode</label>
                    <input id="threaded" name="threaded" type="checkbox" v-model="threaded" />
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
import { vec3 } from 'gl-matrix';
import { type Body, PolygonBody, TrellisBody } from '@devdiegomatos/liso-engine/bodies';
import { Engine, BroadPhaseMode, CollisionDetectionMode } from '@devdiegomatos/liso-engine';
import {
    createEngineWorker,
    ObjectType,
    type MainToWorkerMessage,
    type ObjectBuilderArgs,
    type SimulationState,
    type WorkerToMainMessage,
} from '@devdiegomatos/liso-engine/worker';

// Component States
let hasStarted = false;
const totalEntities = 4;
const threaded = false;
const fps = ref(0);

// Main thread mode variables
const engine = new Engine({
    worldBoundings: {
        top: [0, 0],
        right: [600, 600],
    },
    BroadPhase: BroadPhaseMode.GridSpatialPartition,
    CollisionDetection: CollisionDetectionMode.GjkEpa,
    gravity: vec3.fromValues(0, 98, 0),
    gridSize: 40,
});
const entities: Body[] = [];

// Threaded mode variables
let worker: Worker | null = null;
let simulation_state: SimulationState = {
    objects: [],
    collidersInfo: [],
    particlesCount: 0,
    constraintsCount: 0,
    collisionsTests: 0,
};

// P5 variables
const sketchContainer = ref<HTMLDivElement | null>(null);
let sketchInstance: p5 | null = null;

onMounted(() => {
    if (!sketchContainer.value || hasStarted) return;

    hasStarted = true;

    if (sketchInstance === null) {
        const sketch = (p: p5) => {
            p.setup = () => setup(p);
            p.draw = () => loop(p);
        };

        sketchInstance = new p5(sketch);
    }

    if (threaded) {
        worker = createEngineWorker();
        worker.addEventListener('message', OnWorkerEvent);
    }
});

async function setup(p: p5) {
    if (sketchContainer.value === null) return;

    p.createCanvas(600, 600).parent(sketchContainer.value);

    if (threaded && worker) {
        const objects: ObjectBuilderArgs[] = [];

        const trelis1: ObjectBuilderArgs = {
            type: ObjectType.Trellis,
            x: 130,
            y: 200,
            width: 100,
            height: 100,
            nx: 4,
            ny: 4,
            reinforce: true,
        };

        const trelis2: ObjectBuilderArgs = {
            type: ObjectType.Trellis,
            x: 100,
            y: 450,
            width: 200,
            height: 100,
            nx: 3,
            ny: 2,
            reinforce: true,
        };

        const cloth: ObjectBuilderArgs = {
            type: ObjectType.Trellis,
            x: 250,
            y: 200,
            width: 100,
            height: 100,
            nx: 10,
            ny: 10,
        };

        const pentagonPoly: ObjectBuilderArgs = {
            type: ObjectType.Polygon,
            x: 200,
            y: 50,
            size: 100,
            k: 5,
        };

        objects.push(trelis1, trelis2, cloth, pentagonPoly);
        const msg: MainToWorkerMessage = {
            type: 'start',
            config: {
                worldBoundings: {
                    top: [0, 0],
                    right: [600, 600],
                },
                BroadPhase: BroadPhaseMode.GridSpatialPartition,
                CollisionDetection: CollisionDetectionMode.GjkEpa,
                gravity: vec3.fromValues(0, 98, 0),
                gridSize: 40,
            },
            objects,
        };
        worker.postMessage(msg);
    } else {
        const trelis1 = new TrellisBody(vec3.fromValues(130, 200, 0), vec3.fromValues(100, 100, 0), 4, 4, true, true);
        trelis1.particles[0].isStatic = true;
        // trelis1.particles[10].isStatic = true;
        engine.addBody(trelis1);
        entities.push(trelis1);

        const trelis2 = new TrellisBody(vec3.fromValues(100, 450, 0), vec3.fromValues(200, 100, 0), 3, 2, true);
        engine.addBody(trelis2);
        entities.push(trelis2);

        const cloth = new TrellisBody(vec3.fromValues(250, 200, 0), vec3.fromValues(100, 100, 0), 10, 10);
        cloth.particles[0].isStatic = true;
        cloth.particles[10].isStatic = true;
        engine.addBody(cloth);
        entities.push(cloth);

        const pentagonPoly = PolygonBody.PolygonBuilder(200, 50, 100, 5);
        engine.addBody(pentagonPoly);
        entities.push(pentagonPoly);
    }
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

    if (threaded) {
        Render_Threaded(p);
    } else {
        engine.step(p.deltaTime / 1000);

        Render_MainThread(p);
    }
}

onBeforeUnmount(() => {
    console.log('Clean up');

    if (sketchInstance) {
        sketchInstance.remove();
        sketchInstance = null;
    }

    if (worker) {
        worker.removeEventListener('message', OnWorkerEvent);
        worker.terminate();
        worker = null;
    }
});

function Render_Threaded(p: p5) {
    // Batch draw all constraints as lines
    p.stroke(0, 0, 0);
    p.strokeWeight(1);
    p.beginShape(p.LINES);
    for (const obj of simulation_state.objects) {
        if (obj.isStatic) {
            continue;
        }
        for (const ci of obj.constraintsIndices) {
            const x0 = obj.particles[ci * 2];
            const y0 = obj.particles[ci * 2 + 1];
            p.vertex(x0, y0);
        }
    }
    p.endShape();

    // Batch draw all constraints of static particles in red
    p.stroke(255, 0, 0);
    p.strokeWeight(1);
    p.beginShape(p.LINES);
    for (const obj of simulation_state.objects) {
        if (obj.isStatic === false) {
            continue;
        }
        for (const ci of obj.constraintsIndices) {
            const x0 = obj.particles[ci * 2];
            const y0 = obj.particles[ci * 2 + 1];
            p.vertex(x0, y0);
        }
    }
    p.endShape();

    // Batch draw all convex hull in blue
    p.stroke(150, 200, 255);
    p.strokeWeight(1);
    p.beginShape(p.LINES);
    for (const colliderInfo of simulation_state.collidersInfo) {
        // convex hull layout: x0, y0, x1, y1, x2, y2, ...
        const totalParticles = colliderInfo.convexHull.length / 2;
        for (let i = 0; i < totalParticles; i++) {
            const x0 = colliderInfo.convexHull[i * 2];
            const y0 = colliderInfo.convexHull[i * 2 + 1];
            p.vertex(x0, y0);

            const j = (i + 1) * 2; // next particle indice
            const x1 = colliderInfo.convexHull[j % colliderInfo.convexHull.length];
            const y1 = colliderInfo.convexHull[(j + 1) % colliderInfo.convexHull.length];
            p.vertex(x1, y1);
        }
    }
    p.endShape();

    // Batch draw all contact points in red
    p.stroke(255, 0, 0);
    p.strokeWeight(2);
    p.beginShape(p.POINTS);
    for (const colliderInfo of simulation_state.collidersInfo) {
        // Draw the contact points
        for (let i = 0; i < colliderInfo.contactPoints.length; i += 2) {
            const x0 = colliderInfo.contactPoints[i];
            const y0 = colliderInfo.contactPoints[i + 1];
            p.vertex(x0, y0);
        }
    }
    p.endShape();
}

function Render_MainThread(p: p5) {
    // Batch draw all constraints as lines
    p.stroke(0, 0, 0);
    p.strokeWeight(1);
    p.beginShape(p.LINES);
    for (const entity of entities) {
        for (const constraint of entity.constraints) {
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
}

function OnPauseCollisionBtn() {
    engine.pauseOnCollision = !engine.pauseOnCollision;
}

function OnWorkerEvent(e: MessageEvent<WorkerToMainMessage>) {
    const msg = e.data;
    if (msg.type === 'simulation_state') {
        simulation_state = msg.state;
    }
}
// function handleKeyDown(e: KeyboardEvent) {
//     if (e.code == 'Space') {
//         engine.isPaused = !engine.isPaused;
//         engine.skip = !engine.skip;
//     }
// }
</script>
