import { Piece } from './../decoder/dtos/piece';
import { Component, OnInit, HostListener } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';


@Component({
  selector: 'app-jigsaw',
  templateUrl: './jigsaw.component.html',
  styleUrls: ['./jigsaw.component.css']
})
export class JigsawComponent implements OnInit {
  @ViewChild('mycanvas') canvasRef: ElementRef;

  public pieces: Piece[] = [];
  public iconSetDirectory = 'jigsaw';
  public imgWidth = 100;
  public imgHeight = 133;
  public puzzleWidth = 2;
  public puzzleHeight = 2;
  public isDropped = true;
  public xOffset = 0;
  public yOffset = 0;
  public tStyle = '';

  constructor() {
    this.resetSource();
  }

  resetSource() {
    const basePath = 'assets/images/' + this.iconSetDirectory + '/img';
    this.pieces = [];
    const numPieces = this.puzzleWidth * this.puzzleHeight;
    for (let i = 0; i < numPieces; ++i) {
      const piece: Piece = {
        id: 'img' + i.toString(),
        filePath: basePath + i.toString() + '.png'
      };
      this.pieces.push(piece);
    }
  }
  ngOnInit() {
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
  public onDragOver(event: DragEvent) {
    if (this.isDropped) {
      this.xOffset = event.offsetX;
      this.yOffset = event.offsetY;
      this.isDropped = false;
    }
    this.InhibitDefaultBehaviour(event);
  }

  @HostListener('dragend', ['$event'])
  public onDrop(event: DragEvent) {
    this.isDropped = true;
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const canvasLocation = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    const img = <HTMLImageElement>document.getElementById('ddd');
    img.style.display = 'none';
    context.drawImage(img, event.x - canvasLocation.left - this.xOffset, event.y - canvasLocation.top - this.yOffset);
    this.InhibitDefaultBehaviour(event);
  }

  InhibitDefaultBehaviour(event:Event) {
    event.stopPropagation();
    event.preventDefault();
  }
}
