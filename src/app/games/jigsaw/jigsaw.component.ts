import { ROW, COLUMN, BOTTOM, RIGHT, TOP, LEFT, CENTRE, MIDDLE } from './../constants';
import { Utils } from './../../Utils/utils';
import { JigsawPiece } from './dtos/jigsawpiece';
import { JigsawPuzzle } from './dtos/jigsaw-puzzle';
import { JigsawService } from './../../services/jigsaw.services';
import { Piece } from './../decoder/dtos/piece';
import { Component, OnInit, HostListener, group } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { log } from 'util';

import 'fabric';
import { read } from 'fs';
import { Console } from '@angular/core/src/console';
import { Canvas } from 'fabric/fabric-impl';
// import { fabric } from 'fabric';
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
    this.canvas.on('mouse:move', function (options) { });

    this.canvas.on('mouse:down', function (options) {
      if (!Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.piece)) {
        const piece = options.target.piece;
      }
    });

    // this has to be inline - we cannot pass options to an angular method
    this.canvas.on('mouse:up', function (options) {
      let movingObj: any;
      let movingGrp: any;
      let canvas: any;
      let isJoined = false;
      let piece: JigsawPiece;
      let testObj: any;

      if (Utils.IsNullOrUndefined(options.target)) {
        return;
      }
      // 4 scenarios
      // piece moved over another piece
      // piece moved over a group
      // group moved over a piece
      // group moved over another group
      if (movingAGroup()) {
        movingGrp = options.target;
        canvas = movingGrp.canvas;
        const groupIds = getGroupPieceIds(movingGrp);
        let joinedToPiece = false;

        for (let k = 0; k < movingGrp._objects.length; k++) {
          movingObj = movingGrp._objects[k];
          piece = movingObj.piece;
          checkObjectHasPiece(piece, 'test 3');
          setPieceCoords(
            (movingObj.left + (movingGrp.width / 2) + movingGrp.left),
            (movingObj.top + (movingGrp.height / 2) + movingGrp.top));

          for (let i = 0; i < canvas._objects.length; i++) {
            const testGroup = canvas._objects[i];
            let testPiece: JigsawPiece;

            if (isAGroup(testGroup)) {
              console.log('moved group - over test group');
              for (let j = 0; j < testGroup.length; j++) {
                testObj = testGroup._objects[j];
                testPiece = testObj.piece;
                checkObjectHasPiece(testPiece, 'test 4');
                const testRect = getTestRectangle(testPiece);
                canvas.add(testRect);
                checkConnections(testRect, piece, testPiece);
                canvas.remove(testRect);
                if (isJoined) {
                  console.log('yo joined');
                }
              }
            } else {
              testObj = canvas._objects[i];
              testPiece = testObj.piece;
              checkObjectHasPiece(testPiece, 'test');

              const res = checkConnections2(testObj, piece, testPiece);

              if (!Utils.IsNullOrUndefined(res)) {
                let yy: number[];
                console.log('res' + res)
                yy = getTopLeftOffset(res, piece, testPiece);
                console.log('offsetLeft ' + yy[LEFT]);
                console.log('offsetTop ' + yy[TOP]);
                const items = movingGrp.getObjects();
                movingGrp.destroy();
                canvas.remove(movingGrp);
                canvas.remove(testObj);
                for (let item = 0; item < items.length; item++) {
                  items[item].left -= yy[LEFT];
                  items[item].top -= yy[TOP];
                  items[item].setCoords();
                  canvas.add(items[item]);
                }
                items.push(testObj);
             const newGroup = new fabric.Group(items, {});
             canvas.add(newGroup);
                canvas.renderAll();

                // displayPieceCoords(testPiece);
                //     movingObj.setCoords();
                displayPieceCoords(piece);
                //                setPieceCoords(movingObj.left, movingObj.top);

                joinedToPiece = true;
                break;
              }
            }
          }
          if (joinedToPiece) {

            // const items = movingGrp.getObjects();
            // movingGrp.destroy();
            // canvas.remove(movingGrp);
            // canvas.remove(testObj);
            // items.push(testObj);
            // for (let item = 0; item < items.length; item++) {
            //   canvas.add(items[item]);
            // }
            // canvas.renderAll();
            // const newGroup = new fabric.Group(items, {});
            // canvas.add(newGroup);
            // for (let item = 0; item < items.length; item++) {
            //   canvas.remove(items[item]);
            // }

            break;
          }
          if (isJoined) {
            break;
          }
        }
        // check if we need to join to another piece
        // if (!Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.piece)) {
      }
      if (movingAPiece()) {
        //    console.log('moved a piece');
        movingObj = options.target;
        piece = movingObj.piece;
        checkObjectHasPiece(piece, 'test 2');
        canvas = movingObj.canvas;
        setPieceCoords(movingObj.left, movingObj.top);

        for (let i = 0; i < canvas._objects.length; i++) {
          const testGroup = canvas._objects[i];
          if (isAGroup(testGroup)) {
            console.log('moved piece is over a group');
            for (let j = 0; j < testGroup._objects.length; j++) {
              testObj = testGroup._objects[j];
              const testPiece = testGroup._objects[j].piece;
              checkObjectHasPiece(testPiece, 'test');
              const testRect = getTestRectangle(testPiece);
              canvas.add(testRect);
              checkConnections(testRect, piece, testPiece);
              canvas.remove(testRect);
              if (isJoined) {
                pieceJoinedToGroupCanvasUpdate(testGroup);
                break;
              }
            }
          } else {  // test piece is not in a group
            testObj = canvas._objects[i];
            const testPiece = testObj.piece;
            checkObjectHasPiece(testPiece, 'test');
            checkConnections(testObj, piece, testPiece);
            if (isJoined) {
              pieceJoinedToPieceCanvsUpdate();
              break;
            }
          }
        }
      }

      function movingAGroup(): boolean {
        return !Utils.IsNullOrUndefined(options.target._objects) && options.target._objects.length > 0;
      }

      function displayCanvasCount(len: number) {
        console.log('num objects on canvas: ' + len);
      }

      function pieceJoinedToPieceCanvsUpdate() {
        movingObj.setCoords();
        setPieceCoords(movingObj.left, movingObj.top);
        canvas.add(new fabric.Group([movingObj, testObj], {}));
        canvas.remove(movingObj);
        canvas.remove(testObj);
      }

      function pieceJoinedToGroupCanvasUpdate(testGroup: any) {
        movingObj.setCoords();
        setPieceCoords(movingObj.left, movingObj.top);

        const items = testGroup.getObjects();
        testGroup.destroy();
        canvas.remove(testGroup);
        canvas.remove(movingObj);
        items.push(movingObj);
        for (let item = 0; item < items.length; item++) {
          canvas.add(items[item]);
        }
        canvas.renderAll();
        const newGroup = new fabric.Group(items, {});
        canvas.add(newGroup);
        for (let item = 0; item < items.length; item++) {
          canvas.remove(items[item]);
        }

      }

      function checkObjectHasPiece(checkpiece: JigsawPiece, str: string) {
        if (Utils.IsNullOrUndefined(checkpiece)) {
          console.log('null or undefined piece: ' + str);
        }
      }
      function getGroupPieceIds(grp: any): number[] {
        const groupIds: number[] = [];
        if (Utils.IsNullOrUndefined(grp._objects)) {
          return groupIds;
        }

        for (let i = 0; i < grp._objects.length; i++) {
          if (Utils.IsNullOrUndefined(grp._objects[i].piece)) { continue; }
          groupIds.push(grp._objects[i].piece.id);
        }
        return groupIds;
      }

      function checkConnections(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        if (ePiece.id === tstPiece.id) {
          return;
        }
        if (tstRect.containsPoint(new fabric.Point(ePiece.right, ePiece.middle)) === true
          && ePiece.joiningPieces[RIGHT] === tstPiece.id) {
          joinToLeftSide(ePiece, tstPiece);
        }
        if (tstRect.containsPoint(new fabric.Point(ePiece.left, ePiece.middle)) === true
          && ePiece.joiningPieces[LEFT] === tstPiece.id) {
          joinToRightSide(ePiece, tstPiece);
        }

        if (tstRect.containsPoint(new fabric.Point(ePiece.centre, ePiece.top)) === true
          && ePiece.joiningPieces[TOP] === tstPiece.id) {
          joinToBottomSide(ePiece, tstPiece);
        }

        if (tstRect.containsPoint(new fabric.Point(ePiece.centre, ePiece.bottom)) === true
          && ePiece.joiningPieces[BOTTOM] === tstPiece.id) {
          joinToTopSide(ePiece, tstPiece);
        }
      }

      function isOverLeftSide(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        return tstRect.containsPoint(new fabric.Point(ePiece.right, ePiece.middle)) === true
          && ePiece.joiningPieces[RIGHT] === tstPiece.id;
      }

      function isOverRightSide(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        return tstRect.containsPoint(new fabric.Point(ePiece.left, ePiece.middle)) === true
          && ePiece.joiningPieces[LEFT] === tstPiece.id;
      }

      function isOverTopSide(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        return tstRect.containsPoint(new fabric.Point(ePiece.centre, ePiece.bottom)) === true
          && ePiece.joiningPieces[BOTTOM] === tstPiece.id;
      }

      function isOverBottomSide(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        return tstRect.containsPoint(new fabric.Point(ePiece.centre, ePiece.top)) === true
          && ePiece.joiningPieces[TOP] === tstPiece.id;
      }

      function checkConnections2(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece): number {
        if (ePiece.id === tstPiece.id) {
          return;
        }
        if (isOverLeftSide(tstRect, ePiece, tstPiece)) {
          return LEFT;
        }
        if (isOverRightSide(tstRect, ePiece, tstPiece)) {
          return RIGHT;
        }

        if (isOverBottomSide(tstRect, ePiece, tstPiece)) {
          return BOTTOM;
        }

        if (isOverTopSide(tstRect, ePiece, tstPiece)) {
          return TOP;
        }
        return null;

      }

      function getTopLeftOffset(joinToSide: number, ePiece: JigsawPiece, tstPiece: JigsawPiece): number[] {
        const offsets: Array<number> = [0, 0];
        switch (joinToSide) {
          case LEFT: {
            offsets[LEFT] = ePiece.left - (tstPiece.left - ePiece.width + ePiece.sideAllowance[RIGHT] + tstPiece.sideAllowance[LEFT]);
            offsets[TOP] = ePiece.top - (tstPiece.top + tstPiece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
            return offsets;
          }
          case RIGHT:
            {
              offsets[LEFT] = ePiece.left - (tstPiece.right - tstPiece.sideAllowance[RIGHT] - ePiece.sideAllowance[LEFT]);
              offsets[TOP] = ePiece.top - (tstPiece.top + tstPiece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
              return offsets;
            }
          case TOP:
            {
              offsets[TOP] = ePiece.top - (tstPiece.top - ePiece.height + ePiece.sideAllowance[BOTTOM] + tstPiece.sideAllowance[TOP]);
              offsets[LEFT] = ePiece.left - (tstPiece.left + tstPiece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
              return offsets;
            }
          case BOTTOM:
            {
              offsets[TOP] = ePiece.top - (tstPiece.bottom - tstPiece.sideAllowance[BOTTOM] - ePiece.sideAllowance[TOP]);
              offsets[LEFT] = ePiece.left - (tstPiece.left + tstPiece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
              return offsets;
            }
        }
        return offsets;
      }

      function setPieceCoords(pieceLeft: number, pieceTop: number) {
        piece.top = pieceTop;
        piece.left = pieceLeft;
        piece.right = pieceLeft + piece.width;
        piece.bottom = piece.top + piece.height;
        piece.middle = piece.top + (piece.height / 2);
        piece.centre = piece.left + (piece.width / 2);
      }

      function displayPieceCoords(thePiece: JigsawPiece) {
        console.log('TLBR')
        console.log(thePiece.top + ' , ' + thePiece.left + ' , ' + thePiece.bottom + ' , ' + thePiece.right)
      }

      function getTestRectangle(aPiece: JigsawPiece): fabric.Rect {
        const testRect = new fabric.Rect({
          width: aPiece.width, height: aPiece.height,
          left: aPiece.left, top: aPiece.top
        });
        return testRect;
      }

      function movingAPiece() {
        return !Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.piece);
      }

      function isAGroup(testingObj: any) {
        if (Utils.IsNullOrUndefined(testingObj) || Utils.IsNullOrUndefined(testingObj._objects)) { return false; }
        if (testingObj._objects.length < 1) { return false; }
        return true;
      }

      function joinToRightSide(ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        console.log('j join ' + ePiece.id + ' to right of ' + tstPiece.id);
        movingObj.setLeft(tstPiece.right - tstPiece.sideAllowance[RIGHT] - ePiece.sideAllowance[LEFT]);
        movingObj.setTop(tstPiece.top + tstPiece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
        isJoined = true;
      }

      function joinToLeftSide(ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        console.log('j join ' + ePiece.id + ' to left of ' + tstPiece.id);
        movingObj.setLeft(tstPiece.left - ePiece.width + ePiece.sideAllowance[RIGHT] + tstPiece.sideAllowance[LEFT]);
        movingObj.setTop(tstPiece.top + tstPiece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
        isJoined = true;
      }
      function joinToTopSide(ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        console.log('j join ' + ePiece.id + ' to top of ' + tstPiece.id);
        movingObj.setTop(tstPiece.top - ePiece.height + ePiece.sideAllowance[BOTTOM] + tstPiece.sideAllowance[TOP]);
        movingObj.setLeft(tstPiece.left + tstPiece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
        isJoined = true;
      }
      function joinToBottomSide(ePiece: JigsawPiece, tstPiece: JigsawPiece) {
        console.log('j join ' + ePiece.id + ' to bottom of ' + tstPiece.id);
        movingObj.setTop(tstPiece.bottom - tstPiece.sideAllowance[BOTTOM] - ePiece.sideAllowance[TOP]);
        movingObj.setLeft(tstPiece.left + tstPiece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
        isJoined = true;
      }
    });
  }

  public setPieces() {
    const total = this.jigsawSvce.jigsaw.puzzleWidth * this.jigsawSvce.jigsaw.puzzleHeight;
    for (let r = 0; r < total; r++) {

      const mypath = new this.customPath(this.pieces[r].pattern,
        { piece: this.pieces[r], jigsaw: this.jigsawSvce.jigsaw }
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
          const piece = mypath.piece;
          piece.width = this.jigsawSvce.jigsaw.pieceWidth + piece.sideAllowance[LEFT] + piece.sideAllowance[RIGHT];
          piece.height = this.jigsawSvce.jigsaw.pieceHeight + piece.sideAllowance[TOP] + piece.sideAllowance[BOTTOM];
          piece.top = mypath.top;
          piece.left = mypath.left;
          piece.right = piece.left + piece.width;
          piece.bottom = piece.top + piece.height;
          piece.middle = piece.top + (piece.height / 2);
          piece.centre = piece.left + (piece.width / 2);
          // console.log(piece.id + ' L:' + piece.left + ' T:' + piece.top + ' R:' + piece.right + ' B:' + piece.bottom + ' M:' + piece.middle + ' C:' + piece.centre);
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
