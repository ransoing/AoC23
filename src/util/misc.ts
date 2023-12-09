/** returns an array of multi-digit numbers found in a string, parsed as integers */
export function parseIntegers( str: string ): number[] {
    return [ ...str.matchAll( /\d+/g ) ].map( match => parseInt(match[0]) );
}

/** returns the product of all numbers in the array */
export function product( nums: number[] ): number {
    return nums.reduce( (total, num) => total * num, 1 );
}
