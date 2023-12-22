import { sortedUniq } from 'lodash';
import { Range } from './range';

export class Range2D {

    /**
     * returns an array of Range2Ds representing a union of all given ranges.
     * Simplifies intersecting ranges into a smaller number of ranges.
     */
    static union( ranges: Range2D[] ) {
        if ( ranges.length === 0 ) {
            return [];
        }
        
        // reduce the array by eliminating ranges that are entirely contained within other ranges
        // i.e. only include the ranges which are not contained in any other range
        ranges = ranges.filter( (r1, i) => {
            return !ranges.some( (r2, j) => i !== j && r2.includesRange2D(r1) );
        });

        if ( ranges.length === 1 ) {
            return [ ranges[0].copy() ];
        }

        // slice all ranges by all other ranges. This divides them into easily comparable chunks
        let slices: Range2D[] = [];
        ranges.forEach( (r1, i) => {
            // console.log( '@1', i );
            slices = slices.concat(
                r1._sliceByMultipleRange2Ds( ranges.filter(r => r !== r1) )
            );
        });
        // console.log( '@2' );
        // remove duplicates and return the result
        return Range2D.uniq( slices );

        //@@ attempt to consolidate adjacent ranges into fewer ranges
        // return Range2D._simplifyUniqueSlices( slices );
    }

    /**
     * returns the Range2D where all given ranges intersect. The returned range will be invalid
     * if there is no overlap, which can be easily checked via `isInvalid`.
     * Keep in mind that a Range represents all values where start <= value < end.
     */
    static intersection( ranges: Range2D[] ) {
        if ( ranges.length === 0 ) {
            return Range2D.makeInvalidRange();
        } else if ( ranges.length === 1 ) {
            return ranges[0].copy();
        }
        try {
            return new Range2D(
                new Range(
                    Math.max( ...ranges.map(r => r.x.start) ),
                    Math.min( ...ranges.map(r => r.x.end) )
                ),
                new Range(
                    Math.max( ...ranges.map(r => r.y.start) ),
                    Math.min( ...ranges.map(r => r.y.end) )
                )
            );
        } catch( e ) {
            return Range2D.makeInvalidRange();
        }
    }

    /** creates a Range2D from a string formatted like `x1,x2:y1,y2`, i.e. `4,9:-1,5` */
    static fromString( str: string ) {
        const numArray = str.split( ':' ).map(
            coords => coords.split( ',' ).map(
                num => parseInt( num )
            )
        );
        return new Range2D(
            new Range( numArray[0][0], numArray[0][1] ),
            new Range( numArray[1][0], numArray[1][1] )
        );
    }

    /** returns an array of ranges with duplicates removed from the input array */
    static uniq( ranges: Range2D[] ) {
        // convert to strings and add to a Set for super speed, then convert from strings back to Range2Ds
        return Array.from(
            new Set( ranges.map(c => c.toString()) )
        ).map(
            rangeString => Range2D.fromString( rangeString )
        )
    }

    static makeInvalidRange() {
        return new Range2D( Range.makeInvalidRange(), Range.makeInvalidRange() );
    }

    /**
     * given an array of range2Ds which have no intersection, simplifies the array by merging range2Ds which share a common border.
     * Returns a new array of range2Ds
     */
    private static _simplifyUniqueSlices( uniqueSlices: Range2D[] ) {
        uniqueSlices = uniqueSlices.slice();
        let mergedTwo = false;
        do {
            mergedTwo = false;
            for ( let i = 0; i < uniqueSlices.length - 1; i++ ) {
                for ( let j = i + 1; j < uniqueSlices.length; j++ ) {
                    const [ a, b ] = [ uniqueSlices[i], uniqueSlices[j] ];
                    // if the two range2Ds have the same x range and adjacent y ranges, combine them into one range2D, removing one element
                    // from the array of slices
                    if (
                        a.x.eq( b.x ) &&
                        ( a.y.end === b.y.start || a.y.start === b.y.end )
                    ) {
                        a.y = new Range( Math.min(a.y.start, b.y.start), Math.max(a.y.end, b.y.end) );
                        uniqueSlices.splice( j, 1 );
                        mergedTwo = true;
                    } else if (
                        // do the same thing but check if they share the same y range and have adjacent x ranges
                        a.y.eq( b.y ) &&
                        ( a.x.end === b.x.start || a.x.start === b.x.end )
                    ) {
                        a.x = new Range( Math.min(a.x.start, b.x.start), Math.max(a.x.end, b.x.end) );
                        uniqueSlices.splice( j, 1 );
                        mergedTwo = true;
                    }
                }
                if ( mergedTwo ) {
                    break;
                }
            }
        } while ( mergedTwo );

        return uniqueSlices;
    }

    constructor(
        public x: Range,
        public y: Range
    ) {}

    /** makes a copy of the Range2D object and returns it */
    copy() {
        return new Range2D( this.x.copy(), this.y.copy() );
    }

    /** returns whether two Range2D objects have the same x and y ranges */
    eq( range: Range2D ) {
        return this.x.eq( range.x ) && this.y.eq( range.y );
    }

    /** returns the total area encompassed by this Range2D */
    area() {
        return this.x.length() * this.y.length();
    }

    toString() {
        return `${this.x.toString()}:${this.y.toString()}`;
    }

    isInvalid() {
        return this.x.isInvalid() || this.y.isInvalid();
    }

    /** returns whether this Range2D has any overlap with another Range2D */
    intersectsWith( range: Range2D ) {
        return this.x.intersectsWith( range.x ) && this.y.intersectsWith( range.y );
    }

    /** returns whether this entirely contains a given Range2D */
    includesRange2D( range: Range2D ) {
        return this.x.includesRange( range.x ) && this.y.includesRange( range.y );
    }

    /**
     * splits the current Range2D at a given x value and returns two Range2Ds.
     * If the given number is outside the range, one of the two returned ranges will be invalid.
     */
    splitAtX( num: number ) {
        if ( this.isInvalid() ) {
            return [ Range2D.makeInvalidRange(), Range2D.makeInvalidRange() ];
        } else {
            return this.x.splitAt( num ).map(
                r => new Range2D( r, this.y.copy() )
            );
        }
    }

    /**
     * splits the current Range2D at a given y value and returns two Range2Ds.
     * If the given number is outside the range, one of the two returned ranges will be invalid.
     */
    splitAtY( num: number ) {
        if ( this.isInvalid() ) {
            return [ Range2D.makeInvalidRange(), Range2D.makeInvalidRange() ];
        } else {
            return this.y.splitAt( num ).map(
                r => new Range2D( this.x.copy(), r )
            );
        }
    }

    /** returns an array of Range2Ds representing areas from this range that aren't contained in the given ranges */
    difference( ranges: Range2D[] ) {
        // only get the ranges that intersect with this one
        ranges = ranges.filter( r => this.intersectsWith(r) );
        if ( ranges.length === 0 ) {
            return this.copy();
        }
        // if this range is entirely included in another, return an empty array
        if ( ranges.some( r => r.includesRange2D(this) ) ) {
            return [];
        }

        // slice the first range by all others - we can get away with only slicing the first one because we are finding the parts of this
        // range that are not contained by other ranges
        const slices: Range2D[] = this._sliceByMultipleRange2Ds( ranges );
        // keep only the slices that are not included in any other ranges
        const differingSlices = slices.filter(
            slice => ranges.every( range => !range.includesRange2D(slice) )
        );
        // reduce the remaining slices to as few ranges as possible
        return Range2D._simplifyUniqueSlices( differingSlices );
    }

    /**
     * splits up the current range2D into smaller ones, slicing it by the x and y values found in all the given range2Ds.
     * Does not return empty or invalid ranges.
     */
    private _sliceByMultipleRange2Ds( ranges: Range2D[] ) {
        // get all x and y values contained in this range, and sort them
        const allXs = sortedUniq(
            [ this.x.start, this.x.end ].concat(
                ranges.map( r => [r.x.start, r.x.end] ).flat().filter( x => this.x.includesValue(x) )
            ).sort( (a,b) => a - b )
        );
        const allYs = sortedUniq(
            [ this.y.start, this.y.end ].concat(
                ranges.map( r => [r.y.start, r.y.end] ).flat().filter( y => this.y.includesValue(y) )
            ).sort( (a,b) => a - b )
        );

        // return a unique set of range2Ds split up by the defined x and y values. All range2Ds together make up the entirety of this range
        const slices: Range2D[] = [];
        for ( let i = 0; i < allXs.length - 1; i++ ) {
            for ( let j = 0; j < allYs.length - 1; j++ ) {
                slices.push(
                    new Range2D(
                        new Range( allXs[i], allXs[i+1] ),
                        new Range( allYs[j], allYs[j+1] )
                    )
                );
            }
        }

        return slices;
    }
}
