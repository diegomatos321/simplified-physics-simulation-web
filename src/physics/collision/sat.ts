import type PolygonBody from '@/physics/PolygonBody';
import { vec3 } from 'gl-matrix';

export default function sat(shapeA: PolygonBody, shapeB: PolygonBody) {
    const axesA = shapeA.axes();
    const axesB = shapeB.axes();
    const axes = axesA.concat(axesB);

    let overlap = Infinity;
    let smallest = vec3.create();

    for (const axis of axes) {
        const projA = shapeA.project(axis);
        const projB = shapeB.project(axis);

        let o = projA.overlaps(projB);
        if (o <= 1e-3) {
            return false;
        } else if (o < overlap) {
            overlap = o;
            smallest = axis;

            // Ensure axis points from A to B
            const centerA = shapeA.getCenter();
            const centerB = shapeB.getCenter();
            // const direction = twgl.v3.dot(twgl.v3.subtract(centerB, centerA), axis);
            const direction = vec3.dot(vec3.subtract(vec3.create(), centerB, centerA), axis);
            if (direction < 0) {
                // smallest = twgl.v3.negate(axis);
                smallest = vec3.negate(vec3.create(), axis);
            }
        }
    }

    return { normal: smallest, depth: overlap };
}
