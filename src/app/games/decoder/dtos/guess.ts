import { IGuess } from './iguess';

export class Guess implements IGuess {
    srcIndexes: number[];
    redCount: string;
    whiteCount: string;


    constructor(solutionLength: number) {
        this.srcIndexes = [];

        for (let i = 0; i < solutionLength; i++) {
            this.srcIndexes.push(null);
        }
        this.redCount = '';
        this.whiteCount = '';
    }

    clone(solutionLength: number): Guess {
        const copy = new Guess(solutionLength);
        for (let i = 0; i < solutionLength; i++) {
            this.srcIndexes.push(this.srcIndexes[i]);
        }
        this.redCount = this.redCount;
        this.whiteCount = this.whiteCount;
        return copy;
    }
}
