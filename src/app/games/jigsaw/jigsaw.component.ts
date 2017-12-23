import { JigsawPuzzle } from './../decoder/dtos/jigsaw-puzzle';
import { JigsawService } from './../../services/jigsaw.services';
import { Piece } from './../decoder/dtos/piece';
import { Component, OnInit, HostListener } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { log } from 'util';


@Component({
  selector: 'app-jigsaw',
  templateUrl: './jigsaw.component.html',
  styleUrls: ['./jigsaw.component.css']
})
export class JigsawComponent implements OnInit {
  @ViewChild('mycanvas') canvasRef: ElementRef;

  public pieces: Piece[] = [];
  public iconSetDirectory = 'jigsaw';
  public jigsawPuzzle: JigsawPuzzle = new JigsawPuzzle();
  public isDropped = true;
  public xOffset = 0;
  public yOffset = 0;
  constructor(private jigsawService: JigsawService) {

  }

  resetSource() {
    const basePath = 'assets/images/' + this.iconSetDirectory;
    const settingsFilePath = basePath + '/puzzle.json';
    this.jigsawService.getJigsawPuzzleSettingsFromFile(settingsFilePath).subscribe(
      res => {
        console.log(res);
        this.jigsawPuzzle = new JigsawPuzzle();
        this.jigsawPuzzle.puzzleWidth = res.puzzleWidth;
        this.jigsawPuzzle.puzzleHeight = res.puzzleHeight;
        this.jigsawPuzzle.pieceWidth = res.pieceWidth;
        this.jigsawPuzzle.pieceHeight = res.pieceHeight;
        console.log(this.jigsawPuzzle);
        this.setPieces(basePath);
      }
    );
  }

  public setPieces(basePath: string) {
    console.log('setPieces');
    this.pieces = [];
    console.log(this.jigsawPuzzle.puzzleWidth);
    console.log(this.jigsawPuzzle.puzzleHeight);
     for (let i = 0; i < this.jigsawPuzzle.puzzleWidth; ++i) {
      for (let j = 0; j < this.jigsawPuzzle.puzzleHeight; ++j) {
        const id = 'img' + ('000' + i).slice(-3) + '_' + ('000' + j).slice(-3);
        console.log(id);
        const piece: Piece = {
          id: id,
          filePath: basePath + '/' + id + '.png'
        };
        this.pieces.push(piece);
      }
    }
  }
  ngOnInit() {
    this.resetSource();
  }

  locked(id: string): boolean {
    return false;
  }

  // ngAfterViewInit() {
  //    const canvas = this.canvasRef.nativeElement;
  //    const context = canvas.getContext('2d');

  //    let counter = 0;
  //    for (let i = 0; i < this.puzzleWidth; ++i) {
  //      for (let j = 0; j < this.puzzleHeight; ++j) {
  //      const source = new Image();
  //      source.crossOrigin = 'Anonymous';
  //      source.draggable = true;
  //      const img = <HTMLImageElement>document.getElementById(this.pieces[counter].id);
  //      source.onload = () => {
  //       // context.drawImage(img, (10 * i) + (i * this.imgWidth), (10 * j) + (j * this.imgHeight));
  //    };
  //      source.src = this.pieces[counter].filePath;

  //      console.log('init: ' + img.id);
  //      console.log('is draggable: ' + img.draggable);
  //      counter++;
  //    }
  //    }
  // }

  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent, theid: string) {
    if (this.isDropped) {
      this.xOffset = event.offsetX;
      this.yOffset = event.offsetY;
      this.isDropped = false;
    }
    this.InhibitDefaultBehaviour(event);
  }

  @HostListener('dragend', ['$event'])
  public onDrop(event: DragEvent) {
    const idAttr = event.srcElement.id;
    this.isDropped = true;
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const canvasLocation = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    const img = <HTMLImageElement>document.getElementById(idAttr);
    img.style.display = 'none';
    context.drawImage(img, event.x - canvasLocation.left - this.xOffset, event.y - canvasLocation.top - this.yOffset);
    this.InhibitDefaultBehaviour(event);
  }

  InhibitDefaultBehaviour(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }
}
