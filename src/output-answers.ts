/** Outputs answers to the console */
export function outputAnswers(
    testInput: string,
    officialInput: string,
    part1Solver: (input: string) => any,
    part2Solver: (input: string) => any
) {
    console.log( `Answer for part 1 (test input):`, part1Solver(testInput) );
    console.log( `Answer for part 1:`, part1Solver(officialInput) );
    console.log( `Answer for part 2 (test input):`, part2Solver(testInput) );
    console.log( `Answer for part 2:`, part2Solver(officialInput) );
}
