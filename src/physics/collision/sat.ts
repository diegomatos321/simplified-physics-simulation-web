import type PolygonBody from '@/physics/rigid_bodies/PolygonBody';
import * as twgl from 'twgl.js';
import Collider from '../Collider';

export default function sat(shapeA: PolygonBody, shapeB: PolygonBody): false | Collider {
    const axesA = shapeA.axes();
    const axesB = shapeB.axes();
    const axes = axesA.concat(axesB);

    let overlap = Infinity;
    let smallest: twgl.v3.Vec3 = [];

    for (const axis of axes) {
        const projA = shapeA.project(axis);
        const projB = shapeB.project(axis);

        let o = projA.overlaps(projB);
        if (o <= 1e-10) {
            return false;
        } else if (o < overlap) {
            overlap = o;
            smallest = axis;

            // Ensure axis points from A to B
            const centerA = shapeA.getCenter();
            const centerB = shapeB.getCenter();
            const direction = twgl.v3.dot(twgl.v3.subtract(centerB, centerA), axis);
            if (direction < 0) {
                smallest = twgl.v3.negate(axis);
            }
        }
    }

    return new Collider(smallest, overlap);
}
