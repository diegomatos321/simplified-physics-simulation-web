<style></style>

<template>
    <div class="container mx-auto">
        <h1 class="text-3xl"><strong>GJK/EPA Implementation - Demo 2 2D</strong></h1>

        <div class="flex">
            <div class="relative">
                <div class="absolute top-0 right-0">
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
import Particle from '@/physics/Particle';
import type IConstraint from '@/physics/constraints/IConstraint';
import LinearConstraint from '@/physics/constraints/LinearConstraint';
import PentagonBody from '@/physics/polygons/PentagonBody';

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
    {
        let trelis1 = trelis(vec3.fromValues(-200, -200, 0), vec3.fromValues(100, 100, 0), 4, 4, true, true);
        trelis1.particles[0].pinned = true;
        // trelis1.particles[10].pinned = true;
        const { uvs, indices } = trelis1.triangulation();
        engine.bodies.push(trelis1);
        entities.push({
            uvs,
            indices,
            body: trelis1,
        });
    }

    {
        let trelis1 = trelis(vec3.fromValues(0, 0, 0), vec3.fromValues(200, 100, 0), 3, 2, true);
        // trelis1.particles[0].pinned = true;
        // trelis1.particles[10].pinned = true;
        const { uvs, indices } = trelis1.triangulation();
        engine.bodies.push(trelis1);
        entities.push({
            uvs,
            indices,
            body: trelis1,
        });
    }

    {
        const pentagonPoly = new PentagonBody(50, -100, 50);
        const { uvs, indices } = pentagonPoly.triangulation();
        engine.bodies.push(pentagonPoly);
        entities.push({
            uvs,
            indices,
            body: pentagonPoly,
        });
    }
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
            p.strokeWeight(2);
            for (const constraint of entity.body.constraints) {
                p.line(constraint.p0.position[0], constraint.p0.position[1], constraint.p1.position[0], constraint.p1.position[1]);
            }

            p.noStroke();
            p.fill(0, 0, 255);
            for (const particle of entity.body.particles) {
                if (particle.pinned) {
                    p.circle(particle.position[0], particle.position[1], 5);
                }
            }

            for (const collider of entity.body.colliders) {
                const convexHull = entity.body.convexHull();
                const bodyHull = new PolygonBody([]);
                bodyHull.particles = convexHull;
                let edge = bodyHull.getFarthestEdgeInDirection(collider.normal);
                for (const particle of edge) {
                    p.noStroke();
                    p.fill(255, 0, 0);
                    p.circle(particle.position[0], particle.position[1], 5);

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

function trelis(corner: vec3, size: vec3, nx: number, ny: number, stiff: boolean = false, reinforce: boolean = false) {
    let particles: Particle[] = [];
    let constraints: IConstraint[] = [];

    let dx = vec3.fromValues(size[0] / nx, 0, 0);
    let dy = vec3.fromValues(0, size[1] / ny, 0);

    let m = nx + 1;
    for (let i = 0; i <= ny; i++) {
        let q = vec3.scaleAndAdd(vec3.create(), corner, dy, i);
        for (let j = 0; j <= nx; j++) {
            let p = vec3.scaleAndAdd(vec3.create(), q, dx, j);
            particles.push(new Particle(p));

            let k = i * m + j;
            if (j > 0) constraints.push(new LinearConstraint(particles[k], particles[k - 1]));
            if (i > 0) constraints.push(new LinearConstraint(particles[k], particles[k - m]));
            if (i > 0 && j > 0 && stiff) {
                constraints.push(new LinearConstraint(particles[k - 1], particles[k - m]), new LinearConstraint(particles[k], particles[k - m - 1]));
            }
        }
    }

    if (nx > 1 && ny > 1 && reinforce) {
        constraints.push(
            new LinearConstraint(particles[0], particles[particles.length - 1]),
            new LinearConstraint(particles[0], particles[m - 1]),
            new LinearConstraint(particles[0], particles[particles.length - m]),
            new LinearConstraint(particles[particles.length - m], particles[m - 1]),
            new LinearConstraint(particles[m - 1], particles[particles.length - 1]),
            new LinearConstraint(particles[particles.length - m], particles[particles.length - 1]),
        );
    }

    return new Body(particles, constraints);
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.code == 'Space') {
        engine.isPaused = !engine.isPaused;
        engine.skip = !engine.skip;
    }
}
</script>
