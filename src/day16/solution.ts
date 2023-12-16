import { outputAnswers } from '../output-answers';
import { Coordinate, XYZ } from '../util/xyz';
import { parseAsYxGrid } from '../util/grid';
import { readTextFile } from '../util/misc';

interface IBeam {
    location: XYZ;
    direction: XYZ;
}

function getNumEnergizedTiles( grid: string[][], beamStart: IBeam ): number {
    const tileIsEnergized = new Set<string>();
    // a combo of location and direction
    const tileStates = new Set<string>();

    travel( beamStart );
    return tileIsEnergized.size;

    function step( loc: IBeam, direction: Coordinate ) {
        travel({
            location: loc.location.plus( direction ),
            direction: XYZ.normalize( direction )
        });
    }

    function travel( loc: IBeam ) {
        const tile = loc.location.valueIn( grid );
        const state = `${loc.location}:${loc.direction}`;
        // quit if it's off the map or if we've been in this state (avoid infinite loops)
        if ( tile == null || tileStates.has(state) ) {
            return;
        }
        tileIsEnergized.add( loc.location.toString() );
        tileStates.add( `${loc.location}:${loc.direction}` );

        if ( tile === '.' ) {
            step( loc, loc.direction ) // travel through
        } else if ( tile === '|' ) {
            if ( loc.direction.x === 0 ) {
                step( loc, loc.direction ); // travel through
            } else {
                step( loc, [ 0, -1 ] ); // travel up
                step( loc, [ 0, 1 ] ); // travel down
            }
        } else if ( tile === '-' ) {
            if ( loc.direction.y === 0 ) {
                step( loc, loc.direction ) // travel through
            } else {
                step( loc, [ -1, 0 ] ); // travel left
                step( loc, [ 1, 0 ] ); // travel right
            }
        } else if ( tile === '/' ) {
            step( loc, [ -loc.direction.y, -loc.direction.x ] );
        } else if ( tile === '\\' ) {
            step( loc, [ loc.direction.y, loc.direction.x ] );
        }
    }
}

function solve2( input: string ) {
    const grid = parseAsYxGrid( input );
    // try shooting a beam in from every edge space

    // try left and right sides
    return Math.max(
        ...grid.map( (_, y) => {
            return Math.max(
                getNumEnergizedTiles( grid, {
                    location: new XYZ([0, y]),
                    direction: new XYZ([1, 0])
                }),
                getNumEnergizedTiles( grid, {
                    location: new XYZ([grid[0].length - 1, y]),
                    direction: new XYZ([-1, 0])
                })
            );
        }),
        // try top and bottom sides
        ...grid[0].map( (_, x) => {
            return Math.max(
                getNumEnergizedTiles( grid, {
                    location: new XYZ([x, 0]),
                    direction: new XYZ([0, 1])
                }),
                getNumEnergizedTiles( grid, {
                    location: new XYZ([x, grid.length - 1]),
                    direction: new XYZ([0, -1])
                })
            );
        })
    );
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => getNumEnergizedTiles(
        parseAsYxGrid(input),
        {
            location: new XYZ( [0, 0] ),
            direction: new XYZ( [1, 0] )
        }
    ),
    // function that solves part 2
    ( input: string ) => solve2( input ),

    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` ),
    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` )
);
