import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';
import { XYZ } from '../util/xyz';

function parseInput( input: string ) {
    
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => parseInput( input ),
    // function that solves part 2
    ( input: string ) => null
);
