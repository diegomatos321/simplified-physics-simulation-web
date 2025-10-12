import type { Config } from '../Engine';

export enum ObjectType {
    Triangle,
    Rectangle,
    Polygon,
}

// Representa o estado de um único objeto na simulação
export interface ObjectBuilderArgs {
    type: ObjectType;
    x: number;
    y: number;
    size: number;
    k?: number;
    isStatic?: boolean;
}

export interface PhysicsObjectState {
    particles: number[], // x1, y1
    constraintsIndices: number[] // particles indices
}

// Representa o estado completo da simulação a ser enviado para a Main Thread
export interface SimulationState {
    objects: PhysicsObjectState[];
    // Outros dados, como tempo de simulação, etc.
}

// Mensagens que a Main Thread pode enviar para o Worker
export type MainToWorkerMessage =
    | { type: 'start'; config: Config; objects?: ObjectBuilderArgs[] } // `any` para simplificar, idealmente um tipo definido
    | { type: 'add_body'; obj: ObjectBuilderArgs };

// Mensagens que o Worker pode enviar para a Main Thread
export type WorkerToMainMessage =
    | { type: 'simulation_state'; state: SimulationState }
    | { type: 'ready' };
