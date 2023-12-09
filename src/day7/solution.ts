import { sortBy, sum, uniq } from 'lodash';
import { outputAnswers } from '../output-answers';
import { fullInput, exampleInput } from './inputs';

/**
 * This solution assigns a numeric score to each poker hand. The type of the hand (i.e. full house, two-pair) is represented by a
 * number > 0, and the card values are represented by a number < 0, with the value of the first card being the most important (as per
 * the given tie-breaking instructions). When these two numbers are added together, you get a number that can be used to sort hands by
 * strength.
 * 
 * The hand type is scored by finding the size of sets, with a "set" being the number of cards in the hand that have the same face value.
 * Each hand type has a unique signature of what its two largest sets are. If you make a two digit number from the size of the
 * largest set and the size of the second largest set, you get a value such that more powerful hand types result in a higher number.
 * For example, 4-of-a-kind has set sizes of 4 and 1. This makes a value of 41. One-pair has set sizes of 2, 1, 1, and 1. This makes 21
 * (since we only take the two largest sets). We have to append a set size of 0 for five-of-a-kind to work (and give the value 50).
 * 
 * When types of two hands are equal, we compare card values by converting each card into a two-digit number (with leading 0 if needed),
 * and all these 2-digit numbers are appended to make a fraction < 0. I.e., the hand "789TJ" results in `0.0708091011`
 * 
 * Combining the two gives a score for each hand with a number like `aa.bbbbbbbbbb`.
 */


function solve( input: string, scoreFn: (hand: string) => number ) {
    // calculate a score for each hand and sort by the score, and keep track of each hand's bid
    const list = sortBy(
        input.split( '\n' ).map( line => {
            const split = line.split( ' ' );
            return {
                score: scoreFn( split[0] ),
                bid: parseInt( split[1] ),
            };
        }),
        'score'
    );
    return sum( list.map( (item, i) => (i + 1) * item.bid ) );
}

/**
 * @param hand a five-character string representing a hand of cards
 * @returns an integer > 0 representing a hand type (5-of-a-kind, full house, etc) where a higher number represents a more powerful hand
 */
function getHandTypeValue( hand: string ) {
    return parseInt( getBiggestTwoSets(hand).join('') );
}

function getHandTypeValueWithWild( hand: string ) {
    const handWithoutJs = hand.replaceAll( 'J', '' );
    const sets = getBiggestTwoSets( handWithoutJs );
    // add the wildcards to the biggest set.
    sets[0] += hand.length - handWithoutJs.length;
    // Pad with a 0 to ensure the result is a two-digit number (in the case of all J's)
    return parseInt( sets.join('').padEnd(2, '0') );
}

/**
 * @param hand a five-character string representing a hand of cards
 * @param cardLabels a string consisting of card labels in order of increasing strength
 * @returns a fraction < 0 suitable for comparing the value of two hands that have the same type. Higher numbers represent stronger hands.
 */
function getCardValue( hand: string, cardLabels: string ) {
    return parseFloat(
        '0.' + hand.split( '' ).map(
            char => cardLabels.indexOf( char ).toString().padStart( 2, '0' )
        ).join( '' )
    );
}

/** returns an array of two numbers (sorted descending), representing the sizes of the largest two sets in the given hand */
function getBiggestTwoSets( hand: string ): number[] {
    const numCopiesInHand = ( label: string ) => [ ...hand.matchAll(new RegExp(label, 'g')) ].length;
    return uniq( hand.split('') ).map( numCopiesInHand ).sort().reverse().concat( 0 ).slice( 0, 2 );
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => solve( input, hand => getHandTypeValue(hand) + getCardValue(hand, '23456789TJQKA') ),
    // function that solves part 2
    ( input: string ) => solve( input, hand => getHandTypeValueWithWild(hand) + getCardValue(hand, 'J23456789TQKA') ),

    exampleInput,
    fullInput,
    exampleInput,
    fullInput
);
