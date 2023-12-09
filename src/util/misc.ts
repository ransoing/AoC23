import { intersection } from 'lodash';

/** returns an array of multi-digit numbers found in a string, parsed as integers */
export function parseIntegers( str: string ): number[] {
    return [ ...str.matchAll( /\d+/g ) ].map( match => parseInt(match[0]) );
}

/** returns the product of all numbers in the array */
export function product( nums: number[] ): number {
    return nums.reduce( (total, num) => total * num, 1 );
}

/** returns all factors of an integer as an unsorted array */
export function factorsOf( num: number ): number[] {
    const sqrt = Math.sqrt( num );
    const factors = [ 1, num ];
    if ( Math.round(sqrt) === sqrt ) {
        factors.push( sqrt );
    }
    for ( let i = 2; i < sqrt; i++ ) {
        const quotient = num / i;
        if ( Math.round(quotient) === quotient ) {
            factors.push( i, quotient );
        }
    }
    return factors;
}

/**
 * given multiple concurrent repeating patterns each with a given number of steps and starting at step 0, finds the least number of
 * steps > 0 where all patterns once again reach step 0
 */
export function jointFrequency( patternLengths: number[] ): number {
    return patternLengths.reduce( (total, steps) => {
        const largestFactor = Math.max( ...intersection( ...[total, steps].map(n => factorsOf(n)) ) );
        return ( total * steps ) / largestFactor;
    }, 1 );
}
