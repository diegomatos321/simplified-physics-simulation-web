import EngineWorker from './EngineWorker?worker&inline';
export * from './types';

export function createEngineWorker(): Worker {
    return new EngineWorker();
}
