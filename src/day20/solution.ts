import { mapValues } from 'lodash';
import { outputAnswers } from '../output-answers';
import { conjunctionFrequency } from '../util/math';
import { readTextFile } from '../util/parse';

interface IModule {
    label: string;
    type: 'broadcaster' | '%' | '&';
    destinations: string[];
    // on or off for % module
    state: boolean;
    // low (false) or high (true) pulse
    memory: { [key: string]: boolean };
    lowPulsesSent: number;
    highPulsesSent: number;
}

function solve( input: string, solvePart2 = false ) {
    const modules = new Map<string,IModule>(
        input.split( '\n' ).map( line => {
            const destinations = line.substring( line.indexOf('>') + 1 ).split( ',' ).map( s => s.trim() );
            const label = line.match( /\w+/ )[0];
            return [
                label,
                {
                    label: label,
                    type: line[0] === 'b' ? 'broadcaster' : line[0] as IModule['type'],
                    destinations: destinations,
                    // on or off for % module
                    state: false,
                    // low (0) or high (1) pulse
                    memory: {}, // filled in later
                    lowPulsesSent: 0,
                    highPulsesSent: 0
                }
            ];
        })
    );

    // for all & modules, find their inputs
    Array.from( modules.values() ).filter( m => m.type === '&' ).forEach( m => {
        const inputs = Array.from( modules.values() ).filter( m2 => m2.destinations.includes(m.label) );
        inputs.forEach( input => m.memory[input.label] = false );
    });

    const queue: { pulse: boolean; module: IModule; sender?: string }[] = [];

    // low pulses are represented by `false`, and high pulses are represented by `true`
    const addToQueue = ( pulse: boolean, destinationName: string, sender?: IModule ) => {
        if ( sender != null ) {
            pulse ? sender.highPulsesSent++ : sender.lowPulsesSent++;
        }
        queue.unshift({
            pulse: pulse,
            module: modules.get( destinationName ),
            sender: sender?.label ?? ''
        });
    }

    // there is only one module which can send a pulse to module rx, and that's module jm.
    // Module jm is a conjunction module, so it will only send a low pulse to rx when it has received a high pulse from all its inputs.
    // From careful analysis of the button-press cycles (i.e. console.log statements), we learn that on button-press cycles where one of
    // jm's inputs sends a high pulse, that same input will send a low pulse before the cycle has completed.
    // This means that jm will only send a low pulse to rx if all of jm's inputs send it a high pulse in the same cycle.
    // We also learn from analysis that each of jm's inputs regularly sends a high pulse to it every n cycles, and that each of those cycles
    // starts at the 0th button press.
    // Keep track of what n is for each input.
    const jmInputMemoryLoops: { [key: string]: number } = mapValues( modules.get('jm')?.memory, () => null );
    let buttonPresses = 0;

    const pushButton = () => {
        buttonPresses++;
        addToQueue( false, 'broadcaster' );

        // process the queue
        while ( queue.length > 0 ) {
            const item = queue.pop();
            if ( item.module == null ) {
                continue;
            }

            if ( item.module.type === 'broadcaster' ) {
                item.module.destinations.forEach( d => addToQueue(false, d, item.module) );
            } else if ( item.module.type === '%' && !item.pulse ) {
                item.module.state = !item.module.state;
                item.module.destinations.forEach( d => addToQueue(item.module.state, d, item.module) );
            } else if ( item.module.type === '&' ) {
                if ( item.module.label === 'jm' ) {
                    // if this is the first time that one of jm's inputs sends a high pulse, record the cycle length
                    if ( jmInputMemoryLoops[item.sender] == null && item.pulse ) {
                        jmInputMemoryLoops[item.sender] = buttonPresses;
                    }
                }
                // remember the state of the input
                item.module.memory[item.sender] = item.pulse;
                const pulseToSend = !Object.values( item.module.memory ).every( p => p );
                // console.log( `${item.module.type}${item.module.label} sending ${pulseToSend} to `, item.module.destinations );
                item.module.destinations.forEach( d => addToQueue(pulseToSend, d, item.module) );
            }
        }
    }

    for ( let i = 0; i < (solvePart2 ? Number.MAX_SAFE_INTEGER : 1000); i++ ) {
        pushButton();
        if ( solvePart2 ) {
            const memoryLoopValues = Object.values( jmInputMemoryLoops );
            // if we've found all cycle lengths, output when they will all coincide
            if ( memoryLoopValues.every(v => v != null) ) {
                return conjunctionFrequency( ...memoryLoopValues );
            }
        }
    };

    // finish solving for part 1
    let totalLow = 1000; // every button push sends a low pulse, which is not accounted for in the rest of the code
    let totalHigh = 0;
    Array.from( modules.values() ).forEach( m => {
        totalLow += m.lowPulsesSent;
        totalHigh += m.highPulsesSent;
    });
    return totalLow * totalHigh;
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input ),
    // function that solves part 2
    ( input: string ) => solve( input, true ),

    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` ),
    readTextFile( `${__dirname}/full-input` ),
    readTextFile( `${__dirname}/full-input` )
);
