import { Guess } from './dtos/guess';
import { Component, OnInit, HostListener } from '@angular/core';
import { Piece } from './dtos/piece';
import { SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG } from 'constants';
import { forEach } from '@angular/router/src/utils/collection';
import { IconSet } from './dtos/iconSet';


@Component({
  selector: 'app-decoder',
  templateUrl: './decoder.component.html',
  styleUrls: ['./decoder.component.css']
})
export class DecoderComponent {
  public target: Piece[] = [];
  public src: Piece[] = [];

  public greenTick = 'assets/images/greentick.png';
  public amberTick = 'assets/images/ambertick.png';

  public guess: Guess;
  public prevGuesses: Guess[] = [];
  public solution: string[];
  public solutionLength = 4;
  public thetarget: string;
  public gameComplete;
  public playerHasWon = false;
  public playerHasLost = false;
  public maxGuesses = 10;
  public sourceLength = 8;
  public iconSets: IconSet[];
  public iconSetDirectory = 'emoticons';

  constructor() {
    this.populateIconConfig();
    this.newGame();
  }

  populateIconConfig() {
    this.iconSets = [
      {
        value: 'emoticons',
        filePath: 'assets/images/emoticons/src0.png'
      },
      {
        value: 'xmas',
        filePath: 'assets/images/xmas/src0.png'
      },
      {
        value: 'animals',
        filePath: 'assets/images/animals/src0.png'
      },
      {
        value: 'flags',
        filePath: 'assets/images/flags/src0.png'
      },
      {
        value: 'food',
        filePath: 'assets/images/food/src0.png'
      }
    ];
  }
  resetSource() {
    let basePath = 'assets/images/' + this.iconSetDirectory +  '/src';
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
    let targetIndex: number = this.getTargetIndex(itemId);
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
    return 'assets/images/whitespot.png';
  }

  resetGuess() {
    this.guess = {
      srcIndexes: [],
      redCount: '',
      whiteCount: ''
    };
    for (let i = 0; i < this.solutionLength; ++i) {
      this.guess.srcIndexes[i] = null;
    }
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
    if (this.gameComplete) { return; }
    const targetIndex = this.guess.srcIndexes.indexOf(null);
    if (targetIndex > -1) {
      this.updateGuess(srcId, targetIndex);
    }
  }

  public targetImageClicked(targetId: string) {
    if (this.gameComplete) { return; }
    const targetIndex = this.getTargetIndex(targetId);
    this.guess.srcIndexes[targetIndex] = null;
    this.target[targetIndex].filePath = this.getBlankImage();
  }

  public showPrevGuesses(): boolean {
    return this.prevGuesses != null && this.prevGuesses != undefined && this.prevGuesses.length > 0;
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
      this.playerHasWon = true;
      this.freezeGame();
      return;
    }
    if (this.prevGuesses.length >= this.maxGuesses) {
      this.playerHasLost = true;
      this.freezeGame();
      return;
    }

    this.resetTarget();
    this.resetGuess();
  }

  public changeIconSet(item: IconSet) {
    if(item.value === this.iconSetDirectory)  {
      return;
    }
    this.iconSetDirectory = item.value;
    this.newGame();
  }
  updatePreviousGuesses() {
    const guessCopy: Guess = {
      srcIndexes: [null, null, null, null],
      redCount: this.guess.redCount,
      whiteCount: this.guess.whiteCount
    };
    for (let i = 0; i < this.solutionLength; ++i) {
      guessCopy.srcIndexes[i] = this.guess.srcIndexes[i];
    }
    this.prevGuesses.unshift(guessCopy);
  }

  newGame() {
    this.prevGuesses = [];
    this.resetSource();
    this.resetTarget();
    this.resetGuess();
    this.GenerateSolution();
    this.gameComplete = false;
    this.playerHasWon = false;
    this.playerHasLost = false;
  }

  freezeGame() {
    this.gameComplete = true;
  }
}


