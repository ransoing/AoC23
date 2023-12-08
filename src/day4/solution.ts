import { intersection, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/** maps each line of input to an object representing that scratchcard */
function parseCards( input: string ) {
    return input.split( '\n' ).map( line => {
        return {
            copies: 1,
            // count how many winning numbers there are on the scratchcard
            wins: intersection(
                ...line.split( ':' )[1].split( '|' ).map( half => {
                    // parse all multi-digit numbers from the string and convert them to integers
                    return [ ...half.matchAll(/\d+/g) ].map( match => parseInt(match[0]) )
                })
            ).length
        };
    });
}

outputAnswers(
    // function that solves part 1
    ( input: string ) => sum(
        // for 0 winning numbers, we get 2^-1 which is 0.5. Flooring this results in a correct score of 0. For all other counts of
        // winning numbers, Math.floor changes nothing.
        parseCards( input ).map( card => Math.floor( 2 ** (card.wins - 1) ) )
    ),

    // function that solves part 2
    ( input: string ) => {
        // run through the array of cards, adding copies of cards further down the line according to how many winning numbers a card has
        // and the number of copies we have of the card, and totaling the number of scratchcards
        return parseCards( input ).reduce( (total, card, i, cards) => {
            cards.slice( i + 1, i + 1 + card.wins ).forEach( laterCard => laterCard.copies += card.copies );
            return total + card.copies;
        }, 0 );
    },

    testInput,
    officialInput,
    testInput,
    officialInput
);
