import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

interface IColor { name: string, max: number };

function solve1( input: string ) {    
    const lines = input.split( '\n' );
    // the hypothetical number of cubes of each color in the bag
    const colors: IColor[] = [
        { name: 'red', max: 12 },
        { name: 'green', max: 13 },
        { name: 'blue', max: 14 }
    ];
    return lines.reduce( (total, line, i) => {
        // add the game number to the total if it does not have any impossible number of cubes of any color
        return total + ( colors.some(color => hasViolation(line, color)) ? 0 : i + 1 );
    }, 0 );
}

function hasViolation( line: string, color: IColor ) {
    // search for all instances of a number followed by the nae of the color and compare it to the max allowable value
    const matches = Array.from(
        line.matchAll( new RegExp('\\d+ ' + color.name, 'g') )
    );
    // a string like '13 blue' conveniently parses to the number value `13`
    return matches.some( match => parseInt(match[0]) > color.max );
}

function solve2( input: string ) {
    const colors = [ 'red', 'green', 'blue' ];
    return sum(
        // calculate the power of each set
        input.split( '\n' ).map( line => {
            // for each color, find the highest number, and multiply those numbers together
            return colors.reduce( (product, color) => {
                // parse each value associated with this color
                const vals = Array.from(
                    line.matchAll( new RegExp('\\d+ ' + color, 'g') )
                ).map( match => parseInt(match[0]) );
                // multiply the running product with the highest value, or 0 if there was no value
                return product * ( vals.length === 0 ? 0 : Math.max(...vals) );
            }, 1 );
        })
    );
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve1( input ),
    // function that solves part 2
    ( input: string ) => solve2( input ),

    testInput,
    officialInput,
    testInput,
    officialInput
);
