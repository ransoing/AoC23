import { intersection } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput, exampleInput2 } from './inputs';
import { factorsOf } from '../util/misc';

/**
 * This solution makes an oversight, but happens to give the correct answer.
 *
 * For part 2, it assumes that if it takes n steps to go from xxA to xxZ, it will take n more steps to get to xxZ again.
 * This isn't necessarily true, because n and the length of the number of LR directions could cause a different number of steps
 * after the first journey to xxZ.
 */

type Parsed = {
    directions: string;
    nodes: Map<string, { L: string; R: string }>;
};

function parseInput( input: string ): Parsed {
    const lines = input.split( '\n' );
    return {
        directions: lines[0],
        nodes: new Map(
            lines.slice( 2 ).map( line => {
                const labels = [ ...line.matchAll( /\w{3}/g ) ];
                return [
                    labels[0][0],
                    { L: labels[1][0], R: labels[2][0] }
                ];
            })
        )
    };
}

function solve1( parsed: Parsed, startNode: string = 'AAA', nodeIsEnd: (n: string) => boolean = n => n === 'ZZZ' ) {
    let [ currentNode, stepsTaken ] = [ startNode, 0 ];
    while ( !nodeIsEnd(currentNode) ) {
        currentNode = parsed.nodes.get( currentNode )[ parsed.directions[stepsTaken++ % parsed.directions.length] ];
    }
    return stepsTaken;
}

function solve2( parsed: Parsed ) {
    // for each node that ends with 'A', find out how many steps it takes to get to a node that ends with 'Z'
    const loopLengths = [ ...parsed.nodes.keys() ].filter(
        key => key.endsWith( 'A' )
    ).map(
        aNode => solve1( parsed, aNode, node => node.endsWith('Z') )
    );

    // Each of the paths that go from 'xxA' to 'xxZ' is a loop.
    // To find the smallest number of steps where all the loops are simultaneously at the end, multiply each loopLength - after each time
    // we multiply two numbers, divide by the largest common factor
    return loopLengths.reduce( (total, steps) => {
        const largestFactor = Math.max( ...intersection( ...[total, steps].map(n => factorsOf(n)) ) );
        return ( total * steps ) / largestFactor;
    }, 1 );
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve1( parseInput(input) ),
    // function that solves part 2
    ( input: string ) => solve2( parseInput(input) ),

    exampleInput,
    fullInput,
    exampleInput2,
    fullInput
);
