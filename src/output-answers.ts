/** Outputs answers to the console */
export function outputAnswers(
    part1Solver: (input: string) => any,
    part2Solver: (input: string) => any,
    part1TestInput?: string,
    part1OfficialInput?: string,
    part2TestInput?: string,
    part2OfficialInput?: string
) {
    const runs: [ string, () => any ][] = [
        [
            `Part 1 (example input)`,
            () => part1TestInput ? part1Solver( part1TestInput ) : null
        ], [
            `Part 1 (full input)`,
            () => part1OfficialInput ? part1Solver( part1OfficialInput ) : null
        ], [
            `Part 2 (example input)`,
            () => part2TestInput ? part2Solver( part2TestInput ) : null
        ], [
            `Part 2 (full input)`,
            () => part2OfficialInput ? part2Solver( part2OfficialInput ) : null
        ]
    ];

    runs.forEach( run => {
        const start = performance.now();
        const solution = run[1]();
        let ms = performance.now() - start;
        ms = Math.round( ms * 100 ) / 100;
        const displayedTime = ms > 9999 ? ( ms / 1000 ).toString() + ' s' : ms.toString() + ' ms'
        console.log( `${run[0]} - runtime: ${displayedTime} - solution:`, solution );
    });
}
