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

  public addImages() {
    for (let r = 0; r < this.pieces.length; r++) {
    let x = (this.pieces[r].GridPosition[1] * 200);
    let y = (this.pieces[r].GridPosition[0] * 200);
      const mypath = new fabric.Path(this.pieces[r].pattern);
      mypath.hasControls = false;
      mypath.hasBorders = false;
   //   console.log(mypath);
      fabric.Image.fromURL('assets/images/pingu.png',
        img => {
          const patternSourceCanvas = new fabric.StaticCanvas();
          patternSourceCanvas.add(img);
       //   console.log(this.pieces[r].GridPosition[0] + ' ' + this.pieces[r].GridPosition[1]);
       //   console.log('offset: ' + x + ' ' + y);
          const pattern = new fabric.Pattern({
            offsetX: x,
            offsetY: y,
              source: function () {
              patternSourceCanvas.setDimensions({
                width: img.getWidth() + 0,
                height: img.getHeight() + 0
              });
              return patternSourceCanvas.getElement();
            },
          });
          mypath.fill = pattern;
    //      console.log(pattern);
          this.canvas.add(mypath);
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
    this.pieces = [];
    for (let col = 0; col < this.jigsawPuzzle.puzzleWidth; ++col) {
      for (let row = 0; row < this.jigsawPuzzle.puzzleHeight; ++row) {
        const locX = col * this.jigsawPuzzle.pieceWidth;
        const locY = row * this.jigsawPuzzle.pieceHeight;
        const id = 'img' + ('000' + col).slice(-3) + '_' + ('000' + row).slice(-3);
        const piece: JigsawPiece = {
          id: id,
          filePath: basePath + '/' + id + '.png',
          locationCoords: [locX, locY],
          GridPosition: [col, row],
          pattern: this.getPath(col, row, locX, locY)
        };
        this.pieces.push(piece);
      }
    }
  }

  public getPath(row: number, col: number, left: number, top: number): string {
    let path = 'M ' + left + ' '  + top;
    path = path + this.getSidePath('top', left ,top, this.getSideShape('top', row, col));
    path = path + this.getSidePath('right', left, top, this.getSideShape('right', row, col));
    path = path + this.getSidePath('bottom', left, top, this.getSideShape('bottom', row, col));
    path = path + this.getSidePath('left', left, top, this.getSideShape('left', row, col));

    return path + ' z';
  }
  public getSidePath(side: string, left: number, top: number, sideShape: string): string {
    if (sideShape === 'straight') {
      return this.GetStraightSidePath(side, left, top);
    }
    const right = left + this.jigsawPuzzle.pieceWidth;
    const bottom = top + this.jigsawPuzzle.pieceWidth ;
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

  public GetStraightSidePath(side: string, left: number, top: number): string {
    const right = left + this.jigsawPuzzle.pieceWidth;
    const bottom = top + this.jigsawPuzzle.pieceWidth ;
    if (side === 'top') {
      return ' L ' + right + ' ' + top;
    }
    if (side === 'bottom') {
      return ' L ' + left + ' ' + bottom;
    }
    if (side === 'right') {
      return ' L ' + right + ' ' + bottom;
    }
    if (side === 'left') {
      return ' L ' + left + ' ' + top;
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
