import { Utils } from './../../Utils/utils';
import { JigsawPiece } from './dtos/jigsawpiece';
import { JigsawPuzzle } from './dtos/jigsaw-puzzle';
import { JigsawService } from './../../services/jigsaw.services';
import { Piece } from './../decoder/dtos/piece';
import { Component, OnInit, HostListener } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { log } from 'util';

import 'fabric';
import { read } from 'fs';
declare const fabric: any;


@Component({
  selector: 'app-jigsaw',
  templateUrl: './jigsaw.component.html',
  styleUrls: ['./jigsaw.component.css']
})
export class JigsawComponent implements OnInit {
  @ViewChild('mycanvas') canvasRef: ElementRef;

  public pieces: JigsawPiece[] = [];
  public iconSetDirectory = 'jigsaw';
  public jigsawPuzzle: JigsawPuzzle = new JigsawPuzzle();
  public isDropped = true;
  public mouseRelativeToImgX = 0;
  public mouseRelativeToImgY = 0;
  public errorMargin = 40;


  private canvas: any;
  private props: any = {
    canvasFill: '#ffffff',
    canvasImage: '',
    id: null,
    opacity: null,
    fill: null,
    fontSize: null,
    lineHeight: null,
    charSpacing: null,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    TextDecoration: ''
  };
  private size: any = {
    width: 500,
    height: 800
  };

  constructor(private jigsawService: JigsawService) {


  }

  private getCoordsString(originX: number, originY: number, curvyCoords: number[]): string {
    let str = 'M ' + originX.toString() + ', ' + originY.toString() + ',';
    for (let i = 0; i < curvyCoords.length; i++) {
      const offset = i % 2 === 0 ? originX : originY;
      if (i % 6 === 0) {
        str = str + ' C ';
      }
      str = str + (offset + curvyCoords[i]).toString();
      if (i < curvyCoords.length - 1) {
        str = str + ',';
      }
    }
    return str;
  }

  public addCurves() {
    const left = 50;
    const top = 200;
    const path = this.getCoordsString(left, top, this.jigsawService.middlePiece);
    const line = new fabric.Path(path, { fill: '', stroke: 'black', objectCaching: false });
    line.selectable = false;
    this.canvas.add(line);
  }

  resetSource() {
    const basePath = 'assets/images/' + this.iconSetDirectory;
    const settingsFilePath = basePath + '/puzzle.json';
    this.jigsawService.getJigsawPuzzleSettingsFromFile(settingsFilePath).subscribe(
      res => {
        this.jigsawPuzzle = res;
        this.setPieces(basePath);
      }
    );
  }

  public setPieces(basePath: string) {
    this.pieces = [];
    for (let i = 0; i < this.jigsawPuzzle.puzzleWidth; ++i) {
      for (let j = 0; j < this.jigsawPuzzle.puzzleHeight; ++j) {
        const locX = i * this.jigsawPuzzle.pieceWidth;
        const locY = j * this.jigsawPuzzle.pieceHeight;
        const id = 'img' + ('000' + i).slice(-3) + '_' + ('000' + j).slice(-3);
        const piece: JigsawPiece = {
          id: id,
          filePath: basePath + '/' + id + '.png',
          locationCoords: [locX, locY],
          GridPosition: [i, j]
        };
        this.pieces.push(piece);
      }
    }
  }
  ngOnInit() {
    // this.resetSource();
    //setup front side canvas
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
      backgroundColor: 'rgb(100,100,200)',
      selectionLineWidth: 0
    });
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }

  locked(id: string): boolean {
    return false;
  }


  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent, theid: string) {
    if (this.isDropped) {
      const img = <HTMLImageElement>document.getElementById(event.srcElement.id);
      const imgLocation = img.getBoundingClientRect();
      this.mouseRelativeToImgX = event.clientX - imgLocation.left;
      this.mouseRelativeToImgY = event.clientY - imgLocation.top;
      this.isDropped = false;
    }
    this.InhibitDefaultBehaviour(event);
  }

  @HostListener('dragend', ['$event'])
  public onDrop(event: DragEvent) {
    this.isDropped = true;
    if (this.cannotBeDroppedHere(event)) {
      return;
    }
    const idAttr = event.srcElement.id;
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const piece = this.getPieceById(idAttr);
    const context = canvas.getContext('2d');
    const img = <HTMLImageElement>document.getElementById(idAttr);
    img.style.display = 'none';
    context.drawImage(img, piece.locationCoords[0], piece.locationCoords[1]);
    this.InhibitDefaultBehaviour(event);
  }

  cannotBeDroppedHere(event: DragEvent): boolean {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const canvasLocation = canvas.getBoundingClientRect();
    const piece = this.getPieceById(event.srcElement.id);
    const relLocX = event.x - canvasLocation.left - this.mouseRelativeToImgX;
    const relLocY = event.y - canvasLocation.top - this.mouseRelativeToImgY;
    if (Math.abs(relLocX - piece.locationCoords[0]) > this.errorMargin
      || Math.abs(relLocY - piece.locationCoords[1]) > this.errorMargin) {
      return true;
    }
    return false;
  }

  getPieceById(id: string): JigsawPiece {
    return this.pieces[this.pieces.findIndex(p => p.id === id)];
  }


  InhibitDefaultBehaviour(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }
}
