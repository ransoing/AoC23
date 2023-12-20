import { memoize, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';
import { parseIntegers } from '../util/parse';

function solve( input: string, repeatFactor: number ) {
    return sum(
        input.split( '\n' ).map( line => {
            const split = line.split( ' ' );
            // the memoize cache isn't very useful across different lines of input, so clear its cache
            consumeLine.cache.clear();
            return consumeLine(
                new Array( repeatFactor ).fill( split[0] ).join( '?' ),
                new Array( repeatFactor ).fill( parseIntegers(split[1]) ).flat()
            );
        })
    );
}

function consumeLineRaw( line: string, groups: number[] ): number {
    // stop if we've satisfied all the required groups
    if ( groups.length === 0 ) {
        // this is a possible arrangement if there are no more '#' in the line
        return line.indexOf('#') === -1 ? 1 : 0;
    } else if ( line.length === 0 ) {
        // if there are still groups to satisfy and there is no more string to consume, this is not a possible arrangement
        return 0;
    }

    // stop early if there aren't even enough characters left to fit all the remaining groups
    if ( line.length < sum(groups) + groups.length - 1 ) {
        return 0;
    }

    if ( line[0] === '?' ) {
        // consume both the case where this is interpreted as '.' and where this is interpreted as '#'
        return consumeDot( line, groups ) + consumeHash( line, groups );
    } else {
        // consume the character only based on what it is - either '.' or '#'
        return line[0] === '.' ? consumeDot( line, groups ) : consumeHash( line, groups );
    }
}

// memoize the recursive function to cache results of the function call - otherwise part 2 won't solve in a reasonable timeframe
const consumeLine = memoize( consumeLineRaw, (line, groups) => `${line}:${groups}` );

function consumeDot( line: string, groups: number[] ) {
    // skip over the '.' character without modifying what groups remain
    return consumeLine( line.substring(1), groups );
}

function consumeHash( line: string, groups: number[] ) {
    // with the next required group size being n, this consumes the '#' if the next n characters are all `?` or `#`, and the character
    // after that is not `#` - otherwise it would not be a valid arrangement and returns 0
    return !line.substring( 0, groups[0] ).includes( '.' ) && line[groups[0]] !== '#' ?
        consumeLine( line.substring(groups[0]+1), groups.slice(1) ) : 0;
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input, 1 ),
    // function that solves part 2
    ( input: string ) => solve( input, 5 ),

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
