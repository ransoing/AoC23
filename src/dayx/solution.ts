import { sum } from 'lodash';
import { isPointInPolygon } from 'geolib';
import { outputAnswers } from '../output-answers';
import { parseAsYxGrid } from '../util/grid';
import { product } from '../util/math';
import { countDiffs } from '../util/misc';
import { readTextFile } from '../util/parse';
import { Range } from '../util/range';
import { XYZ } from '../util/xyz';
const areaOfPolygon = require( 'area-polygon' );

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
