import type PolygonBody from '@/geometry/PolygonBody';
import * as twgl from 'twgl.js';

export function support(shape1: PolygonBody, shape2: PolygonBody, d: twgl.v3.Vec3): twgl.v3.Vec3 {
    const p1 = shape1.getFarthestPointInDirection(d);
    const p2 = shape2.getFarthestPointInDirection(twgl.v3.negate(d));

    // perform the Minkowski Difference
    const p3 = twgl.v3.subtract(p1.position, p2.position);

    // p3 is now a point in Minkowski space on the edge of the Minkowski Difference
    return p3;
}

export function tripleProduct(a: twgl.v3.Vec3, b: twgl.v3.Vec3, c: twgl.v3.Vec3): twgl.v3.Vec3 {
    let triple1 = twgl.v3.mulScalar(b, twgl.v3.dot(c, a));
    let triple2 = twgl.v3.mulScalar(a, twgl.v3.dot(c, b));

    return twgl.v3.subtract(triple1, triple2);
}
