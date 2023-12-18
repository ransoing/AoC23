import { outputAnswers } from '../output-answers';
import { readTextFile } from '../util/misc';
import { XYZ } from '../util/xyz';
const areaOfPolygon = require( 'area-polygon' );

interface IParsed {
    dir: [number, number];
    length: number;
}

const dirs = {
    U: [ 0, -1 ],
    D: [ 0, 1 ],
    L: [ -1, 0 ],
    R: [ 1, 0 ]
};

function parse1( input: string ) {
    return input.split( '\n' ).map( line => {
        const matches = line.match( /(\w) (\d+) \(#(\w+)/ );
        return {
            dir: dirs[matches[1]],
            length: parseInt( matches[2] )
        };
    });
}

function parse2( input: string ) {
    return input.split( '\n' ).map( line => {
        const matches = line.match( /#(.{5})(.)/ );
        return {
            dir: dirs[ 'RDLU'.charAt(parseInt(matches[2])) ],
            length: parseInt( matches[1], 16 )
        };
    });
}

function solve( lines: IParsed[] ) {
    const poly: XYZ[] = [];
    let point = new XYZ([0,0]);
    let perimeter = 0;
    poly.push( point );
    
    lines.forEach( line => {
        const nextPoint = point.plus( new XYZ(line.dir).times(line.length) );
        perimeter += point.distanceTo( nextPoint );
        poly.push( nextPoint );
        point = nextPoint;
    });

    // We need the area of the polygon, as well as the total area of the unit squares that the perimeter passes through.
    // After accounting for the area inside the polygon, straight edges give us an extra 1/2 unit of area of every unit of length.
    // Outside corners give us an extra 3/4 unit of area for every unit of length.
    // Inside corners give us an extra 1/4 unit of area for every unit of length.
    // For a polygon with all right angles, there is an outside corner for every inside corner, plus 4 more outside corners.
    // With every inside corner being paired with an outside corner, each pair gives us an extra 1 unit of area - in other words,
    // for each pair, each item in the pair gives an extra 1/2 unit of area, which is the same as straight edges, so all straight edges
    // and all corners (except for 4 ourside corners) give us an area of (length / 2).
    // The 4 extra outside corners give us (3/4)*4 extra area, or simplified, just 3.
    // Simplifying `( perimeter - 4 ) / 2 + 3` gives us `perimeter/2 - 4/2 + 3`, or `perimeter/2 + 1`
    return areaOfPolygon( poly ) + perimeter / 2 + 1;
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( parse1(input) ),
    // function that solves part 2
    ( input: string ) => solve( parse2(input) ),

    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` ),
    readTextFile( `${__dirname}/example-input` ),
    readTextFile( `${__dirname}/full-input` )
);
