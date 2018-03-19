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
import { Canvas } from 'fabric/fabric-impl';
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
    });

    this.canvas.on('mouse:down', function (options) {

      console.log('movign group?');
      console.log(options.target);

      if (!Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.piece)) {
        const piece = options.target.piece;
        const yOff = options.e.clientY - options.target.canvas._offset.top;
        const xOff = options.e.clientX - options.target.canvas._offset.left;
      }
    });
    // this has to be inline - we cannot pass options to an angular method
    this.canvas.on('mouse:up', function (options) {

      let movingObj: any;
      const movingGrp = options._objects;
      let canvas: any;
      let isJoined = false;

      function joinToRightSide(ePiece: JigsawPiece, testObj: any) {
        console.log('j join ' + ePiece.id + ' to right of ' + testObj.piece.id);
        movingObj.setLeft(testObj.piece.tlbr[RIGHT] - 27 - 1);
        movingObj.setTop(testObj.piece.tlbr[TOP] + testObj.piece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
        isJoined = true;
      }

      function joinToLeftSide(ePiece: JigsawPiece, testObj: any) {
        console.log('j join ' + ePiece.id + ' to left of ' + testObj.piece.id);
        movingObj.setLeft(testObj.piece.tlbr[LEFT] - movingObj.width + 27 + 1);
        movingObj.setTop(testObj.piece.tlbr[TOP] + testObj.piece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
        isJoined = true;
      }
      function joinToTopSide(ePiece: JigsawPiece, testObj: any) {
        console.log('j join ' + ePiece.id + ' to top of ' + testObj.piece.id);
        movingObj.setTop(testObj.piece.tlbr[TOP] - movingObj.height + 27 + 1);
        movingObj.setLeft(testObj.piece.tlbr[LEFT] + testObj.piece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
        isJoined = true;
      }
      function joinToBottomSide(ePiece: JigsawPiece, testObj: any) {
        console.log('j join ' + ePiece.id + ' to bottom of ' + testObj.piece.id);
        movingObj.setTop(testObj.piece.tlbr[BOTTOM] - 27 - 1);
        movingObj.setLeft(testObj.piece.tlbr[LEFT] + testObj.piece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
        isJoined = true;
      }

      function movingAGroup() {
        return !Utils.IsNullOrUndefined(options.target._objects) && options.target._objects.length > 0;
      }

      function movingAPiece() {
        return !Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.piece);
      }


      // 4 scenarios
      // piece moved over another piece
      // piece moved over a group
      // group moved over a piece
      // group moved over another group

      //
    //  if (!Utils.IsNullOrUndefined(options.target._objects) && options.target._objects.length > 0) {
       if (movingAGroup())  {
        console.log('moving a group' + options.target._objects.length);
        canvas = options.target.canvas;
        const yOff = options.e.clientY - canvas._offset.top;
        const xOff = options.e.clientX - canvas._offset.left;

        for (let i = 0; i < options.target._objects.length; i++) {
          movingObj = options.target._objects[i];
          console.log(movingObj.piece.id);

        }
      }

      // check if we need to join to another piece
      // if (!Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.piece)) {
       if (movingAPiece()) {
      console.log('moving a single piece');
        movingObj = options.target;
        const piece = movingObj.piece;
        canvas = movingObj.canvas;
        let testObj: any;
        const yOff = options.e.clientY - canvas._offset.top;
        const xOff = options.e.clientX - canvas._offset.left;
        const pieceLeft = movingObj.left;
        const pieceTop = movingObj.top;
        const pieceRight = movingObj.left + movingObj.width;
        const pieceBottom = movingObj.top + movingObj.height;


        for (let i = 0; i < canvas._objects.length; i++) {

          if (canvas._objects[i]._objects !== undefined && canvas._objects[i]._objects !== null) {
            const group = canvas._objects[i];
            for (let j = 0; j < group._objects.length; j++) {
              testObj = group._objects[j];
              const testPieceLeft = group.left + testObj.left + (group.width / 2);
              const testPieceTop = group.top + testObj.top + (group.height / 2);
              const testPieceRight = testPieceLeft + testObj.width;
              const testPieceBottom = testPieceTop + testObj.height;
              const testRect = new fabric.Rect({
                width: testObj.width, height: testObj.height,
                left: testPieceLeft, top: testPieceTop
              });
              canvas.add(testRect);

              if (testRect.containsPoint(new fabric.Point(pieceRight, yOff)) === true
                && piece.joiningPieces[RIGHT] === testObj.piece.id) {
                joinToLeftSide(piece, testObj);
              }
              if (testRect.containsPoint(new fabric.Point(pieceLeft, yOff)) === true
                && piece.joiningPieces[LEFT] === testObj.piece.id) {
                joinToRightSide(piece, testObj);
              }

              if (testRect.containsPoint(new fabric.Point(xOff, pieceTop)) === true
                && piece.joiningPieces[TOP] === testObj.piece.id) {
                joinToBottomSide(piece, testObj);
              }

              if (testRect.containsPoint(new fabric.Point(xOff, pieceBottom)) === true
                && piece.joiningPieces[BOTTOM] === testObj.piece.id) {
                joinToTopSide(piece, testObj);
              }
              canvas.remove(testRect);

              if (isJoined) {
                movingObj.setCoords();
                movingObj.piece.tlbr = [movingObj.top, movingObj.left, (movingObj.top + movingObj.height), (movingObj.left + movingObj.width)];
                console.log('add to group');
                //    group.addWithUpdate(testObj);
                // const group = new fabric.Group([canvas._objects[i], options.target], {});
                // canvas.add(group);
                //                canvas.remove(options.target.canvas._objects[i]);
                // canvas.remove(options.target);
                break;
              }
            }

          } else {  // test piece is not in a group

            testObj = canvas._objects[i];
            if (testObj.piece === undefined) { // not a jigsaw piece - some other canvas object 
              continue;
            }

            if (testObj.containsPoint(new fabric.Point(pieceRight, yOff)) === true
              && piece.joiningPieces[RIGHT] === testObj.piece.id) {
              joinToLeftSide(piece, testObj);
            }

            if (testObj.containsPoint(new fabric.Point(pieceLeft, yOff)) === true
              && piece.joiningPieces[LEFT] === testObj.piece.id) {
              joinToRightSide(piece, testObj);
            }

            if (testObj.containsPoint(new fabric.Point(xOff, pieceTop)) === true
              && piece.joiningPieces[TOP] === testObj.piece.id) {
              joinToBottomSide(piece, testObj);
            }

            if (testObj.containsPoint(new fabric.Point(xOff, pieceBottom)) === true
              && piece.joiningPieces[BOTTOM] === testObj.piece.id) {
              joinToTopSide(piece, testObj);
            }
          }
          if (isJoined) {
            movingObj.setCoords();
            movingObj.piece.tlbr = [movingObj.top, movingObj.left, (movingObj.top + movingObj.height), (movingObj.left + movingObj.width)];
            const group = new fabric.Group([canvas._objects[i], options.target], {});
            canvas.add(group);
            canvas.remove(options.target.canvas._objects[i]);
            canvas.remove(options.target);
            break;
          } else {
            console.log('piece not joined');
            movingObj.piece.tlbr = [movingObj.top, movingObj.left, (movingObj.top + movingObj.height), (movingObj.left + movingObj.width)];
          }
        }
      }

    });
  }



  public setPieces() {
    const total = this.jigsawSvce.jigsaw.puzzleWidth * this.jigsawSvce.jigsaw.puzzleHeight;
    for (let r = 0; r < total; r++) {

      const mypath = new this.customPath(this.pieces[r].pattern,
        { piece: this.pieces[r] }
      );
      mypath.hasControls = false;
      mypath.hasBorders = false;
      fabric.Image.fromURL(this.jigsawSvce.jigsaw.imageUrl,
        img => {
          const patternSourceCanvas = new fabric.StaticCanvas();
          patternSourceCanvas.add(img);
          const pattern = new fabric.Pattern({
            offsetX: this.pieces[r].topLeft[COLUMN],
            offsetY: this.pieces[r].topLeft[ROW],
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
          mypath.piece.tlbr = [mypath.top, mypath.left, (mypath.top + mypath.height), (mypath.left + mypath.width)];
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
