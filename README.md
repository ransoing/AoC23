# AoC23

## [Advent of Code 2021](https://adventofcode.com/2023) solutions in typescript

I'm aiming for solutions that have few lines of code while being reasonably readable.

Set up by installing [nodejs](https://nodejs.org/en/) and running `npm i` in the repo's directory.

Run with `npm run solve [day number]`, i.e. `npm run solve 1` for day 1's puzzle.

If the `solve` script doesn't work, use `npm run solveAlt -- src/day1/solution.ts`, or substitute the number for any number from 1-25.

## General tips

To work with 2D or 3D grids, use the `XYZ` utility in this repo.

To find the shortest route from among many complicated possibilities, use a breadth-first-search (BFS), available in the `XYZ` utility. To make a fast and successful BFS, find a way to represent the state of the current position of an incomplete route in the simplest terms possible - for any given state, the fastest path from that state should always be the same.

To find the total number of possibilities of something, use a recursive function that explores the immediately children of the possibility tree. If the computation involves ranges of numbers, see if you can run your computations on ranges of numbers (using the `Range` class) instead of recursively running computations on a single number at a time.

When making a recursive function, always start it with returning a value if the current state is a leaf (on the metaphorical tree).

To speed up recursive functions, use lodash's `memoize`, and simplify the input parameters to the recursive function as much as you can so that there will be fewer unique combinations of the input parameters. Also do some pruning - if there are easy-to-find places where you don't need to execute a whole branch of the recursive tree, don't call the recursive function in those cases.

Keep in mind while solving a challenge that some complicated problems have easy mathematical tricks, rather than requiring brute-force computation. Try to think of the problem in general terms and search for a library that solves the general problem.

Don't be afraid to use existing libraries to do the heavy lifting.

## Helpful links

[Lodash](https://lodash.com/docs/)
