import type PolygonBody from '../../bodies/PolygonBody';
import { vec3 } from 'gl-matrix';

export function support(
    shape1: PolygonBody,
    shape2: PolygonBody,
    d: vec3,
): vec3 {
    const p1 = shape1.getFarthestPointInDirection(d);
    const p2 = shape2.getFarthestPointInDirection(
        vec3.negate(vec3.create(), d),
    );

    // perform the Minkowski Difference
    const p3 = vec3.subtract(vec3.create(), p1.position, p2.position);

    // p3 is now a point in Minkowski space on the edge of the Minkowski Difference
    return p3;
}

export function tripleProduct(a: vec3, b: vec3, c: vec3): vec3 {
    let triple1 = vec3.scale(vec3.create(), b, vec3.dot(c, a));
    let triple2 = vec3.scale(vec3.create(), a, vec3.dot(c, b));

    return vec3.subtract(vec3.create(), triple1, triple2);
}
