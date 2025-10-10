export default class Projection {
    public min: number;
    public max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    overlaps(other: Projection): number {
        if (this.max >= other.min && other.max >= this.min) {
            return Math.min(this.max, other.max) - Math.max(this.min, other.min);
        }

        return 0;
    }
}
