import { range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { parseIntegers, product } from '../util/misc';

/**
 * 
 * The solution I use is inefficient, but fast enough to find the answer in a reasonable amount of time.
 * I run through all the possible integer combinations of `a + b = t`, where `t` is the total time of the race.
 * I only really need to find half the integer combinations, since we only care about the product of the integers, and we see each combo
 * twice if we don't care about the order of the integers (which we indeed don't).
 * For an even faster solution, I could do a binary search to find which integer combination results in a product closest to the record
 * distance for that race, and easily find the number of integer combos that use integers closer to the time's square root.
 *
 * ...but this solution runs fast enough and is very tiny :)
 */

function solve( values: number[][] ) {
    // values[0][n] represents the duration of a race, and value[1][n] represents the distance. n represents a race
    return product(
        // for each race, count the total number of ways to win. Don't bother with calculating the cases for 0 and t since the total distance would be 0.
        values[0].map( (_, i) => {
            return range( 1, values[0][i] ).filter(
                msHeld => msHeld * ( values[0][i] - msHeld ) > values[1][i]
            ).length
        })
    );
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input.split('\n').map( line => parseIntegers(line) ) ),
    // function that solves part 2
    ( input: string ) => solve( input.split('\n').map( line => parseIntegers(line.replaceAll(/ /g, '')) ) ),

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
