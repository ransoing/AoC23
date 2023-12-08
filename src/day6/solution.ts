import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { XYZ } from '../util/xyz';

function parseInput( input: string ) {
    
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => parseInput( input ),
    // function that solves part 2
    ( input: string ) => null,

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
