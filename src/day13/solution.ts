import { isEqual, size, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { flipRowsCols, parseAsYxGrid } from '../util/grid';

/**
 * a function to compare two arrays of rows, or two arrays of columns, assuming they have been truncated to be the same length, and that
 * `b` has been reversed.
 */
type CompareFunc = ( a: string[], b: string[] ) => boolean;

function solve( input: string, compare: CompareFunc ) {
    return sum( input.split('\n\n').map( block => {
        const rotations = [
            {
                // these "lines" represent rows, and can be used to check for vertical reflection
                lines: block.split( '\n' ),
                scalar: 100
            }, {
                // these "lines" represent columns, and can be used to check for horizontal reflection
                lines: flipRowsCols( parseAsYxGrid(block) ).map( line => line.join('') ),
                scalar: 1
            }
        ];

        // loop through the rows and columns of the block, attempting to find where it's a mirror image
        for ( let r = 0; r < rotations.length; r++ ) {
            for ( let i = 0; i < rotations[r].lines.length; i++ ) {
                const score = isMirrorAt( rotations[r].lines, i, rotations[r].scalar, compare );
                if ( score != null ) {
                    return score;
                }
            }
        }
    }));
}

function isMirrorAt( lines: string[], i: number, scoreScalar: number, compare: CompareFunc ) {
    // I could check `lines[i] === lines[i+1]` but it still runs very fast without it, and part 2 would fail with it included
    const halves = [ lines.slice(0, i + 1), lines.slice(i + 1).reverse() ];
    // slice off the longer half so its as long as the shorter half, and compare the two halves for "equality"
    const maxLines = Math.min( ...halves.map(size) );
    if ( compare.apply(this, halves.map( h => h.slice(-maxLines) )) ) {
        return scoreScalar * ( i + 1 );
    }
}

function hasOneDifference( firstHalf: string, secondHalf: string ) {
    // return true if the two strings have exactly one difference between them
    let diffs = 0;
    for ( let i = 0; i < firstHalf.length; i++ ) {
        if ( firstHalf[i] !== secondHalf[i] ) {
            if ( ++diffs > 1 ) {
                return false;
            }
        }
    }
    return diffs === 1;
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input, (a, b) => isEqual(a, b) ),
    // function that solves part 2
    // the two potentially mirrored "halves" are considered equal if they have exactly one difference
    ( input: string ) => solve( input, (a, b) => hasOneDifference( a.join('|'), b.join('|') ) ),

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
