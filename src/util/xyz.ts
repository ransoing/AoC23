import { sum } from 'lodash';

export type Coordinate = XYZ | number[];

export interface IFloodFillOptions {
    /**
     * A function to get the neighbors of this point.
     * Typically you would call `p.neighbors()` or `p.neighbors3D()`
     * @default p => p.neighbors()
     */
    getNeighbors?: (p: XYZ) => XYZ[];
    /**
     * Determines whether a neighbor point can be visited, determined by if the neighbor's key as defined by getVisitedKey is already in the
     * list of visited point keys. This is in addition to normal checks of whether the point has already been visited by another traveler,
     * by a path that has less weight
     * 
     * @default () => true
     */
    canVisitNeighbor?: (neighbor: XYZ, p: XYZ) => boolean;
    /**
     * Performs some action on every point before it's visited. Is called using the point to be visited, the iteration after visiting the
     * point, and the path the traveler has taken
     * @default () => {}
     */
    tap?: (p: XYZ) => void;
}

export interface IPathfindingOptions {
    /**
     * The point we're trying to get to
     */
    target: XYZ;
    /**
     * A function to get the neighbors of this point - those that can be traveled to as well as those that can't.
     * A "neighbor" is where the traveler is allowed to go from here.
     * Typically you would call `p.neighbors()` or `p.neighbors3D()`
     * The point in the last item of `history` is the same as `p`.
     * @default p => p.neighbors() (gets orthogonal 2D neighbors)
     */
    getNeighbors?: (p: XYZ, history?: IPathHistoryItem[]) => XYZ[];
    /**
     * Determines whether a neighbor point can be visited. If left to the default, the BFS search will search an infinitely large grid.
     * This is called in addition to `canRevisitPoint` to determine if the BFS search can move to a point.
     * The point in the last item in the `history` array is the same as the `from` point.
     * 
     * @default () => true
     */
    canVisitNeighbor: (neighbor: XYZ, from?: XYZ, history?: IPathHistoryItem[]) => boolean;
    /** 
     * Warning: setting this to anything but 0 can greatly slow down the algorithm!
     * `fudgeFactor` is only needed if the key returned by `getStateKey` doesn't represent a unique state!
     * A positive number that allows a path to visit a spot it's been before, or to visit a spot that another path has been to but more
     * efficiently, within a certain allowable range. This is needed when one path reaching a spot quicker doesn't necessarily imply that
     * it will reach the target point faster. (for example if there are restrictions on allowable movement based on past movement).
     * Higher numbers allow more overlap between different paths but will greatly slow down the algorithm. Set the number based on the
     * weight of points. If the average weight is 10 and you set this number to 100, the algorithm will be very slow and allow much overlap.
     * If the average weight is 10 and you set it to 10, it will only allow a small amount of overlap in paths.
     * @default 0
     */
    fudgeFactor?: number;
    /**
     * Performs some action on every point before it's visited. Is called using the point to be visited and the path the traveler has taken.
     * The point in the last item in the `history` array is the same as the `from` point.
     * @default () => {}
     */
    tap?: (p: XYZ, history?: IPathHistoryItem[]) => void;
    /**
     * A function which returns a key to use, which is used to determine whether a path has traveled to the same "spot" as another.
     * For every unique key, The fastest path from that state should always be the same.
     * For simple pathfinding algorithms, use `p => p.toString()`.
     * For something more complicated, like if there are restrictions on where the traveler can go from the given point based on other
     * criteria, return a string that describes the point and the directions or places that the traveler can go from there. Always use the
     * least possible amount of info to describe the state.
     * @default p => p.toString()
     */
    getStateKey?: (p: XYZ, history?: IPathHistoryItem[]) => string;
    /**
     * Gets the "weight" i.e. cost, to travel to a point. Higher weights are considered to be "worse".
     * Default: p => 1
     */
    getPointWeight?: (to: XYZ, from?: XYZ) => number;
    /**
     * An estimated average weight it takes to travel from any one point to another. Used to help stop paths early when one path has gotten
     * to the finish point. Conservative lower numbers will produce a more accurate end result but run slower.
     * Another way to think about this is: given a path that has gotten halfway, what's the lowest possible additional weight it could
     * accumulate on the way to the finish?
     * Default: 1
     */
    averageWeight?: number;
}

export interface IFloodFillResult {
    /** an array of all the unique points visited by all paths taken, including the starting and ending points, in the order they were visited */
    visitedPoints: XYZ[];
}

export interface IPathfindingResult {
    /** the list of points BFS took to get to the end point. Does not include starting point. */
    history: IPathHistoryItem[];
    /** the sum of weights on the shortest path */
    totalWeight: number;
}

export interface IPathHistoryItem {
    point: XYZ;
    stateKey?: string;
    accumulatedWeight?: number;
}

interface IBfsQueueItem {
    point: XYZ;
    accumulatedWeight: number;
    /** a key for each step on its path */
    history: IPathHistoryItem[];
}

/** A class that gives convenient tools for dealing with 2D or 3D coordinates */
export class XYZ {

    static xPositive = [ 1, 0, 0 ];
    static xNegative = [ -1, 0, 0 ];
    static yPositive = [ 0, 1, 0 ];
    static yNegative = [ 0, -1, 0 ];
    static zPositive = [ 0, 0, 1 ];
    static zNegative = [ 0, 0, -1 ];
    static orthogonalDirections2D = [ [1,0], [0,1], [-1,0], [0,-1] ];
    static diagonalDirections2D = [ [1,1], [1,-1], [-1,-1], [-1,1] ];
    static orthogonalDirections3D = [ [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1] ];
    static diagonalDirections3D = [
        [1,1,1],  [1,-1,1],  [-1,-1,1],  [-1,1,1],
        [1,1,0],  [1,-1,0],  [-1,-1,0],  [-1,1,0],
        [1,1,-1], [1,-1,-1], [-1,-1,-1], [-1,1,-1]
    ];
    /** directions organized in clockwise direction for a grid where positive y is down */
    static clockwiseDirectionsYDown = [ [0,-1], [1,0], [0,1], [-1,0] ];
    /** directions organized in clockwise direction for a grid where positive y is up */
    static clockwiseDirectionsYUp = [ [0,1], [1,0], [0,-1], [-1,0] ];

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

    /** converts a string like '3,6,2' a number array and uses that to create an XYZ object */
    static fromString( str: string ) {
        return new XYZ( str.split(',').map(c => parseInt(c)) );
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

    /** Multiplies all values by a given scalar. Modifies the original object and returns it */
    multiply( scalar: number ): XYZ {
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] *= scalar );
        return this;
    }

    /** Multiplies all values by a given scalar, returning a new object */
    times( scalar: number ): XYZ {
        return this.copy().multiply( scalar );
    }

    /** Divides all values by a given divisor. Modifies the original object and returns it */
    divide( divisor: number ): XYZ {
        return this.multiply( 1 / divisor );
    }

    /** Divides all values by a given divisor, returning a new object */
    dividedBy( divisor: number ): XYZ {
        return this.times( 1 / divisor );
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
        return XYZ.orthogonalDirections2D.concat( includeDiagonal ? XYZ.diagonalDirections2D : [] ).map( c => this.plus(c) );
    }

    /** Returns all neighbors in 3 dimensions */
    neighbors3D( includeDiagonal = false ): XYZ[] {
        return XYZ.orthogonalDirections3D.concat( includeDiagonal ? XYZ.diagonalDirections3D : [] ).map( c => this.plus(c) );
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
     * Performs a "flood fill" using breadth-first search starting at the point the method is called on.
     * Flood fill is used to find all points accessible from the starting point.
    */
    floodFill( options: IFloodFillOptions ): IFloodFillResult {
        const defaultOptions: IFloodFillOptions = {
            getNeighbors: p => p.neighbors(),
            canVisitNeighbor: () => true,
            tap: () => {}
        };
        const o = Object.assign( {}, defaultOptions, options );
        // record which points we've visited so we don't visit any twice
        const visitedPoints = new Set<string>();
        visitedPoints.add( this.toString() );
        const queue: XYZ[] = [ this ];
        let current: XYZ;
        while ( queue.length > 0 ) {
            current = queue.pop();
            o.getNeighbors( current ).filter(
                n => o.canVisitNeighbor( n, current ) && !visitedPoints.has( n.toString() )
            ).forEach( n => {
                o.tap( n );
                visitedPoints.add( n.toString() );
                queue.unshift( n );
            });
        }
        return {
            visitedPoints: Array.from( visitedPoints.values() ).map( XYZ.fromString )
        };
    }

    /**
     * Uses a breadh-first search to find the quickest path from the point the method is called to a target point.
     * If point weights are not set, this returns the shortest path.
     * Returns the path to the target point and the total weight to get there.
     * Avoids revisiting points that have previously been visited with equal or lower total weights on the path to that given point.
     */
    quickestPath( options: IPathfindingOptions, showDebug = false ): IPathfindingResult {
        const defaultOptions: IPathfindingOptions = {
            target: null,
            getNeighbors: p => p.neighbors(),
            canVisitNeighbor: () => true,
            fudgeFactor: 0,
            tap: () => {},
            getPointWeight: p => 1,
            averageWeight: 1,
            getStateKey: p => p.toString()
        };
        const o = Object.assign( {}, defaultOptions, options );
        /** a map of string representations of points that have been visited and the lowest total weight any path has accumulated to get there */
        const lowestWeightsToPoint = new Map<string,number>();
        const queue: IBfsQueueItem[] = [{ point: this, history: [], accumulatedWeight: 0 }];
        lowestWeightsToPoint.set( this.toString(), 0 );
        let current: IBfsQueueItem;
        // the lowest weight that any path has accumulated on a complete path to the target point
        let fastestFinish: IBfsQueueItem = { point: null, history: [], accumulatedWeight: Number.MAX_VALUE };
        let i = 0;
        while ( !(queue.length === 0 || queue[i] == null) ) {
            // normally a BFS would shift from the front of a queue and push new items to the queue.
            // The algorithm processes faster if we don't shift with each iteration, so instead we just keep track of the index of the item
            // in the queue we're processing.
            // But keep the queue small... every so often, trim it down.
            current = queue[i];
            if ( i === 10000 ) {
                queue.splice( 0, 10000 );
                i -= 10000;

                if ( showDebug ) {
                    console.log( 'path length:', current.history.length, 'queue size', queue.length );
                }
            }
            i++;


            if ( current.point.eq(o.target) ) {
                // we've arrived at the target destination - don't travel any further and record what it took to get here, so we can stop
                // other paths early
                if ( current.accumulatedWeight < fastestFinish.accumulatedWeight ) {
                    fastestFinish = current;
                }
                continue;
            }

            // check if this unfinished path can't finish faster than the fastest finish - abort early if so
            if ( fastestFinish.accumulatedWeight !== Number.MAX_VALUE ) {
                const distanceToEnd = current.point.taxicabDistanceTo( o.target );
                if ( current.accumulatedWeight + o.averageWeight * distanceToEnd >= fastestFinish.accumulatedWeight ) {
                    continue;
                }
            }

            // check the history of this path to see if another path has gotten to any of its former states faster
            let shouldContinue = false;
            for ( let j = 0; j < current.history.length; j++ ) {
                if ( lowestWeightsToPoint.get(current.history[j].stateKey) + o.fudgeFactor < current.history[j].accumulatedWeight ) {
                    shouldContinue = true;
                    break;
                }
            }
            if ( shouldContinue ) {
                continue;
            }

            // get the neighbors of the current point, and map to either null (if we're not going to travel there), or the item to add to the queue
            o.getNeighbors( current.point, current.history ).forEach( n => {
                if ( !o.canVisitNeighbor(n, current.point, current.history) ) {
                    return;
                }
                const totalWeightToTravel = current.accumulatedWeight + o.getPointWeight( n, current.point );
                const newHistoryItem: IPathHistoryItem = {
                    accumulatedWeight: totalWeightToTravel,
                    point: n,
                    stateKey: '' // will be changed later
                };
                const pastPlusN = current.history.slice().concat( newHistoryItem );
                const stateKey = o.getStateKey( n, pastPlusN );
                newHistoryItem.stateKey = stateKey;
                
                const lowestWeightToNeighbor = lowestWeightsToPoint.get( stateKey ) ?? Number.MAX_VALUE;
                // don't travel if this point has already been visited and we're not allowed to revisit
                if (
                    lowestWeightToNeighbor != null &&
                    totalWeightToTravel >= lowestWeightToNeighbor + o.fudgeFactor
                ) {
                    return;
                }

                // we will travel to this point
                // add this point to the 'visited points' map, and to the history of the current path
                o.tap( n, current.history );
                lowestWeightsToPoint.set( stateKey, Math.min(lowestWeightToNeighbor, totalWeightToTravel) );
                // add this point to the back of the queue
                queue.push({ point: n, history: pastPlusN, accumulatedWeight: totalWeightToTravel });
            });
        }
        return {
            history: fastestFinish.history,
            totalWeight: fastestFinish.accumulatedWeight
        };
    }

    /** an alias for `quickestPath` */
    shortestPath( options: IPathfindingOptions ) {
        return this.quickestPath( options );
    }
}

