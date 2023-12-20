/** returns the count of differences between two strings, comparing pairs of letters at identical indexes */
export function countDiffs( a: string, b: string ) {
    let diffs = 0;
    const length = Math.max( a.length, b.length );
    for ( let i = 0; i < length; i++ ) {
        if ( a[i] !== b[i] ) {
            diffs++;
        }
    }
    return diffs;
}
