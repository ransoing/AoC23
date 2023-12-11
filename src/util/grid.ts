import { identity, unzip } from "lodash";

/** parses a text input as a grid, with elements accessible at grid[y][x] */
export function parseAsYxGrid<T>( input: string, mutateElement: (el: string) => T = identity ): T[][] {
    return input.split( '\n' ).map( line => line.split('').map(mutateElement) );
}

/**
 * for a 2D grid, flips the order of indexes so the element at grid[x][y] is now accessible via grid[y][x].
 * Useful for iterating over columns if working with a YxGrid
 */
export function flipRowsCols<T>( grid: T[][] ) {
    return unzip( grid );
}
