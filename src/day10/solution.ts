import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput, exampleInput2 } from './inputs';
import { XYZ } from '../util/xyz';
import { parseAsYxGrid } from '../util/grid';

// a map of the tile types that have connect with adjacent tiles in each of the 4 directions
// use xyz coordinates in the keys because thats what XYZ.prototype.toString returns.
// positive y is down, positive x is right
const diffMap = new Map<string, string>([
    [ '0,-1,0', 'S|LJ' ], // tiles that connect north
    [ '1,0,0', 'S-LF' ], // tiles that connect east
    [ '0,1,0', 'S|7F' ], // tiles that connect south
    [ '-1,0,0', 'S-J7' ], // tiles that connect west
]);


function findLoop( input: string ) {
    // find the start location of the animal, marked by 'S'
    const grid = parseAsYxGrid( input );
    const rowWithS = grid.findIndex( row => row.includes('S') );
    const start = new XYZ([ grid[rowWithS].indexOf('S'), rowWithS ]);

    // this finds how long it is around the whole loop
    return start.floodFill({
        canVisitNeighbor: ( neighbor, p ) => {
            const [ pTile, nTile ] = [ p, neighbor ].map( point => point.valueIn(grid) );
            // return if the current point can travel in the direction of the neighbor point and vice versa
            return diffMap.get( neighbor.minus(p).toString() ).includes( pTile ) &&
                diffMap.get( p.minus(neighbor).toString() ).includes( nTile );
        }
    }).visitedPoints;
}

/** finds the number of points inside the loop by determining how many times a vector starting at a point crosses the walls of the loop */
function findEnclosed( input ) {
    const grid = parseAsYxGrid( input );

    // coordinates represented as strings
    const isLoopTile = new Map<string,boolean>();
    findLoop( input ).forEach( p => isLoopTile.set(p.toString(), true) );

    return sum(
        grid.map( (row,y) => {
            return row.filter( (p, x) => {
                if ( isLoopTile.get(`${x},${y},0`) ) {
                    return false;
                }
                // how many times do we cross a vertical part of the loop when we try to go from this point to the outside of the grid?
                // get all vertical loop segments to the right of this tile and join as a string,
                // and count the number of vertical segments and elbows that turn in opposite directions which result in a crossing
                const verticals = row.slice( x + 1 ).filter( (point, x2) => {
                    return isLoopTile.get(`${x+x2+1},${y},0` ) && 'FJL7|'.includes( point );
                }).join( '' );
                return [ ...verticals.matchAll( /\||FJ|L7/g ) ].length % 2 === 1;
            }).length
        })
    );
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => findLoop( input ).length / 2,
    // function that solves part 2
    ( input: string ) => findEnclosed( input ),

    exampleInput,
    fullInput,
    exampleInput2,
    fullInput
);
