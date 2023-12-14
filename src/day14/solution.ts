import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { XYZ } from '../util/xyz';
import { parseAsYxGrid } from '../util/grid';

function parse( input: string ) {
    let grid = parseAsYxGrid( input );
    // add walls to all sides of the grid
    const hashRow = new Array(grid[0].length).fill( '#' );
    grid.unshift( hashRow.slice() );
    grid.push( hashRow.slice() );
    return grid.map( row => row = [ '#', ...row, '#' ] );
}

/** calculates the total load on the north support beams. Assumes the grid has an added wall of #'s around it. */
function sumLoad( grid: string[][] ) {
    return sum(
        grid.map( (row, i) => {
            const numRocks = row.filter( t => t === 'O' ).length;
            return numRocks * ( grid.length - 1 - i );
        })
    );
}

function solve2( grid: string[][] ) {
    const numCycles = 1000000000;
    const tiltCycle = [
        new XYZ( [0, -1] ),
        new XYZ( [-1, 0] ),
        new XYZ( [0, 1] ),
        new XYZ( [1, 0] )
    ];
    
    const pastStates = new Map<string,number>();

    for ( let i = 0; i < numCycles; i++ ) {
        // tilt in all four directions
        tiltCycle.forEach( direction => tilt(grid, direction) );

        const gridString = grid.map( row => row.join('') ).join('\n');
        const pastIteration = pastStates.get( gridString );
        if ( pastIteration != null ) {
            // find a past iteration that would have the same state as the very large cycle number
            const targetIteration = ( (numCycles - i) % (i - pastIteration) ) + pastIteration - 1;
            // restore the grid from the past state
            grid = parseAsYxGrid( [...pastStates.entries()].find( e => e[1] === targetIteration )[0] )
            break;
        }
        pastStates.set( gridString, i );
    }

    return sumLoad( grid );
}

// moves rocks in a single row or column, moving all the rocks toward the start of the loop
function moveRocks(
    getCharAt: (i: number) => string,
    setCharAt: (i: number, newChar: string) => void,
    start: number,
    end: number,
    increment: number
) {
    let restingSpot: number;
    for ( let i = start; increment > 0 ? i < end : i > end; i += increment ) {
        if ( getCharAt(i) === '#' ) {
            restingSpot = null;
        } if ( getCharAt(i) === '.' && 'O#'.includes( getCharAt(i - increment) ) ) {
            restingSpot = i;
        } else if ( getCharAt(i) === 'O' && restingSpot != null ) {
            setCharAt( restingSpot, 'O' );
            setCharAt( i, '.' );
            restingSpot += increment;
        }
    }
}

function tilt( yxGrid: string[][], direction: XYZ ) {
    // shorthand functions to reduce the number of duplicated inline function declarations
    const tiltX = (y: number, ...rest ) => moveRocks.call( this, x => yxGrid[y][x], (x, char) => yxGrid[y][x] = char, ...rest );
    const tiltY = (x: number, ...rest ) => moveRocks.call( this, y => yxGrid[y][x], (y, char) => yxGrid[y][x] = char, ...rest );
    if ( direction.x === -1 ) {
        yxGrid.forEach( (_, y) => tiltX(y, 0, yxGrid[y].length, 1) );       // tilt west
    } else if ( direction.x === 1 ) {
        yxGrid.forEach( (_, y) => tiltX(y, yxGrid[y].length - 1, -1, -1) ); // tilt east
    } else if ( direction.y === -1 ) {
        yxGrid[0].forEach( (_, x) => tiltY(x, 0, yxGrid.length, 1) );       // tilt north
    } else if ( direction.y === 1 ) {
        yxGrid[0].forEach( (_, x) => tiltY(x, yxGrid.length - 1, -1, -1) ); // tilt south
    }
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => {
        const grid = parse( input );
        tilt( grid, new XYZ([0, -1]) );
        return sumLoad( grid );
    },
    // function that solves part 2
    ( input: string ) => solve2( parse(input) ),

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
