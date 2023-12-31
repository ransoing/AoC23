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
 * Finds the least common multiple of the given numbers.
 * In other words, given multiple concurrent repeating cycles each with a given number of steps and starting at step 0, finds the least
 * number of steps > 0 where all cycles once again simultaneously reach step 0.
 * @example `leastCommonMultiple( 4, 5, 10 )` = 20
 */
export function leastCommonMultiple( ...patternLengths: number[] ): number {
    return patternLengths.reduce( (total, steps) => {
        const largestFactor = Math.max( ...intersection( ...[total, steps].map(n => factorsOf(n)) ) );
        return ( total * steps ) / largestFactor;
    }, 1 );
}

/** alias of `leastCommonMultiple` */
export const conjunctionFrequency = leastCommonMultiple;


interface IRollProbability {
    /** the sum of all die rolls for this unique combination of rolled values */
    rollTotal: number;
    /** the probability (0 < p <= 1 ) that this roll total will occur out of all possible roll totals */
    probability: number;
    /** the number of different possible die roll combinations that results in this total */
    occurenceCount: number;
}

/**
 * Given multiple die sizes, returns info on probabilities of rolling different totals.
 * @example `rollProbabilities( 6, 6 )` to get probabilities when rolling two D6's.
 */
export function rollProbabilities( ...dieSizes: number[] ): IRollProbability[] {
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
