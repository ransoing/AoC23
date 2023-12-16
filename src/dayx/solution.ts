import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { parseIntegers, product, readTextFile } from '../util/misc';
import { XYZ } from '../util/xyz';
import { parseAsYxGrid } from '../util/grid';

function solve( input: string ) {
    // const blocks = input.split( '\n\n' ).map( block => block.split('\n') );
    // const steps = input.split( '\n' ).map( line => line.split(',') );
    // const lines = input.split( '\n' );
    // const grid = parseAsYxGrid( input );
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input ),
    // function that solves part 2
    ( input: string ) => null,

    readTextFile( `${__dirname}/example-input` ),
    // readTextFile( `${__dirname}/full-input` ),
    // readTextFile( `${__dirname}/example-input` ),
    // readTextFile( `${__dirname}/full-input` )
);
