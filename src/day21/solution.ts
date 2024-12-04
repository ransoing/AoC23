import { memoize, sum } from 'lodash';
import { isPointInPolygon } from 'geolib';
import { outputAnswers } from '../output-answers';
import { parseAsYxGrid } from '../util/grid';
import { product } from '../util/math';
import { countDiffs } from '../util/misc';
import { readTextFile } from '../util/parse';
import { Range } from '../util/range';
import { Range2D } from '../util/range2d';
import { Range3D } from '../util/range3d';
import { XYZ } from '../util/xyz';
const areaOfPolygon = require( 'area-polygon' );

function solve( input: string, testSteps: number, fullSteps: number, repeatingGrid = false ) {
    const grid = parseAsYxGrid( input );
    const startRow = grid.find( row => row.includes('S') );
    const start = new XYZ([ startRow.indexOf('S'), grid.indexOf(startRow) ]);

    const endTiles = new Set<string>();

    const step = memoize( stepRaw, (a,b,c) => `${a.toString()}:${b.toString()}:${c.toString()}` );

    // a recursive function that adds items to `endTiles`
    function stepRaw( stepsRemaining: number, currentPos: XYZ, wraps: XYZ ) {
        if ( stepsRemaining === 0 ) {
            endTiles.add( `${currentPos.toString()}:${wraps.toString()}` );
            return;
        }
        currentPos.neighbors().forEach( n => {
            let newWraps = wraps.copy();
            if ( repeatingGrid ) {
                if ( n.y < 0 ) {
                    newWraps.y--;
                } else if ( n.y >= grid.length ) {
                    newWraps.y++;
                }
                if ( n.x < 0 ) {
                    newWraps.x--;
                } else if ( n.x >= startRow.length ) {
                    newWraps.x++;
                }
                n.x = ( n.x + startRow.length ) % startRow.length;
                n.y = ( n.y + grid.length ) % grid.length;
            }
            if ( '.S'.includes(n.valueIn(grid)) ) {
                step( stepsRemaining - 1, n, newWraps );
            }
        });
    }

    // the number of available steps differs between test and full inputs
    const startSteps = startRow.length < 20 ? testSteps : fullSteps;
    step( startSteps, start, new XYZ([0,0]) );
    return endTiles.size;
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input, 6, 64 ),
    // function that solves part 2
    ( input: string ) => solve( input, 100, 26501365, true ),

    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` ),
    readTextFile( `${__dirname}/example-input` ),
    // readTextFile( `${__dirname}/full-input` )
);
