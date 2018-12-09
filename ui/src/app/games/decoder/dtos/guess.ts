import { IGuess } from './iguess';

export class Guess implements IGuess {
    srcIndexes: number[];
    redCount: number;
    whiteCount: number;


    constructor(solutionLength: number) {
        this.srcIndexes = [];

        for (let i = 0; i < solutionLength; i++) {
            this.srcIndexes.push(null);
        }
        this.redCount = 0;
        this.whiteCount = 0;
    }

    clone(solutionLength: number): Guess {
        const copy = new Guess(solutionLength);
        for (let i = 0; i < solutionLength; i++) {
            copy.srcIndexes[i] = this.srcIndexes[i];
        }
        copy.redCount = this.redCount;
        copy.whiteCount = this.whiteCount;
        return copy;
    }
}
