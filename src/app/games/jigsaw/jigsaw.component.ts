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
import { Console } from '@angular/core/src/console';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';
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
    width: 700,
    height: 800
  };

  constructor(private jigsawService: JigsawService) {
  }

  private getCoordsString(originX: number, originY: number): string {
    const curvyCoords = this.jigsawService.middlePiece1;
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
    // close the path
    str = str + ' z ';
    return str;
  }

  public addImages() {
     for (let r = 0; r < this.pieces.length; r++) {

    //for (let r = 0; r < 2; r++) {
      const mypath = new fabric.Path(this.pieces[r].pattern);
      mypath.pathOffset.y = ((3 - this.pieces[r].GridPosition[1]) / 3) * 150;
      mypath.pathOffset.x = (((3 - this.pieces[r].GridPosition[0]) / 3) * 150);
      console.log(mypath);
      fabric.Image.fromURL('assets/images/pingu.png',
        img => {
          img.scale(1).set({
            left: 100,
            top: 100,
            clipTo: function (ctx) {
              mypath._render(ctx);
            }
          });
          this.canvas.add(img);
        });
    }
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
    console.log(this.jigsawPuzzle)
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
          GridPosition: [i, j],
          pattern: this.getPath(i, j, locX, locY)
        };
        //  console.log('grid: ' + i + ' ' + j);
        //  console.log('pattern: ' + piece.pattern);
        this.pieces.push(piece);
      }
    }
  }

  public getPath(row: number, col: number, originX: number, originY: number): string {
    let path = 'M 0 0';

    path = path + this.getSidePath('top', 0, 0, this.getSideShape('top', row, col));

    path = path + this.getSidePath('right', 100, 0, this.getSideShape('right', row, col));
    path = path + this.getSidePath('bottom', 100, 100, this.getSideShape('bottom', row, col));
    path = path + this.getSidePath('left', 0, 100, this.getSideShape('left', row, col));

    if (row === 0 && col === 0) {
      // console.log('row: ' + row);
      // console.log('col: ' + col);
      // console.log('top: ' + this.getSideShape('top', row, col));
      // console.log('right: ' + this.getSideShape('right', row, col));
      // console.log('bottom: ' + this.getSideShape('bottom', row, col));
      // console.log('left: ' + this.getSideShape('left', row, col));
      // console.log(path);
    }
    return path + ' z';
  }

  public drawlines() {
    let T = 0;
    let L = 0;
    let R = 100;
    const B = 100;
    let s = 'M ' + L + ' ' + B;
    let coords: number[];

    // left side of piece
    coords = this.getPathCoords(this.jigsawService.shapeLeftXUpwards, this.jigsawService.shapeLeftYUpwards, L, B);
    s = s + this.coordsToString(coords);
   // this.drawLine(s);
    s = 'M ' + L + ' ' + B;
    coords = this.getPathCoords(this.jigsawService.shapeRightXUpwards, this.jigsawService.shapeRightYUpwards, L, B);
    s = s + this.coordsToString(coords);
  //  this.drawLine(s);

    // right side of piece
    s = 'M ' + R + ' ' + T;
    coords = this.getPathCoords(this.jigsawService.shapeLeftXDownwards, this.jigsawService.shapeLeftYDownwards, R, T);
    s = s + this.coordsToString(coords);
  // this.drawLine(s);

 s = 'M ' + R + ' ' + T;
 coords = this.getPathCoords(this.jigsawService.shapeRightXDownwards, this.jigsawService.shapeRightYDownwards, R, T);
 s = s + this.coordsToString(coords);
 // this.drawLine(s);

  //top side
  s = 'M ' + L + ' ' + T;
  coords = this.getPathCoords(this.jigsawService.shapeUpXLTR, this.jigsawService.shapeUpYLTR, L, T);
  s = s + this.coordsToString(coords);
  // this.drawLine(s);

  s = 'M ' + L + ' ' + T;
  coords = this.getPathCoords(this.jigsawService.shapeDownXLTR, this.jigsawService.shapeDownYLTR, L, T);
  s = s + this.coordsToString(coords);
   this.drawLine(s);

   //bottom side
   s = 'M ' + R + ' ' + B;
   coords = this.getPathCoords(this.jigsawService.shapeDownXRTL, this.jigsawService.shapeDownYRTL, R, B);
   s = s + this.coordsToString(coords);
   // this.drawLine(s);

    s = 'M ' + R + ' ' + B;
    coords = this.getPathCoords(this.jigsawService.shapeUpXRTL, this.jigsawService.shapeUpYRTL, R, B);
    s = s + this.coordsToString(coords);
     this.drawLine(s);



  }

  private drawLine(s:string) {
    console.log(s);
    const line = new fabric.Path(s, { fill: '', stroke: 'black', objectCaching: false });
    line.selectable = true;
    line.hasBorder = false;
    line.hasControls = false;
    this.canvas.add(line);
  }

  public getSidePath(side: string, originX: number, originY: number, sideShape: string): string {
    if (sideShape === 'straight') {
      return this.GetStraightSidePath(side, originX, originY);
    }
    const top = 0;
    const left = 0;
    const right = 100;
    const bottom = 100;
    let coords: number[];
    switch (side) {
      case 'top': {
        coords = sideShape === 'up' ?
          this.getPathCoords(this.jigsawService.shapeUpXLTR, this.jigsawService.shapeUpYLTR, left, top) :
          this.getPathCoords(this.jigsawService.shapeDownXLTR, this.jigsawService.shapeDownYLTR, left, top);
        break;
      }
      case 'bottom': {
        coords = sideShape === 'up' ?
          this.getPathCoords(this.jigsawService.shapeUpXRTL, this.jigsawService.shapeUpYRTL, right, bottom) :
          this.getPathCoords(this.jigsawService.shapeDownXRTL, this.jigsawService.shapeDownYRTL, right, bottom);
        break;
      }
      case 'right': {
        coords = sideShape === 'right' ?
          this.getPathCoords(this.jigsawService.shapeLeftXDownwards, this.jigsawService.shapeLeftYDownwards, right, top) :
          this.getPathCoords(this.jigsawService.shapeRightXDownwards, this.jigsawService.shapeRightYDownwards, right, top);
        break;
      }
      case 'left': {
        coords = sideShape === 'left' ?
          this.getPathCoords(this.jigsawService.shapeLeftXUpwards, this.jigsawService.shapeLeftYUpwards, left, bottom) :
          this.getPathCoords(this.jigsawService.shapeRightXUpwards, this.jigsawService.shapeRightYUpwards, left, bottom);
        break;
      }
    }

    return this.coordsToString(coords);
  }

  public coordsToString(coords: number[]) {
    let str = '';
    for (let i = 0; i < coords.length; i++) {
      if (i % 6 === 0) {
        str = str + ' C ';
      }
      str = str + (coords[i]).toString();
      if (i < coords.length - 1) {
        str = str + ',';
      }
    }
    return str;
  }

  public GetStraightSidePath(side: string, originX: number, originY: number): string {
    if (side === 'top') {
      return ' L ' + (originX + this.jigsawPuzzle.pieceWidth) + ' ' + originY;
    }
    if (side === 'bottom') {
      return ' L ' + (originX - this.jigsawPuzzle.pieceWidth) + ' ' + originY;
    }
    if (side === 'right') {
      return ' L ' + (originX) + ' ' + (originY + this.jigsawPuzzle.pieceHeight);
    }
    if (side === 'left') {
      return ' L ' + (originX) + ' ' + (originY - this.jigsawPuzzle.pieceHeight);
    }
    console.log('invalid side: ' + side);
    return '';
  }

  public getSideShape(side: string, row: number, col: number): string {
    switch (side) {
      case 'top':
        {
          if (row === 0) { return 'straight'; }
          return this.jigsawPuzzle.horizontals[((row - 1) * this.jigsawPuzzle.puzzleHeight) + col];
        }
      case 'left':
        {
          if (col === 0) { return 'straight'; }
          return this.jigsawPuzzle.verticals[((col - 1) * this.jigsawPuzzle.puzzleWidth) + row];
        }
      case 'right':
        {
          if (col === this.jigsawPuzzle.puzzleWidth - 1) { return 'straight'; }
          return this.jigsawPuzzle.verticals[(col * this.jigsawPuzzle.puzzleWidth) + row];
        }
      case 'bottom':
        {
          if (row === this.jigsawPuzzle.puzzleHeight - 1) { return 'straight'; }
          return this.jigsawPuzzle.horizontals[(row * this.jigsawPuzzle.puzzleHeight) + col];
        }
      default:
        {
          console.log('invalid side: ' + side);
        }
    }
  }

  public getPathCoords(offsetsX: number[], offsetsY: number[], lastX: number, lastY: number): number[] {
    const p: number[] = new Array();
    p.push(lastX);
    p.push(lastY);
    for (let k = 0; k < 12; k++) {
      lastX = lastX + offsetsX[k];
      p.push(lastX);
      lastY = lastY + offsetsY[k];
      p.push(lastY);
      if (k > 0 && (k < 11) && (k + 1) % 2 === 0) {
        p.push(lastX);
        p.push(lastY);
      }
    }
    return p;
  }

  ngOnInit() {
    this.resetSource();
    this.setUpCanvas();
  }

  public setUpCanvas() {
    //setup front side canvas
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'red',
      backgroundColor: 'rgb(200,100,200)',
      selectionLineWidth: 0
    });
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }
}
