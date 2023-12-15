import { findLastIndex, first, groupBy, last, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';

function solve2( input: string ) {
    // parse info about each step of the instructions
    let allSteps = input.split( ',' ).map( (step, i) => {
        const [ _, label, op, fl ] = step.match( /(\w+)(.)(.?)/ );
        return { label, op, fl, i, box: hash(label) };
    });

    return sum(
        // group instruction steps by lens label
        Object.values( groupBy(allSteps, 'label') )
        // for each lens, ignore all steps up to and including any `-` operation.
        // When we remove a lens, what we did with it previously makes no difference in the end
        .map( steps => steps.slice(1 + findLastIndex(steps, s => s.op === '-')) )
        // remove lenses which aren't even included in the end
        .filter( steps => steps.length !== 0 )
        // get the focusing power - the focal length (FL) is the FL of the lens' last step, and its position in a box is determined by
        // the number of other lenses that were first inserted in the same box before this lens was first inserted
        .map( (steps, _, lenses) => {
            const lensPosition = lenses.map( first ).filter(
                l => l.box === steps[0].box && l.i < steps[0].i
            ).length;
            return (1 + steps[0].box) * (1 + lensPosition) * parseInt( last(steps).fl );
        })
    );
}

function hash( str: string ) {
    return str.split( '' ).reduce(
        (total, c) => ( (total + c.charCodeAt(0)) * 17 ) % 256, 0
    )
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => sum( input.split(',').map(hash) ),
    // function that solves part 2
    ( input: string ) => solve2( input ),

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
