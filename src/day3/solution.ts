import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';
import { XYZ } from '../util/xyz';

function solvePart1( input: string ) {
    const lines = input.split( '\n' );
    const nums: number[] = [];

    lines.forEach( (line, y) => {
        for ( const match of line.matchAll(/\d+/g) ) {
            // for each digit in this number, check if there is a symbol adjacent to it
            const hasAdjacentSymbol = match[0].split( '' ).some( (digit, i) => {
                const neighbors = new XYZ([ match.index + i, y ]).neighbors( true );
                return neighbors.some( neighbor => {
                    return !!( lines[neighbor.y]?.charAt(neighbor.x) ?? '.' ).match( /[^0-9.]/ )
                });
            });
            if ( hasAdjacentSymbol ) {
                nums.push( parseInt(match[0]) );
            }
        }
    });

    return sum( nums );
}

function solvePart2( input: string ) {
    const lines = input.split( '\n' );
    const partNumbers: {
        value: number;
        adjacentGears: XYZ[];
    }[] = [];
    
    lines.forEach( (line, y) => {
        for ( const match of line.matchAll(/\d+/g) ) {
            // find all the adjacent gears to all the digits of this part number
            const neighborGears: XYZ[] = [];
            match[0].split( '' ).forEach( (digit, i) => {
                neighborGears.push(
                    ...new XYZ([ match.index + i, y ]).neighbors( true ).filter( neighbor => {
                        return ( lines[neighbor.y]?.charAt(neighbor.x) ?? '.' ) === '*';
                    })
                );
            });
            if ( neighborGears.length > 0 ) {
                partNumbers.push({
                    value: parseInt( match[0] ),
                    adjacentGears: neighborGears
                });
            }
        }
    });

    // find all gears and filter to those that have exactly two neighboring part numbers
    return sum( lines.map( (line, y) => {
        return sum(
            [ ...line.matchAll(/\*/g) ].map( match => {
                // how many neighboring part numbers does this gear have?
                const nearPartNumbers = partNumbers.filter(
                    partNum => partNum.adjacentGears.some( gear => gear.eq([ match.index, y ]) )
                );
                return nearPartNumbers.length === 2 ? nearPartNumbers[0].value * nearPartNumbers[1].value : 0;
            })
        )
    }));
}

outputAnswers(
    testInput,
    officialInput,
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => solvePart1( input ),
    // function that solves part 2
    ( input: string ) => solvePart2( input )
);
