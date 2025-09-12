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
import PolygonBody from '@/physics/polygons/PolygonBody';
import { vec3 } from 'gl-matrix';

const sketchContainer = ref<HTMLCanvasElement | null>(null);
let sketchInstance: p5 | null = null;
let engine = new Engine([600, 600]);
let debug = true;
let entities: { uvs: number[][]; indices: number[]; body: Body }[] = [];
let texture: p5.Image;

onMounted(() => {
    if (!sketchContainer.value) return;

    const sketch = (p: p5) => {
        p.setup = () => setup(p);
        p.draw = () => loop(p);
    };

    sketchInstance = new p5(sketch);
});

async function setup(p: p5) {
    if (sketchContainer.value === null) return;

    p.createCanvas(600, 600, p.WEBGL).parent(sketchContainer.value);

    texture = await p.loadImage('/pizza-sprite.png');

    for (let i = 0; i < 10; i++) {
        const x = Math.random() * p.width - p.width / 2;
        const y = Math.random() * p.height - p.height / 2;

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

    for (const entity of entities) {
        engine.integrate(entity.body, p.deltaTime / 1000);
    }

    const bodies = entities.map((e) => e.body);
    engine.narrowPhase(bodies);

    for (const body of bodies) {
        if (body instanceof PolygonBody && body.collider) {
            let edge = body.getFarthestEdgeInDirection(body.collider.normal);
            for (const particle of edge) {
                const delta = vec3.scale(vec3.create(), vec3.negate(vec3.create(), body.collider.normal), 20);
                const p2 = vec3.add(vec3.create(), particle.position, delta);

                if (debug) {
                    p.noLoop();
                } else {
                    particle.move(delta);
                }
            }
        }
    }

    for (const body of bodies) {
        engine.satisfyConstraints(body);
    }

    for (const entity of entities) {
        if (debug) {
            // Draw constraints
            p.stroke(150, 200, 255);
            p.strokeWeight(2);
            for (const constraint of entity.body.constraints) {
                p.line(constraint.p0.position[0], constraint.p0.position[1], constraint.p1.position[0], constraint.p1.position[1]);
            }

            // Draw particles
            // p.noStroke();
            // p.fill(30, 144, 255);
            // for (const particle of entity.body.particles) {
            //     p.circle(particle.position[0], particle.position[1], 10);
            // }

            if (entity.body instanceof PolygonBody && entity.body.collider) {
                let edge = entity.body.getFarthestEdgeInDirection(entity.body.collider.normal);
                for (const particle of edge) {
                    p.noStroke();
                    p.fill(255, 0, 0);
                    p.circle(particle.position[0], particle.position[1], 5);

                    p.stroke(255, 0, 0);
                    p.strokeWeight(1);

                    const delta = vec3.scale(vec3.create(), vec3.negate(vec3.create(), entity.body.collider.normal), 20);
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

    for (const body of bodies) {
        if (body instanceof PolygonBody && body.collider) {
            body.collider = undefined
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
