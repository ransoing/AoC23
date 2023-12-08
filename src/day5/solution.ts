import { chunk } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/**
 * My solution to day 2 uses "range arithmetic". Rather than brute-forcing a solution, I compare the source and destination ranges to
 * end up with a mapped set of new ranges. This solution took a while to suss out the logic for, but it executes very quickly.
 */

class Range {
    /** the `end` of the range is not inclusive */
    public end: number;
    constructor( public start: number, b: number, bIsEnd = false ) {
        // if `b` is not end, then `b` is length
        this.end = bIsEnd ? b : start + b;
    }

    /** returns whether this range includes a given number */
    includes( num: number ) {
        return num >= this.start && num < this.end;
    }
}

/** returns an array of multi-digit numbers found in a string, parsed as integers */
function parseNums( str: string ): number[] {
    return [ ...str.matchAll( /\d+/g ) ].map( match => parseInt(match[0]) );
}

function parseInput( input: string, parseSeedsAsPairs = false ) {
    const sections = input.split( '\n\n' );
    // `ranges` starts out tracking seeds, but tracks the current mapped values throughout the loop
    let ranges = parseSeedsAsPairs ?
        chunk( parseNums(sections[0]), 2 ).map( chunk => new Range(chunk[0], chunk[1]) ) :
        parseNums( sections[0] ).map( num => new Range(num, 1) );
    sections.slice( 1 ).forEach( section => {
        // parse the mappings, and sort them by incrementing source start value
        const mappings = section.split( '\n' ).slice( 1 ).map( mapLine => {
            const matches = parseNums( mapLine );
            return { destination: new Range(matches[0], matches[2]), source: new Range(matches[1], matches[2]) };
        }).sort( (mapA, mapB) => mapA.source.start - mapB.source.start );
        // create a new array of ranges, which represent mapped values
        const mappedRanges: Range[] = [];
        while ( ranges.length > 0 ) {
            // see if the start of this range is included in a mapping. Use the first of such overlapping mappings.
            const matchingMap = mappings.find( mapping => mapping.source.includes(ranges[0].start) );
            let sourceOverlapEnd: number;
            if ( matchingMap != null ) {
                // for the overlapping parts of `ranges[0]` and mapping.source, add the mapped values to `mappedRanges`
                sourceOverlapEnd = Math.min( ranges[0].end, matchingMap.source.end );
                const mapValue = ( num: number ) => num + matchingMap.destination.start - matchingMap.source.start;
                mappedRanges.push( new Range( mapValue(ranges[0].start), mapValue(sourceOverlapEnd), true) );
            } else {
                // `ranges[0]` starts within a region that has no mapping.
                // Find if there is any destination range whose start is within ranges[0], and add unmappable values to `mappedRanges`
                const overlapMap = mappings.find( mapping => ranges[0].includes(mapping.source.start) );
                sourceOverlapEnd = Math.min( ranges[0].end, overlapMap?.source.start ?? ranges[0].end );
                mappedRanges.push( new Range(ranges[0].start, sourceOverlapEnd, true) );
            }
            
            // reduce the original range by the amount of overlap we found, or remove the original range if it would be empty
            sourceOverlapEnd === ranges[0].end ? ranges.shift() : ranges[0].start = sourceOverlapEnd;
        }
        // we've completely mapped all source ranges. Save the new ranges as source ranges for the next section of mappings
        ranges = mappedRanges;
    });

    // return the lowest start of all ranges
    return Math.min( ...ranges.map(r => r.start) );
}


outputAnswers(
    testInput,
    officialInput,
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => parseInput( input ),
    // function that solves part 2
    ( input: string ) => parseInput( input, true )
);
