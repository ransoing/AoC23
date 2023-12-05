import { sum } from 'lodash';

type Coordinate = XYZ | number[];

interface IBfsOptions {
    /** a function to get the neighbors of this point */
    getNeighbors?: (p: XYZ) => XYZ[];
    /** determines whether a neighbor point can be visited, in addition to normal checks of whether the point has already been visited */
    canVisitNeighbor?: (neighbor: XYZ, p: XYZ) => boolean;
    /** determines whether the BFS should stop when visiting a new point */
    shouldStop?: (p: XYZ) => boolean;
    /** performs some action on every point before it's visited */
    tap?: (p: XYZ) => void;
    /** returns the string to add to the 'visitedPoints' set */
    getVisitedKey?: (p: XYZ, iteration: number) => string;
}

/** A class that gives convenient tools for dealing with 2D or 3D coordinates */
export class XYZ {

    /** Takes either an XYZ or number[] and converts it to XYZ */
    static normalize( c: Coordinate ): XYZ {
        return c instanceof XYZ ? c : new XYZ( c );
    }

    /** Adds multiple coordinates together and returns a new object */
    static sum( ...cs: Coordinate[] ): XYZ {
        const xyzs = cs.map( XYZ.normalize );
        return new XYZ([
            sum( xyzs.map(c => c.x) ),
            sum( xyzs.map(c => c.y) ),
            sum( xyzs.map(c => c.z) )
        ]);
    }

    public x: number;
    public y: number;
    public z: number;

    constructor( c: number[] ) {
        this.x = c[0] ?? 0;
        this.y = c[1] ?? 0;
        this.z = c[2] ?? 0;
    }

    /** Adds additional coordinates, modifying the current one, and returns the original object */
    add( ...cs: Coordinate[] ): XYZ {
        const xyzs = cs.map( XYZ.normalize );
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] += sum( xyzs.map(c => c[prop]) ) );
        return this;
    }

    /** Adds coordinates to the current one, returning a new object */
    plus( ...cs: Coordinate[] ): XYZ {
        return this.copy().add( ...cs );
    }

    /** Subtracts additional coordinates, modifying the current one, and returns the original object */
    subtract( ...cs: Coordinate[] ): XYZ {
        const xyzs = cs.map( XYZ.normalize );
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] += sum( xyzs.map(c => -c[prop]) ) );
        return this;
    }

    /** Subtracts additional coordinatess, returning a new object */
    minus( ...cs: Coordinate[] ): XYZ {
        return this.copy().subtract( ...cs );
    }

    /** Multiplies all values by a given scalar. Modifies the original object */
    multiply( scalar: number ): XYZ {
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] *= scalar );
        return this;
    }

    /** Multiplies all values by a given scalar, returning a new object */
    times( scalar: number ): XYZ {
        return this.copy().multiply( scalar );
    }

    /** Returns a copy of the object */
    copy(): XYZ {
        return new XYZ([ this.x, this.y, this.z ]);
    }

    /**
     * Returns a new XYZ object whose values are either 0, 1, or -1, representing whether the x, y, and z values are
     * positive, negative, or 0
     */
    toSign(): XYZ {
        return new XYZ([
            this.x === 0 ? 0 : this.x / Math.abs( this.x ),
            this.y === 0 ? 0 : this.y / Math.abs( this.y ),
            this.z === 0 ? 0 : this.z / Math.abs( this.z )
        ]);
    }

    /** Returns whether the coordinates of the XYZ object and another are the same */
    eq( c: Coordinate ): boolean {
        const xyz = XYZ.normalize( c );
        return xyz != null && this.x === xyz.x && this.y === xyz.y && this.z === xyz.z;
    }

    /** Returns all neighbors in the same z plane */
    neighbors( includeDiagonal = false ): XYZ[] {
        const orthogonal = [ [1,0], [0,1], [-1,0], [0,-1] ];
        const diagonal = [ [1,1], [1,-1], [-1,-1], [-1,1] ];
        return orthogonal.concat( includeDiagonal ? diagonal : [] ).map( c => this.plus(c) );
    }

    /** Returns all neighbors in 3 dimensions */
    neighbors3D( includeDiagonal = false ): XYZ[] {
        const orthogonal = [ [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1] ];
        const diagonal = [
            [1,1,1],  [1,-1,1],  [-1,-1,1],  [-1,1,1],
            [1,1,0],  [1,-1,0],  [-1,-1,0],  [-1,1,0],
            [1,1,-1], [1,-1,-1], [-1,-1,-1], [-1,1,-1]
        ];
        return orthogonal.concat( includeDiagonal ? diagonal : [] ).map( c => this.plus(c) );
    }

    /** Returns the absolute straight-line distance from one point to another */
    distanceTo( destination: Coordinate ): number {
        const xyz = XYZ.normalize( destination );
        // find the distance in the XY plane, then return the distance to the Z point using the XY distance as the leg of a right triangle
        return Math.sqrt( (this.x - xyz.x)**2 + (this.y - xyz.y)**2 + (this.z - xyz.z)**2 );
    }

    /** Returns the absolute distance from one point to another using taxicab geometry */
    taxicabDistanceTo( destination: Coordinate ): number {
        const xyz = XYZ.normalize( destination );
        return Math.abs( this.x - xyz.x ) + Math.abs( this.y - xyz.y ) + Math.abs( this.z - xyz.z );
    }

    /** given a 2D or 3D array, returns the value at [y][x][z] in that array */
    valueIn<T>( arr: T[][] ): T;
    valueIn<T>( arr: T[][][] ): T;
    valueIn<T>( arr: (T | T[])[][] ) {
        const element2d = arr[this.y]?.[this.x];
        return Array.isArray( element2d ) ? element2d?.[this.z] : element2d;
    }

    toString(): string {
        return `${this.x},${this.y},${this.z}`;
    }

    /**
     * Performs a breadth-first search starting at the point the method is called on.
     * Returns the set of visited points.
     */
    bfs( options: IBfsOptions ) {
        const defaultOptions: IBfsOptions = {
            getNeighbors: p => p.neighbors(),
            canVisitNeighbor: () => true,
            getVisitedKey: p => p.toString(),
            shouldStop: () => false,
            tap: () => {}
        };
        const o = Object.assign( {}, defaultOptions, options );
        const visitedPoints = new Set<string>(); // XYZ strings
        const queue: {
            point: XYZ,
            iteration: number
        }[] = [{ point: this, iteration: 0 }];
        visitedPoints.add( o.getVisitedKey(this, 0) );
        let iterations = 0;
        while ( queue.length > 0 ) {
            const current = queue.pop();
            if ( o.shouldStop(current.point) ) {
                break;
            }
            iterations++;
            o.getNeighbors( current.point ).filter(
                n => o.canVisitNeighbor( n, current.point ) && !visitedPoints.has( o.getVisitedKey(n, current.iteration + 1) )
            ).forEach( p => {
                o.tap( p );
                visitedPoints.add( o.getVisitedKey(p, current.iteration + 1) );
                queue.unshift({ point: p, iteration: current.iteration + 1 });
            });
        }
        return {
            visited: visitedPoints,
            iterations: iterations
        };
    }
}