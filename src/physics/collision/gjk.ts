import type PolygonBody from '@/physics/polygons/PolygonBody';
import { support, tripleProduct } from './utils';
import { vec3 } from 'gl-matrix';

export default function gjk(A: PolygonBody, B: PolygonBody): vec3[] | false {
    const simplex: vec3[] = [];

    // initial search direction equals to the difference of the shapes center
    let d = vec3.subtract(vec3.create(), B.getCenter(), A.getCenter());
    vec3.normalize(d, d);

    // get the first Minkowski Difference point
    simplex.push(support(A, B, d));

    // negate d for the next point
    vec3.negate(d, d);

    for (let i = 0; i < 30; i++) {
        let a = support(A, B, d);
        // add a new point to the simplex because we haven't terminated yet
        simplex.push(a);

        // make sure that the last point we added actually passed the origin
        if (vec3.dot(a, d) <= 1e-10) {
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

function containsOrigin(simplex: vec3[], d: vec3): boolean {
    if (simplex.length == 3) {
        return triangleCase(simplex, d);
    } else if (simplex.length == 2) {
        return lineCase(simplex, d);
    }

    return false;
}

function triangleCase(simplex: vec3[], d: vec3): boolean {
    // get the last point added to the simplex
    const [c, b, a] = simplex;
    // compute AO (same thing as -A)
    const ao = vec3.negate(vec3.create(), a);

    // compute the edges
    const ab = vec3.subtract(vec3.create(), b, a);
    const ac = vec3.subtract(vec3.create(), c, a);

    // compute the normals
    const abPerp = tripleProduct(ac, ab, ab);
    const acPerp = tripleProduct(ab, ac, ac);

    // is the origin in R4 region?
    if (vec3.dot(abPerp, ao) > 0) {
        // remove point c
        simplex.splice(0, 1);
        // set the new direction to abPerp
        vec3.copy(d, abPerp);

        return false;
    }

    // is the origin in R3?
    if (vec3.dot(acPerp, ao) > 0) {
        // remove point b
        simplex.splice(1, 1);
        // set the new direction to acPerp
        vec3.copy(d, acPerp);

        return false;
    }

    // otherwise we know its in R5 so we can return true
    return true;
}

function lineCase(simplex: vec3[], d: vec3): boolean {
    // get the last point added to the simplex
    const [b, a] = simplex;
    // compute AO (same thing as -A)
    const ao = vec3.negate(vec3.create(), a);
    // compute AB
    const ab = vec3.subtract(vec3.create(), b, a);
    // get the perp to AB in the direction of the origin
    const abPerp = tripleProduct(ab, ao, ab);
    // set the direction to abPerp
    vec3.copy(d, abPerp);

    return false;
}
