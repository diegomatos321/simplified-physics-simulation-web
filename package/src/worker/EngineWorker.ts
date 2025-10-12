import { PolygonBody, RectangleBody, TriangleBody } from '../bodies';
import Engine from '../Engine';
import {
    type MainToWorkerMessage,
    ObjectType,
    type PhysicsObjectState,
    type SimulationState,
} from './types';

let engine: Engine;
let lastTime: number = 0,
    simulationInterval: number | null = null;
const FIXED_DT = 1 / 60,
    MS_PER_STEP = FIXED_DT * 1000; // Executar a simulação 60 vezes por segundo
let isRunning: boolean = false;

function step() {
    if (isRunning === false) {
        return;
    }

    let elapsed = performance.now() - lastTime;

    // 1. Avance o mundo da física
    while (elapsed >= MS_PER_STEP) {
        engine.step(FIXED_DT);

        elapsed -= MS_PER_STEP;
        lastTime += MS_PER_STEP;
    }

    // 2. Extraia os dados de posição dos corpos
    const objectsState: PhysicsObjectState[] = [];
    for (const body of engine.bodies) {
        const particles = [];
        for (const p of body.particles) {
            particles.push(p.position[0], p.position[1])
        }

        objectsState.push({
            particles,
            constraintsIndices: body.constraintsIndices,
        });
    }

    // 3. Empacote o estado
    const state: SimulationState = {
        objects: objectsState,
    };

    // 4. Envie o estado para a Main Thread
    self.postMessage({ type: 'simulation_state', state });

    // schedule next iteration with minimal delay
    self.setTimeout(step, 0);
}

self.addEventListener('message', (e: MessageEvent<MainToWorkerMessage>) => {
    const msg = e.data;

    if (msg.type === 'start') {
        console.log('[Worker] Iniciando simulação...');

        engine = new Engine(msg.config);
        if (msg.objects) {
            for (const obj of msg.objects) {
                switch (obj.type) {
                    case ObjectType.Triangle:
                        engine.addBody(
                            new TriangleBody(
                                obj.x,
                                obj.y,
                                obj.size,
                                obj.isStatic,
                            ),
                        );
                        break;
                    case ObjectType.Rectangle:
                        engine.addBody(
                            new RectangleBody(
                                obj.x,
                                obj.y,
                                obj.size,
                                obj.size / 2,
                                obj.isStatic,
                            ),
                        );
                        break;
                    case ObjectType.Polygon:
                        engine.addBody(
                            PolygonBody.PolygonBuilder(
                                obj.x,
                                obj.y,
                                obj.size,
                                obj.k || 5,
                                obj.isStatic || false,
                            ),
                        );
                        break;
                    default:
                        break;
                }
            }
        }

        if (simulationInterval) {
            clearInterval(simulationInterval);
        }

        isRunning = true;
        lastTime = performance.now();
        simulationInterval = self.setTimeout(step, 0);
    } else if (msg.type === 'add_body') {
        // engine.addBody(msg.body);
        console.log('[Worker] Add body');
        console.dir(msg);
    }
});
