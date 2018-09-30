import { Component, OnInit, HostListener } from '@angular/core';
import { IconsSets } from './iconsets';
import { Utils } from '../../Utils/utils';
import { Piece, Guess, GameStatus, IGuess, IconSet } from './dtos';


@Component({
  selector: 'app-decoder',
  templateUrl: './decoder.component.html',
  styleUrls: ['./decoder.component.css']
})
export class DecoderComponent {
  public target: Piece[] = [];
  public src: Piece[] = [];

  public greenTick = 'greentick.png';
  public amberTick = 'ambertick.png';
  public blankImage = 'whitespot.png';

  public guess: Guess;
  public prevGuesses: IGuess[] = [];
  public solution: string[];
  public solutionLength = 4;
  public thetarget: string;
  public gameStatus: GameStatus;
  public maxGuesses = 10;
  public sourceLength = 8;
  public iconSets: IconSet[];
  public iconSetDirectory = 'emoticons';
  public baseUrl = 'assets/images/';

  constructor() {
    this.iconSets = IconsSets;
    this.newGame();
  }

  resetSource() {
    const basePath = `${this.baseUrl}${this.iconSetDirectory}/src`;
    this.src = [];
    for (let i = 0; i < this.sourceLength; ++i) {
      const piece: Piece = {
        id: 'src' + i.toString(),
        filePath: basePath + i.toString() + '.png'
      };
      this.src.push(piece);
    }
  }

  cheat(itemId: string) {
    const targetIndex: number = this.getTargetIndex(itemId);
    for (let i = 0; i < this.sourceLength; ++i) {
      if (this.src[i].filePath === this.solution[targetIndex]) {
        this.target[targetIndex].filePath = this.src[i].filePath;
        this.guess.srcIndexes[targetIndex] = i;
        break;
      }
    }
  }

  resetTarget() {
    this.target = [];
    for (let i = 0; i < this.solutionLength; ++i) {
      const piece: Piece = {
        id: 'target' + i.toString(),
        filePath: this.getBlankImage()
      };
      this.target.push(piece);
    }
  }

  public getBlankImage(): string {
    console.log(`${this.baseUrl}${this.blankImage}`);
    return `${this.baseUrl}${this.blankImage}`;
  }

  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.thetarget = event.srcElement.id;
  }

  @HostListener('dragend', ['$event'])
  public onDrop(event: DragEvent) {

    event.preventDefault();
    event.stopPropagation();
    const srcId = event.srcElement.id;
    const targetIndex = Number(this.thetarget.substring(6));
    this.updateGuess(srcId, targetIndex);
  }

  public updateGuess(srcId: string, targetIndex: number) {

    const srcIndex = this.getSrcIndex(srcId);
    if (this.duplicateDetected(srcIndex)) { return; }
    this.target[targetIndex].filePath = this.src[srcIndex].filePath;
    this.guess.srcIndexes[targetIndex] = srcIndex;
  }

  public guessComplete(): boolean {
    if (this.guess.srcIndexes.some(p => p === null)) {
      return true;
    }
    return false;
  }

  public srcImageClicked(srcId: string) {
    if (this.gameStatus.gameComplete) { return; }
    const targetIndex = this.guess.srcIndexes.indexOf(null);
    if (targetIndex > -1) {
      this.updateGuess(srcId, targetIndex);
    }
  }

  public targetImageClicked(targetId: string) {
    if (this.gameStatus.gameComplete) { return; }
    const targetIndex = this.getTargetIndex(targetId);
    this.guess.srcIndexes[targetIndex] = null;
    this.target[targetIndex].filePath = this.getBlankImage();
  }

  public showPrevGuesses(): boolean {
    return Utils.ArrayHasValue(this.prevGuesses);
  }

  public GenerateSolution() {
    this.solution = [];
    for (let i = 0; i < this.solutionLength; ++i) {
      this.solution.push('');
    }
    for (let i = 0; i < this.solutionLength; ++i) {
      let isDuplicate = true;
      while (isDuplicate) {
        const rand = Math.floor(Math.random() * 8);
        if (this.solution.every(p => p !== this.src[rand].filePath)) {
          this.solution[i] = this.src[rand].filePath;
          isDuplicate = false;
        }
      }
    }
  }

  duplicateDetected(srcIndex: number): boolean {
    if (this.guess.srcIndexes.indexOf(srcIndex) >= 0) {
      return true;
    }
    return false;
  }

  getSrcIndex(id: string): number {
    return (Number(id.substring(3)));
  }

  getTargetIndex(id: string): number {
    return (Number(id.substring(6)));
  }

  checkGuess(envent) {
    let redCount = 0;
    let whiteCount = 0;

    for (let i = 0; i < this.solutionLength; ++i) {
      const filePathTocheck = this.src[this.guess.srcIndexes[i]].filePath;
      if (filePathTocheck === this.solution[i]) {
        redCount++;
      } else if (this.solution.some(p => p === filePathTocheck)) {
        whiteCount++;
      }
    }
    this.guess.redCount = redCount.toString();
    this.guess.whiteCount = whiteCount.toString();
    this.updatePreviousGuesses();
    if (redCount >= this.solutionLength) {
      this.gameStatus.playerHasWon = true;
      this.freezeGame();
      return;
    }
    if (this.prevGuesses.length >= this.maxGuesses) {
      this.gameStatus.playerHasLost = true;
      this.freezeGame();
      return;
    }

    this.resetTarget();
    this.guess = new Guess(this.solutionLength);
  }

  public changeIconSet(item: IconSet) {
    if (item.value === this.iconSetDirectory)  {
      return;
    }
    this.iconSetDirectory = item.value;
    this.newGame();
  }
  updatePreviousGuesses() {
    const guessCopy = this.guess.clone(this.solutionLength);
    this.prevGuesses.unshift(guessCopy);
  }

  newGame() {
    this.guess = new Guess(this.solutionLength);
    this.gameStatus = new GameStatus();
    this.prevGuesses = [];
    this.resetSource();
    this.resetTarget();
    this.GenerateSolution();
  }

  freezeGame() {
    this.gameStatus.gameComplete = true;
  }
}


