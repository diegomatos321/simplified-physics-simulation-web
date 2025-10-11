import EngineWorker from './core/EngineWorker?worker&inline';
import Engine, {
    BroadPhaseMode,
    CollisionDetectionMode,
    type Config,
} from './Engine';

function createEngineWorker(): Worker {
    return new EngineWorker();
    // return new Worker(new URL('./core/EngineWorker.ts', import.meta.url), {
    //     type: 'module',
    // });
}

export {
    BroadPhaseMode,
    CollisionDetectionMode,
    type Config,
    createEngineWorker,
    Engine,
};
