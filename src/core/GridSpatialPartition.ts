import type Body from '@/physics/Body';

export default class GridSpatialPartition {
    public grid: Body[][] = [];
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
            this.grid.push([])
            for (let j = 0; j < this.ncols; j++) {
                this.grid[i].push([])
            }
        }
    }

    public insert(body: Body): void {
        const aabb = body.getAABB();

        const points = [aabb.min, aabb.max];
        const regionsInserted: number[] = [];
        for (const p of points) {
            const i = Math.floor(p[0] / this.cellsize);
            const j = Math.floor(p[1] / this.cellsize);
            if (regionsInserted.indexOf(i + j) >= 0) {
                continue;
            }
            regionsInserted.push(i + j);
            this.grid[this.nrows * i + j].push(body);
        }
    }
}
