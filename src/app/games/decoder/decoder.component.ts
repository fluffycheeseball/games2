import { Component, OnInit, HostListener } from '@angular/core';
import { IconsSets } from './iconsets';
import { Piece, Guess, GameStatus, IGuess, IconSet } from './dtos';
import { ArrayUtils, Utils, ConsoleLog } from '../../Utils';
import { LogService } from '../../logging/services/log.service';


@Component({
  selector: 'app-decoder',
  templateUrl: './decoder.component.html',
  styleUrls: ['./decoder.component.css']
})
export class DecoderComponent implements OnInit {
  public target: Piece[] = [];
  public src: Piece[] = [];

  public greenTick: string;
  public amberTick: string;
  public blankImage: string;

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
  public guessIsComplete = false;

  constructor(private logService: LogService) {
    this.iconSets = IconsSets;
    this.setImagePaths();
  }

  ngOnInit() {
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
        filePath: this.blankImage
      };
      this.target.push(piece);
    }
  }

  public setImagePaths() {
    this.blankImage = `${this.baseUrl}whitespot.png`;
    this.greenTick = `${this.baseUrl}greentick.png`;
    this.amberTick = `${this.baseUrl}ambertick.png`;
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
    this.logService.debug(`onDrop called with srcId: ${srcId} , targetIndex ${targetIndex}`);
    this.updateGuess(srcId, targetIndex);
  }

  public updateGuess(srcId: string, targetIndex: number) {
    this.logService.debug(`updateGuess called with srcId: ${srcId} , targetIndex ${targetIndex}`);
    const srcIndex = this.getSrcIndex(srcId);
    if (this.duplicateDetected(srcIndex)) { return; }
this.guess.srcIndexes[targetIndex] = srcIndex;
this.target[targetIndex].filePath = this.src[srcIndex].filePath;
  }

  public checkGuessComplete() {
    if (this.guess.srcIndexes.some(p => p === null)) {
      this.guessIsComplete = true;
    }
    this.guessIsComplete = false;
  }

  public srcImageClicked(srcId: string) {
    this.logService.debug(`srcImageClicked called with srcId: ${srcId}`);
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
    this.target[targetIndex].filePath = this.blankImage;
  }

  public showPrevGuesses(): boolean {
    return ArrayUtils.ArrayHasValue(this.prevGuesses);
  }

  clearSolution() {
    this.logService.debug(`clearSolution`);
    this.solution = [];
    for (let i = 0; i < this.solutionLength; ++i) {
      this.solution.push('');
    }
  }

  populateSolution() {
    this.logService.debug(`populateSolution`);
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
    let result = false;
    if (this.guess.srcIndexes.indexOf(srcIndex) >= 0) {
      result = true;
    }
    this.logService.debug(`duplicateDetected returning ${result}`);
    return result;
  }

  getSrcIndex(id: string): number {
    return (Number(id.substring(3)));
  }

  getTargetIndex(id: string): number {
    return (Number(id.substring(6)));
  }

  processGuess(event) {
    this.checkGuess();
    this.updatePreviousGuesses();
    if (this.guess.redCount >= this.solutionLength) {
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

  public checkGuess() {
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
    this.guess.redCount = redCount;
    this.guess.whiteCount = whiteCount;
  }

  public changeIconSet(item: IconSet) {
    if (item.value === this.iconSetDirectory) {
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
    this.logService.debug(`newGame`);
    this.guess = new Guess(this.solutionLength);
    this.gameStatus = new GameStatus();
    this.prevGuesses = [];
    this.resetSource();
    this.resetTarget();
    this.clearSolution();
    this.populateSolution();
  }

  freezeGame() {
    this.gameStatus.gameComplete = true;
  }
}


