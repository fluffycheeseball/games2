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
      const mypath = new fabric.Path(this.pieces[r].pattern);
      mypath.pathOffset.x = 150 + (this.pieces[r].GridPosition[1] * -1 * this.jigsawPuzzle.pieceWidth);
      mypath.pathOffset.y = 150 + (this.pieces[r].GridPosition[0] * -1 * this.jigsawPuzzle.pieceHeight);

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

  public getPath(row: number, col: number, originX: number, originY: number): string {
    let path = 'M 0 0';

    path = path + this.getSidePath('top', 0, 0, this.getSideShape('top', row, col));

    path = path + this.getSidePath('right', 100, 0, this.getSideShape('right', row, col));
    path = path + this.getSidePath('bottom', 100, 100, this.getSideShape('bottom', row, col));
    path = path + this.getSidePath('left', 0, 100, this.getSideShape('left', row, col));

    return path + ' z';
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
