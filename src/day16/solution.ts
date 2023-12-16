import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { XYZ } from '../util/xyz';
import { parseAsYxGrid } from '../util/grid';

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
            // move in the given direction
            travel({ location: loc.location.plus(loc.direction), direction: loc.direction });
        } else if ( tile === '|' ) {
            if ( loc.direction.x === 0 ) {
                // travel through
                travel({ location: loc.location.plus(loc.direction), direction: loc.direction });
            } else {
                // travel up and down
                travel({
                    location: loc.location.plus([ 0, -1 ]),
                    direction: new XYZ([ 0, -1 ])
                });
                travel({
                    location: loc.location.plus([ 0, 1 ]),
                    direction: new XYZ([ 0, 1 ])
                });
            }
        } else if ( tile === '-' ) {
            if ( loc.direction.y === 0 ) {
                // travel through
                travel({ location: loc.location.plus(loc.direction), direction: loc.direction });
            } else {
                // travel left and right
                travel({
                    location: loc.location.plus([ -1, 0 ]),
                    direction: new XYZ([ -1, 0 ])
                });
                travel({
                    location: loc.location.plus([ 1, 0 ]),
                    direction: new XYZ([ 1, 0 ])
                });
            }
        } else if ( tile === '/' ) {
            const diff = loc.direction.x === 1 ? [ 0, -1 ] :
                loc.direction.x === -1 ? [ 0, 1 ] :
                loc.direction.y === 1 ? [ -1, 0 ] :
                [ 1, 0 ];
            travel({
                location: loc.location.plus( diff ),
                direction: new XYZ( diff )
            });
        } else if ( tile === '!' ) { // backslash \
            const diff = loc.direction.x === 1 ? [ 0, 1 ] :
                loc.direction.x === -1 ? [ 0, -1 ] :
                loc.direction.y === 1 ? [ 1, 0 ] :
                [ -1, 0 ];
            travel({
                location: loc.location.plus( diff ),
                direction: new XYZ( diff )
            });
        }
    }
}

function solve2( input: string ) {
    const grid = parseAsYxGrid( input );
    // try shooting a beam in from every edge space
    // try left and right sides
    let maxEnergized = 0;
    grid.forEach( (_, y) => {
        maxEnergized = Math.max(
            maxEnergized,
            getNumEnergizedTiles( grid, {
                location: new XYZ([0, y]),
                direction: new XYZ([1, 0])
            }),
            getNumEnergizedTiles( grid, {
                location: new XYZ([grid[0].length - 1, y]),
                direction: new XYZ([-1, 0])
            })
        );
    });
    // try top and bottom sides
    grid[0].forEach( (_, x) => {
        maxEnergized = Math.max(
            maxEnergized,
            getNumEnergizedTiles( grid, {
                location: new XYZ([x, 0]),
                direction: new XYZ([0, 1])
            }),
            getNumEnergizedTiles( grid, {
                location: new XYZ([x, grid.length - 1]),
                direction: new XYZ([0, -1])
            })
        );
    });

    return maxEnergized;
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

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
