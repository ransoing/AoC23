import { range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, part2TestInput, testInput } from './inputs';

const numStrings = [ 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine' ];
const numStringIndexed = [ '', ...numStrings ];
const digitStrings = range( 0, 10 ).map( n => n.toString() );

function parseInput( input: string, useSpelledOutNumbers = false ) {

    const searchString = ( useSpelledOutNumbers ? numStrings.concat(digitStrings) : digitStrings ).join( '|' );

    const lines = input.split( '\n' ).map( line => {
        // the first and last spelled-out-number could potentially use the same letters, i.e. if the line was 'fiveight', the first
        // number is 5 and the last number is 8. Use string searching to find the first and last digits
        const firstDigit = toNumber(
            line.match( new RegExp(searchString) )[0]
        );
        const lastDigit = toNumber(
            reverse(
                reverse( line ).match( new RegExp(reverse(searchString)) )[0]
            )
        );

        return firstDigit * 10 + lastDigit;
    });

    return sum( lines );
}

/** reverses a string */
function reverse( str: string ) {
    return str.split( '' ).reverse().join( '' );
}

/** takes a digit as a string, or a spelled-out number, and converts it to a number */
function toNumber( str: string ): number {
    const numStringIndex = numStringIndexed.indexOf( str );
    const digitStringIndex = digitStrings.indexOf( str );
    return numStringIndex === -1 ? digitStringIndex : numStringIndex;
}

outputAnswers(
    testInput,
    officialInput,
    part2TestInput,
    officialInput,
    ( input: string ) => parseInput( input ), // function that solves part 1
    ( input: string ) => parseInput( input, true ) // function that solves part 2
);
