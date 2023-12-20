import { range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { readTextFile } from '../util/parse';
import { XYZ } from '../util/xyz';
import { parseAsYxGrid } from '../util/grid';

function solve( input: string, minMovement: number, maxMovement: number ) {
    const grid = parseAsYxGrid( input ).map( r => r.map(v => parseInt(v)) );
    const start = new XYZ([0, 0]);
    const quickest = start.quickestPath({
        target: new XYZ([ grid[0].length - 1, grid.length - 1 ]),
        getNeighbors: (p, past) => {
            // find every point that we're allowed to travel in a straight line up to the straight-movement limit
            const nextPoints: XYZ[] = [];
            // record the last direction of movement we encountered. We can't move in the same direction or in the opposite direction,
            // which would be reversing direction.
            const newPast = past.length < 2 ? [ {point: start}, ...past ] : past;
            const lastDirection = newPast.length >= 2 ? ( newPast[newPast.length - 1].point.minus(newPast[newPast.length - 2].point) ).toSign() : null;
            const lastDirectionOpposite = lastDirection?.times( -1 );
            XYZ.orthogonalDirections2D.map( direction => new XYZ(direction) ).filter( direction => {
                return lastDirection == null || ( !lastDirection.eq(direction) && !lastDirectionOpposite.eq(direction) );
            }).forEach( direction => {
                range( minMovement, maxMovement + 1 ).forEach( distance => {
                    nextPoints.push( p.plus( direction.times(distance) ) );
                });
            });
            return nextPoints;
        },
        canVisitNeighbor: n => n.valueIn( grid ) != null,
        getStateKey: (p, past) => {
            // get the last direction moved
            const newPast = past.length < 2 ? [ {point: start}, ...past ] : past;
            const lastDirection = newPast.length >= 2 ? ( newPast[newPast.length - 1].point.minus(newPast[newPast.length - 2].point) ).toSign() : null;
            return p.toString() + ( lastDirection?.toString() ?? '' );
        },
        getPointWeight: (p, from) => {
            // return the sum of weights to get from the previous point to the next one
            from = from ?? start;
            const direction = p.minus( from ).toSign();
            const testPoint = from.copy();
            let sum = 0;
            do {
                testPoint.add( direction );
                sum += testPoint.valueIn( grid );
            } while ( !testPoint.eq(p) );
            return sum;
        },
        averageWeight: 2
    });
    return quickest.totalWeight;
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input, 1, 3 ),
    // function that solves part 2
    ( input: string ) => solve( input, 4, 10 ),

    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` ),
    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` )
);
