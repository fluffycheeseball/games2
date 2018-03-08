import { ROW, COLUMN, BOTTOM, RIGHT, TOP, LEFT } from './../constants';
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
  public isDropped = true;
  public mouseRelativeToImgX = 0;
  public mouseRelativeToImgY = 0;
  public errorMargin = 40;
  public customPath: any;

  private canvas: any;
  private size: any = {
    width: 700,
    height: 800
  };

  constructor(private jigsawSvce: JigsawService) {
    this.jigsawSvce.SetCanvasDimensions(this.size.width, this.size.Height);
  }
  public CreateCustomPath() {
    this.customPath = fabric.util.createClass(fabric.Path, {
      type: 'PiecePath',
      patt: '',
      initialize: function (path, options) {
        options || (options = {});
        this.callSuper('initialize', path, options);
        this.set({
          piece: options.piece
        });
      },
      _render: function (ctx) {
        this.callSuper('_render', ctx);
      }
    });
  }

  public addImages() {
    this.setPieces();
    this.canvas.set({ pieces: this.pieces, jigsawPuzzle: this.jigsawSvce.jigsaw });
    this.canvas.on('mouse:move', function (options) {
      if (!Utils.IsNullOrUndefined(this.jigsawPuzzle.lockedPieceIndex)) {
        //   console.log(options.e.offsetX + ', ' + options.e.offsetY);
      }
    });

    this.canvas.on('mouse:down', function (options) {

      const pointInSvgPolygon = require('point-in-svg-polygon');
      if (!Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.grpieceidRow)) {
        const piece = options.target.grpieceidRow;
        const yOff = options.e.clientY - options.target.canvas._offset.top;
        const xOff = options.e.clientX - options.target.canvas._offset.left;
        const result = pointInSvgPolygon.isInside([xOff, yOff], piece.pattern);
        if (result === true) {
   //       console.log('piece ' + piece.id + ' locked');
        }
      } else {
   //     console.log('no piece clicked');
      }
    });
    // this has to be inline - we cannot pass options to an angular method
    this.canvas.on('mouse:up', function (options) {
      // this has to be in line - the javascript lib

      // check if we need to joint to another piece
      if (!Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.grpieceidRow)) {
        const piece = options.target.grpieceidRow;

        const yOff = options.e.clientY - options.target.canvas._offset.top;
        const xOff = options.e.clientX - options.target.canvas._offset.left;
    //    console.log('target l,t ' +  options.target.left + ', ' + options.target.top);
    //    console.log('target r,b ' +  (options.target.left + options.target.width) + ', ' + (options.target.top + options.target.height);
        const pointInSvgPolygon = require('point-in-svg-polygon');
        // check for a right/left join
        // is the right side of the target piece within 20 pixels of the left side of its matching piece 
 const pieceRight = options.target.left + options.target.width;
        for (let i = 0; i < this.pieces.length; i++) {
          const result = pointInSvgPolygon.isInside([pieceRight, yOff], this.pieces[i].pattern);
          if (result === true) {
            if (piece.joiningPieces[RIGHT] === i) {
              console.log('j join ' + piece.id + 'to left of ' + i);
              break;
            }
          }
        }
        for (let i = 0; i < this.pieces.length; i++) {
          const result = pointInSvgPolygon.isInside([options.target.left, yOff], this.pieces[i].pattern);
          if (result === true) {
            if (piece.joiningPieces[LEFT] === i) {
              console.log('j join ' + piece.id + 'to right of ' + i);
              break;
            }
          }
        }
        for (let i = 0; i < this.pieces.length; i++) {
          const result = pointInSvgPolygon.isInside([xOff, options.target.top], this.pieces[i].pattern);
          if (result === true) {
            if (piece.joiningPieces[TOP] === i) {
              console.log('j join ' + piece.id + 'to bottom of ' + i);
              break;
            }
          }
        }
        const pieceBottom = options.target.top+ options.target.height;
        for (let i = 0; i < this.pieces.length; i++) {
          const result = pointInSvgPolygon.isInside([xOff, pieceBottom], this.pieces[i].pattern);
          if (result === true) {
            if (piece.joiningPieces[BOTTOM] === i) {
              console.log('j join ' + piece.id + 'to top of ' + i);
              break;
            }
          }
        }
      }

      // mark unlocked
      this.jigsawPuzzle.lockX = null;
      this.jigsawPuzzle.lockY = null;

    });
  }



  public setPieces() {
    const total = this.jigsawSvce.jigsaw.puzzleWidth * this.jigsawSvce.jigsaw.puzzleHeight;
    for (let r = 0; r < total; r++) {

      const mypath = new this.customPath(this.pieces[r].pattern,
        { grpieceidRow: this.pieces[r] }
      );
      mypath.hasControls = false;
      mypath.hasBorders = false;
      fabric.Image.fromURL(this.jigsawSvce.jigsaw.imageUrl,
        img => {
          const patternSourceCanvas = new fabric.StaticCanvas();
          patternSourceCanvas.add(img);
          const pattern = new fabric.Pattern({
            offsetX: this.pieces[r].topleft[COLUMN],
            offsetY: this.pieces[r].topleft[ROW],
            repeat: 'no-repeat',
            source: function () {
              patternSourceCanvas.setDimensions({
                width: img.getWidth() + 0,
                height: img.getHeight() + 0
              });
              return patternSourceCanvas.getElement();
            },
          });
          mypath.fill = pattern;
          this.canvas.add(mypath);
          mypath.on('mouse:down', function (options) {
            console.log('piece down');
          });
        });
    }
  }

  resetSource() {
    const basePath = 'assets/images/' + this.iconSetDirectory;
    const settingsFilePath = basePath + '/puzzle.json';
    this.jigsawSvce.getJigsawPuzzleSettingsFromFile(settingsFilePath).subscribe(
      res => {
        this.jigsawSvce.SetJigsaw(res);
        this.pieces = this.jigsawSvce.getPieces(basePath);
        this.CreateCustomPath();
      }
    );
  }

  ngOnInit() {
    this.resetSource();
    this.setUpCanvas();

  }

  public setUpCanvas() {
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'red',
      backgroundColor: 'rgb(200,100,200)',
      selectionLineWidth: 0
    });
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    this.canvas.on('mouse:down', function (options) {

    });
    this.canvas.on('mouse:up', function (options) {

    });
  }
  public addOriginalImg() {
    fabric.Image.fromURL(this.jigsawSvce.jigsaw.imageUrl,
      img => {
        img.opacity = 0.5;
        img.selectable = false;
        this.canvas.add(img);
      });
  }

}
