export class Range {

    /**
     * returns the Range where all given ranges intersect. The returned range will have its start and end set to `NaN`
     * if there is no overlap, which can be easily checked via `isInvalid`.
     * Keep in mind that a Range represents all values where start <= value < end.
     */
    static intersection( ...ranges: Range[] ) {
        if ( ranges.length === 0 ) {
            return Range.makeInvalidRange();
        }
        return ranges[0].intersection( ...ranges.slice(1) );
    }

    /**
     * returns an array of Ranges representing a union of all given ranges.
     * Simplifies intersecting ranges into a smaller number of ranges.
     */
    static union( ...ranges: Range[] ) {
        if ( ranges.length === 0 ) {
            return [];
        }
        return ranges[0].union( ...ranges.slice(1) );
    }

    /** creates a Range from a string containing two numbers separated by a comma, like `4,9` */
    static fromString( str: string ) {
        const nums = str.split( ',' ).map( v => parseInt(v) );
        return new Range( nums[0], nums[1] );
    }

    static makeInvalidRange() {
        return new Range( NaN, NaN );
    }

    /** creates a new range of values, encompassing `start` <= values < `end` */
    constructor( public start: number, public end: number ) {
        if ( start > end ) {
            throw new Error( 'start must be less than or equal to end' );
        }
    }

    /** makes a copy of the Range object and returns it */
    copy() {
        return new Range( this.start, this.end );
    }

    /** shifts the start and end by a given number, modifying the range and returning it */
    translate( num: number ) {
        this.start += num;
        this.end += num;
        return this;
    }

    /** shifts the start and end by a given number, returning a new range */
    translatedBy( num: number ) {
        return this.copy().translate( num );
    }

    /**
     * expands the range to a given ratio, with the midpoint staying the same, modifying the range and returning it.
     * A ratio > 1 will grow the range, and a ratio < 1 will shrink it.
     */
    expand( ratio: number ) {
        if ( ratio < 0 ) {
            throw new Error( 'ratio must be > 0' );
        }
        const amount = ( ratio * this.length() - this.length() ) / 2;
        this.end += amount;
        this.start -= amount;
        return this;
    }

    /**
     * expands the range by a given ratio, with the midpoint staying the same, returning a new range.
     * A ratio > 1 will grow the range, and a ratio < 1 will shrink it.
     */
    expandedBy( ratio: number ) {
        return this.copy().expand( ratio );
    }

    /** returns whether two Range objects have the same start and end */
    eq( range: Range ) {
        return (
            ( this.start === range.start || isNaN(this.start) && isNaN(range.start) ) &&
            ( this.end === range.end || isNaN(this.end) && isNaN(range.end) )
        );
    }

    /** returns the length of the numeric range, i.e. `this.end - this.start`. Returns 0 if either `start` or `end` is `NaN` */
    length() {
        return this.isInvalid() ? 0 : this.end - this.start;
    }

    toString() {
        return `${this.start.toString()},${this.end.toString()}`;
    }

    /** returns an array of `[ this.start, this.end ]` */
    valueOf() {
        return [ this.start, this.end ];
    }

    /** returns whether start or end is NaN */
    isInvalid() {
        return isNaN( this.start ) || isNaN( this.end );
    }

    /** returns the single value that lies in the middle of this range */
    midpoint() {
        return this.start + ( this.end - this.start ) / 2;
    }

    /**
     * splits the current range at a given number and returns two ranges, i.e. ( start, num ) and ( num, end ).
     * If the given number is outside the range, one of the two returned ranges will be ( NaN, NaN )
     */
    splitAt( num: number ) {
        if ( this.isInvalid() ) {
            return [ Range.makeInvalidRange(), Range.makeInvalidRange() ]
        } else if ( num < this.start ) {
            return [ Range.makeInvalidRange(), this.copy() ];
        } else if ( num >= this.end ) {
            return [ this.copy(), Range.makeInvalidRange() ];
        } else {
            return [ new Range(this.start, num), new Range(num, this.end) ];
        }
    }

    /** returns whether the range contains a given value */
    includesValue( num: number ) {
        return this.start <= num && this.end > num;
    }

    /** returns whether the range entirely contains a given range */
    includesRange( range: Range ) {
        return this.start <= range.start && this.end >= range.end;
    }

    /** returns whether this range has any intersection with another range */
    intersectsWith( range: Range ) {
        return this.start < range.end && range.start < this.end;
    }

    /**
     * returns a new Range to equal this range's intersection with other ranges. The returned range will have its start and end set to `NaN`
     * if there is no overlap, which can be easily checked via `isInvalid`.
     * Keep in mind that a Range represents all values where start <= value < end.
     * @example
     * `new Range( 0, 4 ).intersection( new Range(2, 6), new Range(-1, 9) ).toString()` -> `2,4`
     * `new Range( 0, 4 ).intersection( new Range(4, 6) ).toString()` -> `NaN,NaN` // a range of `new Range(4,4)` doesn't encompass any values
     */
    intersection( ...ranges: Range[] ) {
        if ( ranges.length === 0 ) {
            return this.copy();
        }
        const reduced = ranges.reduce( (r1, r2) => {
            if ( r1.intersectsWith(r2) ) {
                return new Range( Math.max(r1.start, r2.start), Math.min(r1.end, r2.end) );
            } else {
                return Range.makeInvalidRange();
            }
        }, this );
        return reduced.start >= reduced.end ? Range.makeInvalidRange() : reduced;
    }

    /** returns an array of Ranges representing values from this range that aren't contained in the given ranges */
    difference( ...ranges: Range[] ) {
        let keepRanges: Range[] = [ this.copy() ];
        ranges.forEach( r1 => {
            const newKeepRanges: Range[] = [];
            keepRanges.forEach( r2 => {
                if ( r2.isInvalid() || r1.includesRange(r2) ) {
                    // the range we want to keep is either invalid or is entirely contained by the range we're omitting
                    return;
                } else if ( !r2.intersectsWith(r1) || r1.isInvalid() ) {
                    // no overlap, so we don't remove any of r2
                    newKeepRanges.push( r2 );
                } else if ( r1.includesValue(r2.start) ) {
                    newKeepRanges.push( new Range(r1.end, r2.end) );
                } else if ( r1.includesValue(r2.end) ) {
                    newKeepRanges.push( new Range(r2.start, r1.start) );
                } else if ( r2.includesRange(r1) ) {
                    newKeepRanges.push(
                        new Range( r2.start, r1.start ),
                        new Range( r1.end, r2.end )
                    );
                } else {
                    throw new Error( 'unexpected case when determining range differences' );
                }
            });
            keepRanges = newKeepRanges.filter( r => r.length() > 0 );
        });
        return keepRanges;
    }

    /**
     * returns an array of Ranges representing a union of this range will all given ranges.
     * Simplifies intersecting ranges into a smaller number of ranges.
     */
    union( ...ranges: Range[] ) {
        if ( ranges.length === 0 ) {
            return [ this.copy() ];
        }
        ranges = ranges.map( r => r.copy() );
        // sort all by range.start
        ranges = ranges.slice().concat( this.copy() ).sort( (a,b) => a.start - b.start );
        let mergedRanges: Range[] = ranges.splice( 0, 1 );
        ranges.forEach( newRange => {
            const lastRange = mergedRanges[mergedRanges.length - 1];
            if ( newRange.start <= lastRange.end ) {
                lastRange.end = Math.max( lastRange.end, newRange.end );
            } else {
                mergedRanges.push( newRange );
            }
        });
        return mergedRanges;
    }

}
