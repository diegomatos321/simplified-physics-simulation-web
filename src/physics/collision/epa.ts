import type PolygonBody from '@/physics/polygons/PolygonBody';
import { support, tripleProduct } from './utils';
import Collider from '../Collider';
import { vec3 } from 'gl-matrix';

export function epa(A: PolygonBody, B: PolygonBody, simplex: vec3[]): Collider | undefined {
    const TOLERANCE = 1e-6;
    // loop to find the collision information
    for (let i = 0; i < 30; i++) {
        // obtain the feature (edge for 2D) closest to the
        // origin on the Minkowski Difference
        const e = findClosestEdge(simplex);

        // obtain a new support point in the direction of the edge normal
        const p = support(A, B, e.normal);

        // check the distance from the origin to the edge against the
        // distance p is along e.normal
        const d = vec3.dot(p, e.normal);
        if (Math.abs(d - e.distance) < TOLERANCE) {
            // the tolerance should be something positive close to zero (ex. 0.00001)

            // if the difference is less than the tolerance then we can
            // assume that we cannot expand the simplex any further and
            // we have our solution
            return new Collider(e.normal, d);
        } else {
            // we haven't reached the edge of the Minkowski Difference
            // so continue expanding by adding the new point to the simplex
            // in between the points that made the closest edge
            simplex.splice(e.index, 0, p);
        }
    }
}

function findClosestEdge(simplex: vec3[]) {
    // Edge closest = new Edge();
    const closest = {
        index: 0,
        // prime the distance of the edge to the max
        distance: Number.POSITIVE_INFINITY,
        normal: vec3.fromValues(0, 0, 0),
    };

    for (let i = 0; i < simplex.length; i++) {
        // compute the next points index
        let j = (i + 1) % simplex.length;

        // get the current point and the next one
        const a = simplex[i];
        const b = simplex[j];

        // create the edge vector
        const e = vec3.subtract(vec3.create(), b, a);

        // get the vector from the origin to a
        const oa = a; // or a - ORIGIN

        // get the vector from the edge towards the origin
        const n = tripleProduct(e, oa, e);
        vec3.normalize(n, n);

        // calculate the distance from the origin to the edge
        const d = vec3.dot(n, a);

        // check the distance against the other distances
        if (d < closest.distance) {
            // if this edge is closer then use it
            closest.distance = d;
            closest.normal = n;
            closest.index = j;
        }
    }

    // return the closest edge we found
    return closest;
}
