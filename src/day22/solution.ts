import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { parseIntegers, readTextFile } from '../util/parse';
import { Range } from '../util/range';
import { Range3D } from '../util/range3d';

// I didn't bother cleaning this one up. Sorry for the messy code and slow-solving algorithm

function solve( input: string, part2 = false ) {
    let bricks = input.split( '\n' ).map( line => {
        const nums = parseIntegers( line );
        return new Range3D(
            new Range( nums[0], nums[3] + 1 ),
            new Range( nums[1], nums[4] + 1 ),
            new Range( nums[2], nums[5] + 1 )
        );
    });

    // settle the bricks
    bricks = bricks.sort( (a, b) => a.z.start - b.z.start );
    let settledBricks: Range3D[] = [];
    let maxZ = 0;
    bricks.forEach( brick => {
        // start the brick at maxZ and drop it until it would collide with another brick
        const height = brick.z.length();
        brick.z.start = maxZ;
        brick.z.end = brick.z.start + height;
        while ( brick.z.start > 0 ) {
            brick.z.start--;
            brick.z.end--;
            if ( settledBricks.some(b => b.intersectsWith(brick)) ) {
                // oops, move back up
                brick.z.start++;
                brick.z.end++;
                break;
            }
        }
        settledBricks.push( brick );
        maxZ = Math.max( maxZ, brick.z.start, brick.z.end );
    });

    // loop through all bricks and find which have only one as a support underneath - these cannot be safely removed,
    // but all others can
    const supports = new Set<Range3D>();
    // this keeps track of <supporting-brick,which-bricks-would-fall>
    const supportMap = new Map<Range3D,Range3D[]>();
    settledBricks.forEach( b => {
        const below = b.copy();
        below.z.start--;
        below.z.end--;
        // find intersecting bricks
        const intersects = settledBricks.filter( b2 => {
            return b2 !== b && b2.intersectsWith(below);
        });
        if ( intersects.length === 1 ) {
            supports.add( intersects[0] );
            let ar = supportMap.get( intersects[0] );
            if ( ar == null ) {
                ar = [];
            }
            ar.push( b );
            supportMap.set( intersects[0], ar );
        }
    });
    
    if ( !part2 ) {
        return settledBricks.length - supports.size;
    }


    const chainLengths = Array.from( supportMap.entries() ).map( (entry, i, all) => {
        // find out how far this chain reaction goes
        let fallenBricks = 0;
        let bricksCopy = settledBricks.filter( b => b !== entry[0] );
        let canMove: Range3D[];
        // this is very inefficient but finishes in a couple minutes
        do {
            canMove = bricksCopy.filter( b => {
                const below = b.copy();
                below.z.start--;
                below.z.end--;
                const isBlocked = b.z.start === 0 || bricksCopy.some( b2 => b2 !== b && below.intersectsWith(b2) );
                return !isBlocked;
            });
            fallenBricks += canMove.length;
            // remove the ones that can move from our array
            bricksCopy = bricksCopy.filter( b2 => !canMove.includes(b2) );
        } while ( canMove.length > 0 );

        return fallenBricks;
    });

    return sum( chainLengths );

}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input ),
    // function that solves part 2
    ( input: string ) => solve( input, true ),

    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` ),
    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` )
);
