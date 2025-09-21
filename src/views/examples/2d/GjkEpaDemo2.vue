<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>GJK/EPA Implementation</strong></h1>
        <p>Trelis body vs Polygon demo</p>

        <div class="flex">
            <div class="relative">
                <div class="absolute">
                    <p>FPS: {{ fps }}</p>
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
                    <input id="pauseOnCollision" name="pauseOnCollision" type="checkbox" v-model="pauseOnCollision" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import p5 from 'p5';
import Engine from '@/core/Engine';
import PolygonBody from '@/physics/polygons/PolygonBody';
import Body from '@/physics/Body';
import { vec3 } from 'gl-matrix';
import PentagonBody from '@/physics/polygons/PentagonBody';
import TrellisBody from '@/physics/TrellisBody';

const sketchContainer = ref<HTMLCanvasElement | null>(null);
let sketchInstance: p5 | null = null;
let engine = new Engine([600, 600]);
let debug = true,
    pauseOnCollision = false;
let entities: { uvs: number[][]; indices: number[]; body: Body }[] = [];
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

    let trelis1 = new TrellisBody(vec3.fromValues(-50, 0, 0), vec3.fromValues(100, 100, 0), 4, 4, true, true);
    trelis1.particles[0].pinned = true;
    // trelis1.particles[10].pinned = true;
    const triangulation1 = trelis1.triangulation();
    engine.bodies.push(trelis1);
    entities.push({
        uvs: triangulation1.uvs,
        indices: triangulation1.indices,
        body: trelis1,
    });

    let trelis2 = new TrellisBody(vec3.fromValues(-50, 200, 0), vec3.fromValues(200, 100, 0), 3, 2, true);
    const triangulation2 = trelis2.triangulation();
    engine.bodies.push(trelis2);
    entities.push({
        uvs: triangulation2.uvs,
        indices: triangulation2.indices,
        body: trelis2,
    });
    console.log(entities[entities.length - 1]);

    const pentagonPoly = new PentagonBody(0, -100, 50);
    const triangulation3 = pentagonPoly.triangulation();
    engine.bodies.push(pentagonPoly);
    entities.push({
        uvs: triangulation3.uvs,
        indices: triangulation3.indices,
        body: pentagonPoly,
    });
}

function loop(p: p5) {
    p.background(220);

    // show fps
    fps.value = Math.round(p.frameRate());

    engine.step(p.deltaTime / 1000);

    for (const entity of entities) {
        if (debug) {
            // Draw constraints
            p.stroke(0, 0, 0);
            p.strokeWeight(1);
            for (const constraint of entity.body.constraints) {
                p.line(constraint.p0.position[0], constraint.p0.position[1], constraint.p1.position[0], constraint.p1.position[1]);
            }

            // Draw particles
            p.noStroke();
            p.fill(0, 0, 255);
            for (const particle of entity.body.particles) {
                if (particle.pinned) {
                    p.stroke(255, 0, 0);
                    p.strokeWeight(5);
                    p.point(particle.position[0], particle.position[1]);
                }
            }

            for (const collider of entity.body.colliders) {
                // Draw body convex shape
                p.stroke(150, 200, 255);
                p.strokeWeight(1);
                const convexHull = entity.body.convexHull();
                for (let i = 0; i < convexHull.length; i++) {
                    const v1 = convexHull[i];
                    const v2 = convexHull[(i + 1) % convexHull.length];
                    p.line(v1.position[0], v1.position[1], v2.position[0], v2.position[1]);
                }

                const bodyHull = new PolygonBody([]);
                bodyHull.particles = convexHull;

                // Draw points of collision and separation direction
                let edge = bodyHull.getFarthestEdgeInDirection(collider.normal);
                for (const particle of edge) {
                    p.noStroke();
                    p.stroke(255, 0, 0);
                    p.strokeWeight(5);
                    p.point(particle.position[0], particle.position[1]);

                    p.stroke(255, 0, 0);
                    p.strokeWeight(1);

                    const delta = vec3.scale(vec3.create(), vec3.negate(vec3.create(), collider.normal), 20);
                    const p2 = vec3.add(vec3.create(), particle.position, delta);
                    p.line(particle.position[0], particle.position[1], p2[0], p2[1]);
                }
            }
        } else {
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

    if (sketchInstance) {
        sketchInstance.remove();
        sketchInstance = null;
    }

    window.removeEventListener('keydown', handleKeyDown);
});

function handleKeyDown(e: KeyboardEvent) {
    if (e.code == 'Space') {
        engine.isPaused = !engine.isPaused;
        engine.skip = !engine.skip;
    }
}
</script>
