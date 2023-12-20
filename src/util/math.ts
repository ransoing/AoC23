import { groupBy, intersection, range, sum } from 'lodash';

/** returns the product of all numbers in the array */
export function product( ...nums: number[] ): number {
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
 * steps > 0 where all patterns once again simultaneously reach step 0.
 * In other words, finds the lowest number > 0 that is evenly divisible by all the given numbers.
 * @example `conjunctionFrequency( 4, 5, 10 )` = 20
 */
export function conjunctionFrequency( ...patternLengths: number[] ): number {
    return patternLengths.reduce( (total, steps) => {
        const largestFactor = Math.max( ...intersection( ...[total, steps].map(n => factorsOf(n)) ) );
        return ( total * steps ) / largestFactor;
    }, 1 );
}

/**
 * Given multiple die sizes, returns info on probabilities of rolling different totals.
 * @example `rollProbabilities( 6, 6 )` to get probabilities when rolling two D6's.
 */
export function rollProbabilities( ...dieSizes: number[] ) {
    let rollCombos = [];
    dieSizes.forEach( dieSize => {
        if ( rollCombos.length === 0 ) {
            rollCombos = range( 1, dieSize + 1 ).map( roll => [roll] );
        } else {
            const newRollCombos = [];
            range( 1, dieSize + 1 ).forEach( roll => {
                rollCombos.forEach( combo => newRollCombos.push(combo.concat(roll)) );
            });
            rollCombos = newRollCombos;
        }
    });
    const numCombos = dieSizes.reduce( (total, dieSize) => total * dieSize, 1 );
    // group roll combos by their sum, then convert the info to how many times each roll total occurs
    return Object.entries( groupBy(rollCombos, sum) ).map( entry => {
        return {
            rollTotal: parseInt( entry[0] ),
            probability: entry[1].length / numCombos,
            occurenceCount: entry[1].length
        };
    });
}
