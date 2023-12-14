import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { parseIntegers, product } from '../util/misc';
import { XYZ } from '../util/xyz';
import { parseAsYxGrid } from '../util/grid';

function solve( input: string ) {
    
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input ),
    // function that solves part 2
    ( input: string ) => null,

    exampleInput,
    // fullInput,
    // exampleInput,
    // fullInput
);
