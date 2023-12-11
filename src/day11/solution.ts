import { isNumber } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { XYZ } from '../util/xyz';
import { flipRowsCols, parseAsYxGrid } from '../util/grid';

/** @param expansionAmount for each empty row/column, how many extra rows/columns will be added due to expansion? */
function solve( input: string, expansionAmount: number ) {

    const grid = parseAsYxGrid( input );
    const isDot = (char: string) => char === '.';

    // find which rows and columns have expanded
    const [ expandedRowIndexes, expandedColIndexes ] = [ grid, flipRowsCols(grid) ].map( charGrid => {
        return charGrid.map( (rowOrCol, i) => rowOrCol.every(isDot) ? i : null ).filter( isNumber );
    });

    // find coordinates of each galaxy
    const galaxyXyzs: XYZ[] = [];
    grid.forEach( (row, y) => {
        galaxyXyzs.push(
            ...[ ...row.join('').matchAll(/#/g) ].map( match => new XYZ([ match.index, y ]) )
        );
    });

    let sum = 0;
    // to run a function for each unique pair of galaxies, compare each galaxy to each galaxy in the array with a greater index
    galaxyXyzs.forEach( (galaxy, i) => {
        const otherGalaxyXyzs = galaxyXyzs.slice( i + 1 );
        otherGalaxyXyzs.forEach( otherGalaxy => {
            let distance = galaxy.taxicabDistanceTo( otherGalaxy );
            
            const addExtraDistance = (index: number, prop: string) => {
                if ( index > Math.min(galaxy[prop], otherGalaxy[prop]) && index <= Math.max(galaxy[prop], otherGalaxy[prop]) ) {
                    distance += expansionAmount;
                }
            }

            // add extra distance according to how many expanded rows and columns are between these two galaxies
            expandedColIndexes.forEach( i => addExtraDistance(i, 'x') );
            expandedRowIndexes.forEach( i => addExtraDistance(i, 'y') );
            sum += distance;
        });
    });
    return sum;
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input, 1 ),
    // function that solves part 2
    // the puzzle states "each empty row should be *replaced with* 1000000 empty rows", therefore we *add* that many minus 1
    ( input: string ) => solve( input, 999999 ),

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
