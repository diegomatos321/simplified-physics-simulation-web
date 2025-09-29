<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>GJK/EPA Engine</strong></h1>
        <p>Polygons vs Polygons demo</p>

        <div class="flex">
            <div class="relative">
                <div class="absolute">FPS {{ fps }}</div>
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
import p5 from 'p5';
import RectangleBody from '@/physics/RectangleBody';
import Engine from '@/core/Engine';
import type Body from '@/physics/Body';
import PolygonBody from '@/physics/PolygonBody';
import { vec3 } from 'gl-matrix';

const sketchContainer = ref<HTMLCanvasElement | null>(null);
let sketchInstance: p5 | null = null;
let engine = new Engine({
    top: [-300, -300],
    right: [300, 300],
});
let debug = false;
let entities: { uvs: [number, number][]; indices: number[]; body: Body }[] = [];
let player: PolygonBody;
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

    player = PolygonBody.PolygonBuilder(0, 0, 50, 10);
    engine.bodies.push(player);
    const { uvs: playerUvs, indices: playerIndices } = player.triangulation();
    entities.push({
        uvs: playerUvs,
        indices: playerIndices,
        body: player,
    });

    const ground = new RectangleBody(0, 200, 300, 50);
    engine.bodies.push(ground);
    const { uvs: groundUvs, indices: groundIndices } = ground.triangulation();
    entities.push({
        uvs: groundUvs,
        indices: groundIndices,
        body: ground,
    });
}

function loop(p: p5) {
    p.background(220);

    fps.value = Math.round(p.frameRate());

    engine.step(p.deltaTime / 1000);

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
            const body = engine.bodies[colliderInfo.bodyIndex];
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

    if (e.code == 'KeyD') {
        for (const p of player.particles) {
            p.move(vec3.fromValues(1, 0, 0));
        }
    }
    if (e.code == 'KeyA') {
        for (const p of player.particles) {
            p.move(vec3.fromValues(-1, 0, 0));
        }
    }

    if (e.code == 'KeyW') {
        for (const p of player.particles) {
            p.move(vec3.fromValues(0, -1, 0));
        }
    }
}
</script>
