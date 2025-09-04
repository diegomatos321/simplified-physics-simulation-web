import type PolygonBody from '@/geometry/PolygonBody'
import * as twgl from 'twgl.js'

export default function sat(
    shape1: PolygonBody,
    shape2: PolygonBody,
): false | { depth: number; normal: twgl.v3.Vec3 } {
    const axes1 = shape1.axes()
    const axes2 = shape2.axes()

    let overlap = Infinity
    let smallest: twgl.v3.Vec3 = []

    for (const axis of axes1) {
        const proj1 = shape1.project(axis)
        const proj2 = shape2.project(axis)

        let o = proj1.overlaps(proj2)
        if (o <= 0) {
            return false
        } else if (o < overlap) {
            overlap = o
            smallest = axis
        }
    }

    for (const axis of axes2) {
        const proj1 = shape1.project(axis)
        const proj2 = shape2.project(axis)

        let o = proj1.overlaps(proj2)
        if (o <= 0) {
            return false
        } else if (o < overlap) {
            overlap = o
            smallest = axis
        }
    }

    return { depth: overlap, normal: smallest }
}
