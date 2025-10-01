import type Body from '@/physics/Body';
import type AABB from './AABB';

export default class GridSpatialPartition {
    public grid: Array<Body>[][] = [];
    public nrows: number;
    public ncols: number;

    constructor(
        worldWidth: number,
        worldHeight: number,
        protected cellsize: number,
    ) {
        this.nrows = Math.ceil(worldHeight / cellsize);
        this.ncols = Math.ceil(worldWidth / cellsize);
        for (let i = 0; i < this.nrows; i++) {
            const row = [];
            for (let j = 0; j < this.ncols; j++) {
                row.push([]);
            }
            this.grid.push(row);
        }
    }

    public insert(body: Body): void {
        body.aabb = null;
        const aabb = body.getAABB();
        const cells = this.cellsForAABB(aabb);
        for (const [gx, gy] of cells) {
            const cell = this.grid[gy][gx];
            cell.push(body);
        }
    }

    public clear() {
        this.grid.length = 0;
        for (let i = 0; i < this.nrows; i++) {
            const row = [];
            for (let j = 0; j < this.ncols; j++) {
                row.push([]);
            }
            this.grid.push(row);
        }
    }

    protected cellsForAABB(aabb: AABB) {
        const gx0 = Math.floor(aabb.min[0] / this.cellsize);
        const gy0 = Math.floor(aabb.min[1] / this.cellsize);
        const gx1 = Math.floor(aabb.max[0] / this.cellsize);
        const gy1 = Math.floor(aabb.max[1] / this.cellsize);

        const out: Array<[number, number]> = [];
        for (let gy = gy0; gy <= gy1; gy++) {
            for (let gx = gx0; gx <= gx1; gx++) {
                if (gx < 0 || gx >= this.ncols || gy < 0 || gy >= this.nrows) {
                    continue
                }
                out.push([gx, gy]);
            }
        }
        return out;
    }
}
