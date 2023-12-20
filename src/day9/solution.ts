import { add, first, last, subtract, sum, uniq } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { parseIntegers } from '../util/parse';

function solve( input: string, getExtremity: (ns: number[]) => number, operator: (n1: number, n2: number) => number ) {
    /** returns the next or previous number in a sequence beyond the given numbers */
    const extend = (nums: number[]) => {
        const diffs = nums.slice( 1 ).map( (num, i) => num - nums[i] );
        return operator( getExtremity(nums), uniq(diffs).length === 1 ? diffs[0] : extend(diffs) );
    };

    return sum( input.split('\n').map(parseIntegers).map(extend) );
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input, last, add ),
    // function that solves part 2
    ( input: string ) => solve( input, first, subtract ),

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
