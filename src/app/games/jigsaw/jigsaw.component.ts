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


    this.canvas.on('mouse:down', (options) => {
      this.canvasOnMouseDown(options);
    });

    this.canvas.on('mouse:up', (options) => {
      this.canvasOnMouseUp(options);
    });

  }

  public canvasOnMouseDown(options:any) {
    console.log('down');
    console.log(options);
  }

  public canvasOnMouseUp(options:any) {
    console.log('up');
    let movingObj: any;
    let movingGroup: any;
    let canvas: any;
    let isJoined = false;
    let piece: JigsawPiece;
    let testObject: any;

    if (Utils.IsNullOrUndefined(options.target)) {
      return;
    }
    // 4 scenarios
    // piece moved over another piece
    // piece moved over a group
    // group moved over a piece
    // group moved over another group
    if (this.movingAGroup(options)) {
      movingGroup = options.target;
      canvas = movingGroup.canvas;
      console.log('canvas obj count :' + canvas._objects.length);
      for (let k = 0; k < movingGroup._objects.length; k++) {
        movingObj = movingGroup._objects[k];
        piece = movingObj.piece;
        this.setPieceCoords(piece,
          (movingObj.left + (movingGroup.width / 2) + movingGroup.left),
          (movingObj.top + (movingGroup.height / 2) + movingGroup.top));

        for (let i = 0; i < canvas._objects.length; i++) {
          const testGroup = canvas._objects[i];
          let testPiece: JigsawPiece;

          if (this.testGroupIsAlsoMovingGroup(movingGroup, testGroup)) {
            continue;
          }
          if (this.isAGroup(testGroup)) {
            for (let j = 0; j < testGroup._objects.length; j++) {
              testPiece = testGroup._objects[j].piece;
              const sideToJoinTo = this.getSideToJoinTo(piece, testPiece, canvas);
              if (!Utils.IsNullOrUndefined(sideToJoinTo)) {
                this.joinTwoGroups(sideToJoinTo, movingGroup, testGroup, piece, testPiece, canvas);
                isJoined = true;
                break;
              }
            }
          } else {
            testObject = canvas._objects[i];
            testPiece = testObject.piece;
            const sideToJoinTo = this.checkConnections2(testObject, piece, testPiece);
            if (!Utils.IsNullOrUndefined(sideToJoinTo)) {
              this.joinGroupToAPiece(sideToJoinTo, movingGroup, canvas, testObject, piece); {
                isJoined = true;
                break;
              }
            }
          }
          if (isJoined) {
            break;
          }
        }
      }
      console.log('canvas obj count2 :' + canvas._objects.length);
    }
    if (this.movingAPiece(options)) {
      movingObj = options.target;
      piece = movingObj.piece;
      this.checkObjectHasPiece(piece, 'test 2');
      canvas = movingObj.canvas;
      console.log('canvas obj count :' + canvas._objects.length);
      this.setPieceCoords(piece, movingObj.left, movingObj.top);

      for (let i = 0; i < canvas._objects.length; i++) {
        const testGroup = canvas._objects[i];
        if (this.isAGroup(testGroup)) {
          for (let j = 0; j < testGroup._objects.length; j++) {
            testObject = testGroup._objects[j];
            const testPiece = testGroup._objects[j].piece;
            this.checkObjectHasPiece(testPiece, 'test');
            const testRect = this.getTestRectangle(testPiece);
            canvas.add(testRect);
            isJoined = this.checkConnections(testRect, piece, testPiece, movingObj);
            canvas.remove(testRect);
            if (isJoined) {
              this.pieceJoinedToGroupCanvasUpdate(testGroup, piece, movingObj, canvas);
              break;
            }
          }
        } else {  // test piece is not in a group
          testObject = canvas._objects[i];
          const testPiece = testObject.piece;
          this.checkObjectHasPiece(testPiece, 'test');
          isJoined = this.checkConnections(testObject, piece, testPiece, movingObj);
          if (isJoined) {
            this.pieceJoinedToPieceCanvsUpdate(piece, movingObj, testObject, canvas);
            break;
          }
        }
      }
      console.log('canvas obj count2 :' + canvas._objects.length);
    }
    console.log(options);
  }

  public movingAGroup(options:any): boolean {
    return !Utils.IsNullOrUndefined(options.target._objects) && options.target._objects.length > 0;
  }

  public setPieceCoords(_piece: JigsawPiece, _pieceLeft: number, _pieceTop: number) {
    _piece.top = _pieceTop;
    _piece.left = _pieceLeft;
    _piece.right = _piece.left + _piece.width;
    _piece.bottom = _piece.top + _piece.height;
    _piece.middle = _piece.top + (_piece.height / 2);
    _piece.centre = _piece.left + (_piece.width / 2);
  }

  public testGroupIsAlsoMovingGroup(_movingGrp: any, _testGroup: any): boolean {
    const ids = this.getGroupPieceIds(_movingGrp);
    const tstids = this.getGroupPieceIds(_testGroup);
    if (tstids.indexOf(ids[0]) >= 0) {
      return true;
    }
    return false;
  }

  public isAGroup(testingObj: any) {
    if (Utils.IsNullOrUndefined(testingObj) || Utils.IsNullOrUndefined(testingObj._objects)) { return false; }
    if (testingObj._objects.length < 1) { return false; }
    return true;
  }

  public getSideToJoinTo(_piece: JigsawPiece, _testPiece: JigsawPiece, _canvas: any): number {
    const testRect = this.getTestRectangle(_testPiece);
    _canvas.add(testRect);
    const result = this.checkConnections2(testRect, _piece, _testPiece);
    _canvas.remove(testRect);
    return result;
  }

  public joinGroupToAPiece(_sideToJoinTo: number, _movingGroup: any, _canvas: fabric.Canvas, _testObject: any, _piece: JigsawPiece) {
    const movingObjects = _movingGroup.getObjects();
    this.removeGroup(_movingGroup, _canvas);
    _canvas.remove(_testObject);
    this.applyOffsetToMovingObjects(movingObjects, this.getTopLeftOffset(_sideToJoinTo, _piece, _testObject.piece));
    movingObjects.push(_testObject);
    this.createNewGroup(movingObjects, _canvas);
  }

  public addTestObjectsToMovingObjects(_movingObjects, _testObjects) {
    for (let tstItemId = 0; tstItemId < _testObjects.length; tstItemId++) {
      _movingObjects.push(_testObjects[tstItemId]);
    }
  }

  public applyOffsetToMovingObjects(_canvasObjects, _topLeftOffsets: number[]) {
    for (let m = 0; m < _canvasObjects.length; m++) {
      _canvasObjects[m].left -= _topLeftOffsets[LEFT];
      _canvasObjects[m].top -= _topLeftOffsets[TOP];
      _canvasObjects[m].setCoords();
    }
  }

  public joinTwoGroups(_sideToJoinTo: number, _movingGroup: any, _testGroup: any, _piece: JigsawPiece, _testPiece: JigsawPiece, _canvas: fabric.Canvas) {
    const topLeftOffsets = this.getTopLeftOffset(_sideToJoinTo, _piece, _testPiece);
    const movingObjects = _movingGroup.getObjects();
    const testObjects = _testGroup.getObjects();
    this.removeGroup(_movingGroup, _canvas);
    this.removeGroup(_testGroup, _canvas);
    this.applyOffsetToMovingObjects(movingObjects, topLeftOffsets);
    this.addTestObjectsToMovingObjects(movingObjects, testObjects);
    this.createNewGroup(movingObjects, _canvas);
  }

  public pieceJoinedToPieceCanvsUpdate(_piece: JigsawPiece, _movingObj: any, _testObject:any, _canvas:any) {
    _movingObj.setCoords();
    this.setPieceCoords(_piece, _movingObj.left, _movingObj.top);
    const newGroup = new fabric.Group([_movingObj, _testObject], {});
    newGroup.hasControls = false;
    newGroup.hasBorders = false;
    _canvas.add(newGroup);

    _canvas.remove(_movingObj);
    _canvas.remove(_testObject);
  }

  public removeGroup(_group: any, _canvas: fabric.Canvas) {
    _group.destroy();
    _canvas.remove(_group);
  }

  public createNewGroup(_canvasObjects: any, _canvas: fabric.Canvas) {
    const newGroup = new fabric.Group(_canvasObjects, {});
    newGroup.hasControls = false;
    newGroup.hasBorders = false;
    _canvas.add(newGroup);
    _canvas.renderAll();
  }

  public joinToRightSide(ePiece: JigsawPiece, tstPiece: JigsawPiece, movingObj:any) {
    movingObj.setLeft(tstPiece.right - tstPiece.sideAllowance[RIGHT] - ePiece.sideAllowance[LEFT]);
    movingObj.setTop(tstPiece.top + tstPiece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
  }

  public joinToLeftSide(ePiece: JigsawPiece, tstPiece: JigsawPiece,movingObj:any) {
    movingObj.setLeft(tstPiece.left - ePiece.width + ePiece.sideAllowance[RIGHT] + tstPiece.sideAllowance[LEFT]);
    movingObj.setTop(tstPiece.top + tstPiece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
  }
  public joinToTopSide(ePiece: JigsawPiece, tstPiece: JigsawPiece,movingObj:any) {
    movingObj.setTop(tstPiece.top - ePiece.height + ePiece.sideAllowance[BOTTOM] + tstPiece.sideAllowance[TOP]);
    movingObj.setLeft(tstPiece.left + tstPiece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
  }
  public joinToBottomSide(ePiece: JigsawPiece, tstPiece: JigsawPiece,movingObj:any) {
    movingObj.setTop(tstPiece.bottom - tstPiece.sideAllowance[BOTTOM] - ePiece.sideAllowance[TOP]);
    movingObj.setLeft(tstPiece.left + tstPiece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
  }


  public pieceJoinedToGroupCanvasUpdate(testGroup: any, _piece: JigsawPiece,_movingObj: any, _canvas:any) {
_movingObj.setCoords();
    this.setPieceCoords(_piece, _movingObj.left, _movingObj.top);

    const testObjects = testGroup.getObjects();
    this.removeGroup(testGroup, _canvas);
    _canvas.remove(_movingObj);
    testObjects.push(_movingObj);
    for (let m = 0; m < testObjects.length; m++) {
      _canvas.add(testObjects[m]);
    }
    this.createNewGroup(testObjects, _canvas);

    for (let item = 0; item < testObjects.length; item++) {
      console.log('item' + item);
      console.log(testObjects[item]);
      _canvas.remove(testObjects[item]);
    }

  }

  public checkObjectHasPiece(checkpiece: JigsawPiece, str: string) {
    if (Utils.IsNullOrUndefined(checkpiece)) {
      console.log('null or undefined piece: ' + str);
    }
  }

  public getGroupPieceIds(grp: any): number[] {
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

  public checkConnections(tstRect: fabric.Rect, ePiece: JigsawPiece, 
    tstPiece: JigsawPiece, _movingObj:any):boolean {
    if (ePiece.id === tstPiece.id) {
      console.log('same piece');
      return false;
    }
    if (this.isOverLeftSide(tstRect, ePiece, tstPiece)) {
      this.joinToLeftSide(ePiece, tstPiece,_movingObj);
      return true;
    }
    if (this.isOverRightSide(tstRect, ePiece, tstPiece)) {
      this.joinToRightSide(ePiece, tstPiece,_movingObj);
      return true;
    }
    if (this.isOverBottomSide(tstRect, ePiece, tstPiece)) {
      this.joinToBottomSide(ePiece, tstPiece,_movingObj);
      return true;
    }
    if (this.isOverTopSide(tstRect, ePiece, tstPiece)) {
      this.joinToTopSide(ePiece, tstPiece,_movingObj);
      return true;
    }
    return false;
  }

  public isOverLeftSide(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
    return tstRect.containsPoint(new fabric.Point(ePiece.right, ePiece.middle)) === true
      && ePiece.joiningPieces[RIGHT] === tstPiece.id;
  }

  public isOverRightSide(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
    return tstRect.containsPoint(new fabric.Point(ePiece.left, ePiece.middle)) === true
      && ePiece.joiningPieces[LEFT] === tstPiece.id;
  }

  public isOverTopSide(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
    return tstRect.containsPoint(new fabric.Point(ePiece.centre, ePiece.bottom)) === true
      && ePiece.joiningPieces[BOTTOM] === tstPiece.id;
  }

  public isOverBottomSide(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece) {
    return tstRect.containsPoint(new fabric.Point(ePiece.centre, ePiece.top)) === true
      && ePiece.joiningPieces[TOP] === tstPiece.id;
  }

  public checkConnections2(tstRect: fabric.Rect, ePiece: JigsawPiece, tstPiece: JigsawPiece): number {
    if (ePiece.id === tstPiece.id) {
      return;
    }
    if (this.isOverRightSide(tstRect, ePiece, tstPiece)) {
      return RIGHT;
    }
      if (this.isOverLeftSide(tstRect, ePiece, tstPiece)) {
      return LEFT;
    }
      if (this.isOverBottomSide(tstRect, ePiece, tstPiece)) {
      return BOTTOM;
    }
      if (this.isOverTopSide(tstRect, ePiece, tstPiece)) {
      return TOP;
    }
    return null;
  }

  public getTopLeftOffset(joinToSide: number, ePiece: JigsawPiece, tstPiece: JigsawPiece): number[] {
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
  public getTestRectangle(aPiece: JigsawPiece): fabric.Rect {
    const testRect = new fabric.Rect({
      width: aPiece.width, height: aPiece.height,
      left: aPiece.left, top: aPiece.top
    });
    return testRect;
  }

  public movingAPiece(options:any) {
    return !Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.piece);
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
