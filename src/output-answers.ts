/** Outputs answers to the console */
export function outputAnswers(
    part1TestInput: string,
    part1OfficialInput: string,
    part2TestInput: string,
    part2OfficialInput: string,
    part1Solver: (input: string) => any,
    part2Solver: (input: string) => any
) {
    console.log( `Answer for part 1 (test input):`, part1Solver(part1TestInput) );
    console.log( `Answer for part 1:`, part1Solver(part1OfficialInput) );
    console.log( `Answer for part 2 (test input):`, part2Solver(part2TestInput) );
    console.log( `Answer for part 2:`, part2Solver(part2OfficialInput) );
}
