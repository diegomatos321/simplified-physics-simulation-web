console.log('[Worker] Worker de física iniciado.');

// Escuta por mensagens vindas da thread principal.
self.onmessage = (event: MessageEvent) => {
    console.log(`[Worker] Recebeu mensagem`);

    console.dir(event.data);
};

/*
import type { Body } from '../bodies';
import Engine, { type Config } from '../Engine';
import type IConstraint from './constraints/IConstraint';
import type Particle from './Particle';

// Representa o estado de um único objeto na simulação
export interface PhysicsObjectState {
    particles: Particle[];
    constraints: IConstraint[];
}

// Representa o estado completo da simulação a ser enviado para a Main Thread
export interface SimulationState {
    objects: PhysicsObjectState[];
    // Outros dados, como tempo de simulação, etc.
}

// Mensagens que a Main Thread pode enviar para o Worker
export type MainToWorkerMessage =
    | { type: 'start'; config: Config; bodies?: Body[] } // `any` para simplificar, idealmente um tipo definido
    | { type: 'add_body'; body: Body };

// Mensagens que o Worker pode enviar para a Main Thread
export type WorkerToMainMessage =
    | { type: 'simulation_state'; state: SimulationState }
    | { type: 'ready' };

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
        objectsState.push({
            particles: body.particles,
            constraints: body.constraints,
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
        console.log('Worker: Iniciando simulação...');
        engine = new Engine(msg.config);
        if (msg.bodies) {
            for (const body of msg.bodies) {
                engine.addBody(body);
            }
        }

        if (simulationInterval) {
            clearInterval(simulationInterval);
        }

        isRunning = true;
        lastTime = performance.now();
        simulationInterval = self.setTimeout(step, 0);
    } else if (msg.type === 'add_body') {
        engine.addBody(msg.body);
    }
});
*/
