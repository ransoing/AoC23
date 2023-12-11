import { identity, unzip } from 'lodash';

/** parses a text input as a grid, with elements accessible at grid[y][x] */
export function parseAsYxGrid( input: string ) {
    return input.split( '\n' ).map( line => line.split('') );
}

/**
 * for a 2D grid, flips the order of indexes so the element at grid[x][y] is now accessible via grid[y][x].
 * Useful for iterating over columns if working with a YxGrid
 */
export function flipRowsCols<T>( grid: T[][] ) {
    return unzip( grid );
}
