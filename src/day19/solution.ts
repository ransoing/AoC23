import { clone, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { product } from '../util/math';
import { readTextFile } from '../util/parse';

/** these types describe objects with 'x', 'm', 'a', and 's' properties */
type Part = { [key: string]: number };
type Ranges = { [key: string]: [number, number] };

function solve( input: string ) {
    const blocks = input.split( '\n\n' ).map( block => block.split('\n') );
    
    const workflows = parseWorkflows( blocks[0] )

    const parts: Part[] = blocks[1].map(
        line => JSON.parse( line.replaceAll(/(\w)=/g,'"$1":') )
    );

    const doThenClause = ( part: Part, instruction: string ) => {
        return instruction === 'A' ? true : // part is accepted
            instruction === 'R' ? false : // part is rejected
            processWorkflow( part, instruction ); // send part to next workflow
    }

    const processWorkflow = ( part: Part, workflowLabel: string ) => {
        const steps = workflows.get(workflowLabel);
        for ( let i = 0; i < steps.length; i++ ) {
            if ( steps[i].includes(':') ) {
                const split = steps[i].split(':');
                if ( eval(`part.${split[0]}`) ) {
                    return doThenClause( part, split[1] );
                }
            } else {
                return doThenClause( part, steps[i] );
            }
        }
    };

    return sum(
        parts.filter(
            part => processWorkflow( part, 'in' )
        ).map(
            part => sum( Object.values(part) )
        )
    );
}

function solve2( input: string ) {
    const blocks = input.split( '\n\n' ).map( block => block.split('\n') );
    const workflows = parseWorkflows( blocks[0] );

    const [ rangeMin, rangeMax ] = [ 1, 4001 ];
    const startRanges: Ranges = {
        x: [rangeMin, rangeMax],
        m: [rangeMin, rangeMax],
        a: [rangeMin, rangeMax],
        s: [rangeMin, rangeMax]
    };

    const doThenClause = ( ranges: Ranges, instruction: string ) => {
        return instruction === 'A' ? combos( ranges ) :
            instruction === 'R' ? 0 :
            countNumValidRanges( ranges, instruction );
    }

    const countNumValidRanges = ( ranges: Ranges, workflowLabel: string ) => {
        if ( Object.values(ranges).some( range => range[1] - range[0] === 0) ) {
            return 0;
        }

        let validRanges = 0;

        const steps = workflows.get(workflowLabel);
        for ( let i = 0; i < steps.length; i++ ) {
            const step = steps[i];
            if ( step.includes(':') ) {
                const prop = step[0];
                const num = parseInt( step.substring(2) );
                const splitRange = clone( ranges );
                splitRange[prop] = rangeOverlap( ranges[prop], step[1] === '<' ? [rangeMin, num] : [num+1, rangeMax] );
                ranges[prop] = rangeOverlap( ranges[prop], step[1] === '<' ? [num, rangeMax] : [rangeMin, num+1] );
                
                validRanges += doThenClause( splitRange, step.split(':')[1] );
            } else {
                validRanges += doThenClause( ranges, step );
            }
        }

        return validRanges;
    }

    return countNumValidRanges( startRanges, 'in' );
}

/** returns a map of <workflowLabel, steps[]> */
function parseWorkflows( lines: string[] ) {
    return new Map<string,string[]>(
        lines.map( line => {
            const matches = line.match( /(\w+)\{(.+)\}/ );
            return [ matches[1], matches[2].split(',') ];
        })
    );
}

/** calculates the number of possible combinations for all given ranges of x, m, a, and s */
function combos( r: Ranges ) {
    return product(
        ...Object.values(r).map( range => range[1] - range[0] )
    );
}

/** returns the overlap between two ranges of numbers */
function rangeOverlap( r1: [number, number], r2: [number, number] ): [number, number] {
    const overlap: [number, number] = [ Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1]) ];
    if ( overlap[1] < overlap[0] ) {
        return [0, 0];
    }
    return overlap;
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input ),
    // function that solves part 2
    ( input: string ) => solve2( input ),

    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` ),
    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` )
);
