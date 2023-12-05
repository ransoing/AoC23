import { range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string, sumLength = 1 ) {
    const nums = input.split( '\n' ).map( Number );
    return range( nums.length - sumLength + 1 ).filter(
        (_, i) => i > 0 && sum( nums.slice(i, i + sumLength) ) > sum( nums.slice(i-1, i-1 + sumLength) )
    ).length;
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => parseInput( input ), // function that solves part 1
    ( input: string ) => parseInput( input, 3 ) // function that solves part 2
);
