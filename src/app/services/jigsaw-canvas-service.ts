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

  public isNope = false;
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
    this.canvas.on('mouse:move', (options) => {
      this.canvasOnMouseMove(options);
    });
    this.canvas.on('mouse:down', (options) => {
      this.canvasOnMouseDown(options);
    });
  }
  public canvasOnMouseMove(options: any) {
    if (Utils.IsNullOrUndefined(options.target)) {
      return;
    }
    if(this.isNope ) {
      options.target.lockMovementX = true;
      options.target.lockMovementY = true;
      return;
    }
    else{
      options.target.lockMovementX = false;
      options.target.lockMovementY = false;     
    }
  }

  public canvasOnMouseDown(options: any) {
    if (Utils.IsNullOrUndefined(options.target)) {
      return;
    }
    if (this.movingAGroup(options)) {
      console.log('check mouse is within paths')
      options.target.lockMovementX = false;
      options.target.lockMovementY = false; 
      this.isNope = Utils.getRandomBoolean()
      if(this.isNope) {
        options.target.lockMovementX = true;
        options.target.lockMovementY = true;
      console.log('isNope');
      }
    }
  }

  public canvasOnMouseUp(options: any) {
    if(this.isNope) {
      console.log('up isNope');
      return;
      }

    if (Utils.IsNullOrUndefined(options.target)) {
      return;
    }
    if (this.movingAGroup(options)) {
      console.log('moved a group');
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
      console.log('moved a piece');
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

  public updatePieceCoordsOfMovedGroup(movingGroup: any) {
    let objectsInGroup: any[] = [];
    objectsInGroup = this.getAllCanvasObjectsInGroup(movingGroup, objectsInGroup);
  //  for (let i = 0; i < movingGroup._objects.length; i++) {
    for (let i = 0; i < objectsInGroup.length; i++) {
      let movingObject = objectsInGroup[i];
      this.setPieceCoords(movingObject.piece,
        (movingObject.left + (movingGroup.width / 2) + movingGroup.left),
        (movingObject.top + (movingGroup.height / 2) + movingGroup.top));
    }
  }

  public CheckAndJoinTwoGroups(movingGroup: any, testGroup: any, piece: JigsawPiece): boolean {

    for (let i = 0; i < testGroup._objects.length; i++) {
      let testPiece = testGroup._objects[i].piece;
      const sideToJoinTo = this.getSideToJoinTo(piece, testPiece);
      this.DisplaySide(sideToJoinTo);

      if (Utils.HasValue(sideToJoinTo)) {
        let testObjects = testGroup.getObjects();
        testGroup._restoreObjectsState();
        this.canvas.remove(testGroup);

        let movedObjects = movingGroup.getObjects();
        movingGroup._restoreObjectsState();
        this.canvas.remove(movingGroup);

        this.applyOffsetToMovingObjects(movedObjects, sideToJoinTo, piece, testPiece);
        this.addTestObjectsToMovingObjects(movedObjects, testObjects);
        this.createNewGroup(movedObjects);
        this.removeObjectsFromCanvas(movedObjects);
        this.canvas.renderAll();
        return true;
      }
    }
    return false;
  }

  public CheckAndJoinGroupToPiece(movingGroup: any, testObject: any, piece: JigsawPiece): boolean {
    const sideToJoinTo = this.getSideToJoinTo(piece, testObject.piece);
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
    let objectsInGroup: any[] = [];
    objectsInGroup = this.getAllCanvasObjectsInGroup(testGroup, objectsInGroup);
    console.log('objectsInGroup')
    console.log(objectsInGroup)
    for (let i = 0; i < objectsInGroup.length; i++) {
      let testPiece = objectsInGroup[i].piece
      this.setPieceCoords(movingObject.piece, movingObject.left, movingObject.top);
      sideToJoinTo = this.getSideToJoinTo(movingObject.piece, testPiece);
      isJoined = Utils.HasValue(sideToJoinTo);

      if (isJoined) {
        this.jumpMovingObjectToJoinPosition(sideToJoinTo, testPiece, movingObject);
        console.log('add')
        testGroup.addWithUpdate(movingObject);
        let objectsInGroup2: any[] = [];
        objectsInGroup2 = this.getAllCanvasObjectsInGroup(testGroup, objectsInGroup2);
        console.log('objectsInGroup2')
        console.log(objectsInGroup2)
        // let testObjects = testGroup.getObjects();
        // testGroup._restoreObjectsState();
        // this.canvas.remove(testGroup);

        // testObjects.push(movingObject);
        // this.createNewGroup(testObjects);
        // this.removeObjectsFromCanvas(testObjects);
        // this.canvas.renderAll();
        break;
      }
    }
    return isJoined;
  }

  public CheckAndJoinPieceToPiece(movingObject: any, testObject: any): boolean {
    const testPiece = testObject.piece;
    this.setPieceCoords(movingObject.piece, movingObject.left, movingObject.top);
    const sideToJoinTo = this.getSideToJoinTo(movingObject.piece, testObject.piece);

    if (Utils.HasValue(sideToJoinTo)) {
      this.jumpMovingObjectToJoinPosition(sideToJoinTo, testPiece, movingObject);
      this.createNewGroup([movingObject, testObject]);
      this.removeObjectsFromCanvas([movingObject, testObject]);
      this.canvas.renderAll();
      return true;
    }
    return false;
  }

  public getAllPiecesInGroup(group: any, pieces: JigsawPiece[]): JigsawPiece[] {
    for (let i = 0; i < group._objects.length; i++) {
      let obj = group._objects[i];
      if (Utils.HasValue(obj._objects)) {
        this.getAllPiecesInGroup(obj._objects, pieces);
      }
      else {
        pieces.push(group._objects[i]);
      }
    }
    return pieces;
  }

  public getAllCanvasObjectsInGroup(group: any, canvasObjects: any[]): any[] {
    for (let i = 0; i < group._objects.length; i++) {
      let obj = group._objects[i];
      if (Utils.HasValue(obj._objects)) {
        this.getAllPiecesInGroup(obj._objects, canvasObjects);
      }
      else {
        canvasObjects.push(group._objects[i]);
      }
    }
    return canvasObjects;
  }

  public jumpMovingObjectToJoinPosition(sideToJoinTo: number, testPiece: JigsawPiece, movingObject: any) {
    if (movingObject.piece.id === testPiece.id) {
      return;
    }
    switch (sideToJoinTo) {
      case LEFT: {
        this.joinToLeftSide(movingObject.piece, testPiece, movingObject);
        return;
      }
      case RIGHT: {
        this.joinToRightSide(movingObject.piece, testPiece, movingObject);
        return;
      }
      case BOTTOM: {
        this.joinToBottomSide(movingObject.piece, testPiece, movingObject);
        return;
      }
      case TOP: {
        this.joinToTopSide(movingObject.piece, testPiece, movingObject);
        return;
      }
    }
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

  public getSideToJoinTo(piece: JigsawPiece, testPiece: JigsawPiece): number {
    if (piece.id === testPiece.id) {
      return;
    }
    if (piece.id === testPiece.joiningPieces[LEFT]
      && piece.right >= testPiece.left
      && piece.right <= testPiece.centre
      && (piece.top <= testPiece.bottom
        && piece.bottom >= testPiece.top)) {
      return LEFT;
    }
    if (piece.id === testPiece.joiningPieces[RIGHT]
      && piece.left <= testPiece.right
      && piece.left >= testPiece.centre
      && (piece.top <= testPiece.bottom
        && piece.bottom >= testPiece.top)) {
      return RIGHT;
    }
    if (piece.id === testPiece.joiningPieces[TOP]
      && piece.bottom >= testPiece.top
      && piece.bottom <= testPiece.middle
      && (piece.left <= testPiece.right
        && piece.right >= testPiece.left)) {
      return TOP;
    }
    if (piece.id === testPiece.joiningPieces[BOTTOM]
      && piece.top >= testPiece.middle
      && piece.top <= testPiece.bottom
      && (piece.left <= testPiece.right
        && piece.right >= testPiece.left)) {
      return BOTTOM;
    }

    return null;
  }

  public removeObjectsFromCanvas(objectsToRemove: any[]) {
    for (let i = 0; i < objectsToRemove.length; i++) {
      this.canvas.remove(objectsToRemove[i]);
    }
  }

  public addObjectsToCanvas(objectsToAdd: any[]) {
    for (let i = 0; i < objectsToAdd.length; i++) {
      this.canvas.add(objectsToAdd[i]);
    }
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

  public DisplaySide(side: number) {
    let s: string = 'none'
    if (side === RIGHT) { s = 'right'; }
    if (side === LEFT) { s = 'left'; }
    if (side === BOTTOM) { s = 'bottom'; }
    if (side === TOP) { s = 'top'; }
    console.log(s);
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