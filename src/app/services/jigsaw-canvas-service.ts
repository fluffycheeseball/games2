import { Injectable } from "@angular/core";
import { Utils } from "../Utils/utils";

import 'fabric';
import { Canvas } from 'fabric/fabric-impl';
import { LEFT, TOP, COLUMN, ROW, BOTTOM, RIGHT } from "../games/constants";
import { JigsawPiece, JigsawPuzzle } from "../games/jigsaw/dtos";
import { isJsObject } from "@angular/core/src/change_detection/change_detection_util";
// import { fabric } from 'fabric';
declare const fabric: any;

@Injectable()
export class JigsawCanvasService {

  public canvas: any = null;
  public customPath: any;
  private size: any = {
    width: 700,
    height: 800
  };
  public pieces: JigsawPiece[] = [];

  public setCanvasSize() {
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
    this.canvas.renderAll();
  }
  public createCanvasPieces(jigsaw: JigsawPuzzle) {
    const total = jigsaw.puzzleWidth * jigsaw.puzzleHeight;
    for (let r = 0; r < total; r++) {
      let mypath = this.getPath(this.pieces[r], jigsaw);
      this.setPieceDimensions(mypath.piece, jigsaw, mypath.top, mypath.left);
    }
  }

  public setPieces(pieces: JigsawPiece[]) {
    this.pieces = pieces;
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

  public getPath(piece: JigsawPiece, jigsaw: JigsawPuzzle): any {
    const mypath = new this.customPath(piece.pattern,
      { piece: piece, jigsaw: jigsaw }
    );
    mypath.hasControls = false;
    mypath.hasBorders = false;
    fabric.Image.fromURL(jigsaw.imageUrl,
      img => {
        const patternSourceCanvas = new fabric.StaticCanvas();
        patternSourceCanvas.add(img);
        const pattern = new fabric.Pattern({
          offsetX: piece.topLeft[COLUMN],
          offsetY: piece.topLeft[ROW],
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
        this.canvas.renderAll();
      });
    return mypath;
  }

  public setUpCanvas() {
    if (Utils.HasValue(this.canvas)) {
      this.removeObjectsFromCanvas(this.canvas._objects);
      this.canvas.renderAll();
    }
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'red',
      backgroundColor: 'rgb(200,100,200)',
      selectionLineWidth: 0,
      renderOnAddRemove: false
    });
    this.setCanvasSize();
    this.canvas.on('mouse:up', (options) => {
      this.canvasOnMouseUp(options);
    });
  }

  public canvasOnMouseUp(options: any) {

    if (Utils.IsNullOrUndefined(options.target)) {
      return;
    }
    if (this.movingAGroup(options)) {

      let movedGroup = options.target;
      this.updatePieceCoordsOfMovedGroup(movedGroup);

      for (let i = 0; i < movedGroup._objects.length; i++) {
        let movedObject = movedGroup._objects[i];

        for (let j = 0; j < this.canvas._objects.length; j++) {
          const testObject = this.canvas._objects[j];
          if (this.testGroupIsAlsoMovingGroup(movedGroup, testObject)) {
            continue;
          }
          let isJoined = false;
          if (this.isAGroup(testObject)) {
            isJoined = this.CheckAndJoinTwoGroups(movedGroup, testObject, movedObject.piece);
          } else {
            isJoined = this.CheckAndJoinGroupToPiece(movedGroup, testObject, movedObject.piece);
          }
          if (isJoined) { break; }
        }
      }
    } else {
      let movingObject = options.target;
      this.setPieceCoords(movingObject.piece, movingObject.left, movingObject.top);
      for (let i = 0; i < this.canvas._objects.length; i++) {
        const testObject = this.canvas._objects[i];
        let isJoined = false;
        if (this.isAGroup(testObject)) {
          isJoined = this.CheckAndJoinPieceToGroup(movingObject, testObject);
        } else {
          isJoined = this.CheckAndJoinPieceToPiece(movingObject, testObject);
        }
        if (isJoined) { break; }
      }
    }
  }

  public movingAGroup(options: any): boolean {
    return Utils.HasValue(options.target._objects) && options.target._objects.length > 0;
  }

  public updatePieceCoordsOfMovedGroup(movingGroup:any) {
    for (let i = 0; i < movingGroup._objects.length; i++) {
      let movingObject = movingGroup._objects[i];
      this.setPieceCoords(movingObject.piece,
        (movingObject.left + (movingGroup.width / 2) + movingGroup.left),
        (movingObject.top + (movingGroup.height / 2) + movingGroup.top));
    }
  }

  public CheckAndJoinTwoGroups(movingGroup: any, testGroup: any, piece: JigsawPiece): boolean {
    let testObjects = testGroup.getObjects();
    testGroup._restoreObjectsState();
    this.canvas.remove(testGroup);
    
    for (let i = 0; i < testObjects.length; i++) {
      let testPiece = testObjects[i].piece;
      const sideToJoinTo = this.getSideToJoinTo(testObjects[i], piece, testPiece);
      if (Utils.HasValue(sideToJoinTo)) {
        console.log('count1 ' + this.canvas._objects.length)
      let movedObjects = movingGroup.getObjects();
      movingGroup._restoreObjectsState();
      this.canvas.remove(movingGroup);
        this.applyOffsetToMovingObjects(movedObjects, sideToJoinTo, piece, testPiece);
        this.addTestObjectsToMovingObjects(movedObjects, testObjects);
        this.createNewGroup(movedObjects);
        this.removeObjectsFromCanvas(movedObjects);
        this.canvas.renderAll();
    //    console.log('count ' + this.canvas._objects.length)
        return true;
      } 
    }
    this.createNewGroup(testObjects);
    this.removeObjectsFromCanvas(testObjects);
    this.canvas.renderAll();
    return false;
  }

  public CheckAndJoinGroupToPiece(movingGroup: any, testObject: any, piece: JigsawPiece): boolean {
    const sideToJoinTo = this.getSideToJoinTo(testObject, piece, testObject.piece);
    if (Utils.HasValue(sideToJoinTo)) {
      let movedObjects = movingGroup.getObjects();
      movingGroup._restoreObjectsState();
      this.canvas.remove(movingGroup);
      this.removeObjectsFromCanvas([testObject]);
      this.applyOffsetToMovingObjects(movedObjects, sideToJoinTo, piece, testObject.piece);
      movedObjects.push(testObject);
      this.createNewGroup(movedObjects);
      this.removeObjectsFromCanvas(movedObjects);
      this.canvas.renderAll();
      return true;
    }
    return false;
  }

  public CheckAndJoinPieceToGroup(movingObject: any, testGroup: any): boolean {
    let isJoined = false;
    let sideToJoinTo: number;
    let testObjects = testGroup.getObjects();
    testGroup._restoreObjectsState();
    this.canvas.remove(testGroup);
    for (let i = 0; i < testObjects.length; i++) {
      let testPiece = testObjects[i].piece
      sideToJoinTo = this.getSideToJoinTo(testObjects[i], movingObject.piece, testPiece);
      isJoined = Utils.HasValue(sideToJoinTo);
      if (isJoined) {
        this.jumpMovingObjectToJoinPosition(sideToJoinTo, testPiece, movingObject);
        this.removeObjectsFromCanvas([movingObject]);
        this.removeObjectsFromCanvas(testObjects);
        testObjects.push(movingObject);
        this.addObjectsToCanvas(testObjects);
        this.canvas.renderAll();
        break;
      }
    }
    this.createNewGroup(testObjects);
    this.removeObjectsFromCanvas(testObjects);
    this.canvas.renderAll();
    return isJoined;
  }

  public CheckAndJoinPieceToPiece(movingObject: any, testObject: any): boolean {
    const testPiece = testObject.piece;
    const sideToJoinTo = this.getSideToJoinTo(testObject, movingObject.piece, testObject.piece);
    if (Utils.HasValue(sideToJoinTo)) {
      this.jumpMovingObjectToJoinPosition(sideToJoinTo, testPiece, movingObject);
      this.createNewGroup([movingObject, testObject]);
      this.removeObjectsFromCanvas([movingObject, testObject]);
      this.canvas.renderAll();
      return true;
    }
    return false;
  }

  public jumpMovingObjectToJoinPosition(sideToJoinTo: number, testPiece: JigsawPiece, movingObject: any) {
    if (movingObject.piece.id === testPiece.id) {
      return;
    }
    switch (sideToJoinTo) {
      case LEFT: {
        this.joinToLeftSide(movingObject.piece, testPiece, movingObject);
        break;
      }
      case RIGHT: {
        this.joinToRightSide(movingObject.piece, testPiece, movingObject);
        break;
      }
      case BOTTOM: {
        this.joinToBottomSide(movingObject.piece, testPiece, movingObject);
        break;
      }
      case TOP: {
        this.joinToTopSide(movingObject.piece, testPiece, movingObject);
        break;
      }
    }
    this.setPieceCoords(movingObject.piece, movingObject.left, movingObject.top);
  }

  public joinToRightSide(piece: JigsawPiece, testPiece: JigsawPiece, movingObjet: any) {
    movingObjet.setLeft(testPiece.right - testPiece.sideAllowance[RIGHT] - piece.sideAllowance[LEFT]);
    movingObjet.setTop(testPiece.top + testPiece.sideAllowance[TOP] - piece.sideAllowance[TOP]);
  }

  public joinToLeftSide(piece: JigsawPiece, testPiece: JigsawPiece, movingObject: any) {
    movingObject.setLeft(testPiece.left - piece.width + piece.sideAllowance[RIGHT] + testPiece.sideAllowance[LEFT]);
    movingObject.setTop(testPiece.top + testPiece.sideAllowance[TOP] - piece.sideAllowance[TOP]);
  }
  public joinToTopSide(piece: JigsawPiece, testPiece: JigsawPiece, movingObject: any) {
    movingObject.setTop(testPiece.top - piece.height + piece.sideAllowance[BOTTOM] + testPiece.sideAllowance[TOP]);
    movingObject.setLeft(testPiece.left + testPiece.sideAllowance[LEFT] - piece.sideAllowance[LEFT]);
  }
  public joinToBottomSide(piece: JigsawPiece, testPiece: JigsawPiece, movingObj: any) {
    movingObj.setTop(testPiece.bottom - testPiece.sideAllowance[BOTTOM] - piece.sideAllowance[TOP]);
    movingObj.setLeft(testPiece.left + testPiece.sideAllowance[LEFT] - piece.sideAllowance[LEFT]);
  }

  public getSideToJoinTo(testRect: fabric.Rect, piece: JigsawPiece, testPiece: JigsawPiece): number {
    if (piece.id === testPiece.id) {
      return;
    }
    if (this.isOverRightSide(testRect, piece, testPiece)) {
      return RIGHT;
    }
    if (this.isOverLeftSide(testRect, piece, testPiece)) {
      return LEFT;
    }
    if (this.isOverBottomSide(testRect, piece, testPiece)) {
      return BOTTOM;
    }
    if (this.isOverTopSide(testRect, piece, testPiece)) {
      return TOP;
    }
    return null;
  }

  public isOverLeftSide(testRect: fabric.Rect, piece: JigsawPiece, testPiece: JigsawPiece) {
    return testRect.containsPoint(new fabric.Point(piece.right, piece.middle)) === true
      && piece.joiningPieces[RIGHT] === testPiece.id;
  }

  public isOverRightSide(testRect: fabric.Rect, piece: JigsawPiece, tstPiece: JigsawPiece) {
    return testRect.containsPoint(new fabric.Point(piece.left, piece.middle)) === true
      && piece.joiningPieces[LEFT] === tstPiece.id;
  }

  public isOverTopSide(testRect: fabric.Rect, piece: JigsawPiece, testPiece: JigsawPiece) {
    return testRect.containsPoint(new fabric.Point(piece.centre, piece.bottom)) === true
      && piece.joiningPieces[BOTTOM] === testPiece.id;
  }

  public isOverBottomSide(testRect: fabric.Rect, piece: JigsawPiece, testPiece: JigsawPiece) {
    return testRect.containsPoint(new fabric.Point(piece.centre, piece.top)) === true
      && piece.joiningPieces[TOP] === testPiece.id;
  }

  public removeObjectsFromCanvas(objectsToRemove: any[]) {
  //  console.log('canvas objects count before removal')
 //   console.log(this.canvas._objects.length);
    for (let i = 0; i < objectsToRemove.length; i++) {
      this.canvas.remove(objectsToRemove[i]);
    }
 //   this.canvas.renderAll();
 //   console.log('canvas objects count after removal')
//    console.log(this.canvas._objects.length);
  }

  public addObjectsToCanvas(objectsToAdd: any[]) {
 //   console.log('canvas objects count before add')
//    console.log(this.canvas._objects.length);
    for (let i = 0; i < objectsToAdd.length; i++) {
      this.canvas.add(objectsToAdd[i]);
    }
 //   this.canvas.renderAll();
 //   console.log('canvas objects count after add')
 //   console.log(this.canvas._objects.length);
  }

  public getTopLeftOffset(joinToSide: number, piece: JigsawPiece, testPiece: JigsawPiece): number[] {
    const offsets: Array<number> = [0, 0];
    switch (joinToSide) {
      case LEFT: {
        offsets[LEFT] = piece.left - (testPiece.left - piece.width + piece.sideAllowance[RIGHT] + testPiece.sideAllowance[LEFT]);
        offsets[TOP] = piece.top - (testPiece.top + testPiece.sideAllowance[TOP] - piece.sideAllowance[TOP]);
        return offsets;
      }
      case RIGHT:
        {
          offsets[LEFT] = piece.left - (testPiece.right - testPiece.sideAllowance[RIGHT] - piece.sideAllowance[LEFT]);
          offsets[TOP] = piece.top - (testPiece.top + testPiece.sideAllowance[TOP] - piece.sideAllowance[TOP]);
          return offsets;
        }
      case TOP:
        {
          offsets[TOP] = piece.top - (testPiece.top - piece.height + piece.sideAllowance[BOTTOM] + testPiece.sideAllowance[TOP]);
          offsets[LEFT] = piece.left - (testPiece.left + testPiece.sideAllowance[LEFT] - piece.sideAllowance[LEFT]);
          return offsets;
        }
      case BOTTOM:
        {
          offsets[TOP] = piece.top - (testPiece.bottom - testPiece.sideAllowance[BOTTOM] - piece.sideAllowance[TOP]);
          offsets[LEFT] = piece.left - (testPiece.left + testPiece.sideAllowance[LEFT] - piece.sideAllowance[LEFT]);
          return offsets;
        }
    }
    return offsets;
  }

  public setPieceDimensions(piece: JigsawPiece, jigsaw: JigsawPuzzle, top: number, left: number) {
    piece.width = jigsaw.pieceWidth + piece.sideAllowance[LEFT] + piece.sideAllowance[RIGHT];
    piece.height = jigsaw.pieceHeight + piece.sideAllowance[TOP] + piece.sideAllowance[BOTTOM];
    this.setPieceCoords(piece, left, top);
  }

  public setPieceCoords(piece: JigsawPiece, left: number, top: number) {
    piece.top = top;
    piece.left = left;
    piece.right = piece.left + piece.width;
    piece.bottom = piece.top + piece.height;
    piece.middle = piece.top + (piece.height / 2);
    piece.centre = piece.left + (piece.width / 2);
  }

  public createNewGroup(objectsToGroup: any) {
    const newGroup = new fabric.Group(objectsToGroup, {});
    newGroup.hasControls = false;
    newGroup.hasBorders = false;
    this.addObjectsToCanvas([newGroup]);
  }

  public applyOffsetToMovingObjects(movingObjects, sideToJoinTo: number, piece: JigsawPiece, testPiece: JigsawPiece) {
    let topLeftOffsets = this.getTopLeftOffset(sideToJoinTo, piece, testPiece)
    for (let i = 0; i < movingObjects.length; i++) {
      movingObjects[i].left -= topLeftOffsets[LEFT];
      movingObjects[i].top -= topLeftOffsets[TOP];
    }
  }

  public addTestObjectsToMovingObjects(movingObjects, testObjects) {
    for (let i = 0; i < testObjects.length; i++) {
      movingObjects.push(testObjects[i]);
    }
  }

  public testGroupIsAlsoMovingGroup(movedGroup: any, testGroup: any): boolean {
    const ids = this.getGroupPieceIds(movedGroup);
    const tstids = this.getGroupPieceIds(testGroup);
    return tstids.indexOf(ids[0]) >= 0
  }

  public AddTestRectangleToCanvas(piece: JigsawPiece): fabric.Rect {
    const testRect = new fabric.Rect({
      width: piece.width, height: piece.height,
      left: piece.left, top: piece.top
    });
    this.addObjectsToCanvas([testRect]);
    this.canvas.renderAll();
    return testRect;
  }

  public isAGroup(testingObj: any) {
    if (Utils.IsNullOrUndefined(testingObj) || Utils.IsNullOrUndefined(testingObj._objects)) { return false; }
    if (testingObj._objects.length < 1) { return false; }
    return true;
  }

  public getGroupPieceIds(group: any): number[] {
    const groupIds: number[] = [];
    if (Utils.IsNullOrUndefined(group._objects)) {
      return groupIds;
    }

    for (let i = 0; i < group._objects.length; i++) {
      if (Utils.IsNullOrUndefined(group._objects[i].piece)) { continue; }
      groupIds.push(group._objects[i].piece.id);
    }
    return groupIds;
  }

}