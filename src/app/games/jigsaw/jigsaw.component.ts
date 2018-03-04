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
           console.log('piece ' + piece.id + ' locked');
           this.jigsawPuzzle.lockX = xOff - piece.topleft[LEFT];
           console.log(this.jigsawPuzzle.lockX);
           this.jigsawPuzzle.lockY = yOff - piece.tlCorner[TOP];
           console.log(this.jigsawPuzzle.lockY);
         }
      } else {
        console.log('no piece clicked');
      }
    });
    // this has to be inline - we cannot pass options to an angular method
    this.canvas.on('mouse:up', function (options) {
      // this has to be in line - the javascript lib
        // check if we need to joint to another piece
        if (!Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.grpieceidRow)) {
          const pointInSvgPolygon = require('point-in-svg-polygon');
          for (let i = 0; i < this.pieces.length; i++) {
            const yOff = options.e.clientY - options.target.canvas._offset.top;
            const xOff = options.e.clientX - options.target.canvas._offset.left;
            const result = pointInSvgPolygon.isInside([xOff, yOff], this.pieces[i].pattern);
            if (result === true) {
              // check whether these two pieces should be joined
              const piece = options.target.grpieceidRow;
              console.log('piece ' + piece.id + ' unlocked');
              if (piece.joiningPieces[TOP] === i) {
                console.log('join to bottom of piece ' + i);
              }
              if (piece.joiningPieces[BOTTOM] === i) {
                console.log('join to top of piece ' + i);
              }
              if (piece.joiningPieces[LEFT] === i) {
                console.log('join to right of piece ' + i);
              }
              if (piece.joiningPieces[RIGHT] === i) {
                console.log('join to left of piece ' + i);
              }
              console.log(options.target.grpieceidRow);
              console.log('lockX ' + this.jigsawPuzzle.lockX);
              console.log('lockY ' + this.jigsawPuzzle.lockY);
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
      fabric.Image.fromURL('assets/images/pingu.png',
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
