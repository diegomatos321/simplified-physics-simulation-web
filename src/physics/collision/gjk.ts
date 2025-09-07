import type PolygonBody from '@/geometry/PolygonBody';
import * as twgl from 'twgl.js';
import { support, tripleProduct } from './utils';

export default function gjk(A: PolygonBody, B: PolygonBody): twgl.v3.Vec3[] | false {
    const simplex: twgl.v3.Vec3[] = [];

    // initial search direction equals to the difference of the shapes center
    let d = twgl.v3.subtract(B.getCenter(), A.getCenter());
    d = twgl.v3.normalize(d);
    // get the first Minkowski Difference point
    simplex.push(support(A, B, d));

    // negate d for the next point
    d = twgl.v3.negate(d);

    for (let i = 0; i < 30; i++) {
        let a = support(A, B, d);
        // add a new point to the simplex because we haven't terminated yet
        simplex.push(a);

        // make sure that the last point we added actually passed the origin
        if (twgl.v3.dot(a, d) <= 0) {
            return false;
        }

        // otherwise we need to determine if the origin is in
        // the current simplex
        if (containsOrigin(simplex, d)) {
            return simplex;
        }
    }

    return false;
}

function containsOrigin(simplex: twgl.v3.Vec3[], d: twgl.v3.Vec3): boolean {
    if (simplex.length == 3) {
        return triangleCase(simplex, d);
    } else if (simplex.length == 2) {
        return lineCase(simplex, d);
    }

    return false;
}

function triangleCase(simplex: twgl.v3.Vec3[], d: twgl.v3.Vec3): boolean {
    // get the last point added to the simplex
    const [c, b, a] = simplex;
    // compute AO (same thing as -A)
    const ao = twgl.v3.negate(a);

    // compute the edges
    const ab = twgl.v3.subtract(b, a);
    const ac = twgl.v3.subtract(c, a);

    // compute the normals
    const abPerp = tripleProduct(ac, ab, ab);
    const acPerp = tripleProduct(ab, ac, ac);

    // is the origin in R4 region?
    if (twgl.v3.dot(abPerp, ao) > 0) {
        // remove point c
        simplex.splice(0, 1);
        // set the new direction to abPerp
        twgl.v3.copy(abPerp, d);

        return false;
    }

    // is the origin in R3?
    if (twgl.v3.dot(acPerp, ao) > 0) {
        // remove point b
        simplex.splice(1, 1);
        // set the new direction to acPerp
        twgl.v3.copy(acPerp, d);

        return false;
    }

    // otherwise we know its in R5 so we can return true
    return true;
}

function lineCase(simplex: twgl.v3.Vec3[], d: twgl.v3.Vec3): boolean {
    // get the last point added to the simplex
    const [b, a] = simplex;
    // compute AO (same thing as -A)
    const ao = twgl.v3.negate(a);
    // compute AB
    const ab = twgl.v3.subtract(b, a);
    // get the perp to AB in the direction of the origin
    const abPerp = tripleProduct(ab, ao, ab);
    // set the direction to abPerp
    twgl.v3.copy(abPerp, d);

    return false;
}
