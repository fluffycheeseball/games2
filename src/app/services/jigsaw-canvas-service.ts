import { Injectable } from "@angular/core";
import { Utils } from "../Utils/utils";

import 'fabric';
import { Canvas } from 'fabric/fabric-impl';
import { LEFT, TOP, COLUMN, ROW, BOTTOM, RIGHT } from "../games/constants";
import { JigsawPiece, JigsawPuzzle } from "../games/jigsaw/dtos";
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
    }
    public createCanvasPieces(jigsaw:JigsawPuzzle) {
      const total = jigsaw.puzzleWidth * jigsaw.puzzleHeight;
      for (let r = 0; r < total; r++) {
        let mypath = this.getPath(this.pieces[r], jigsaw);
        this.setPieceDimensions(mypath.piece,jigsaw, mypath.top, mypath.left );
      }
      this.canvas.set({ pieces: this.pieces, jigsawPuzzle: jigsaw });
    }

    public setPieces(pieces: JigsawPiece[]) 
    {
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

    public getPath(piece: JigsawPiece, jigsaw:JigsawPuzzle):any {
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
        });
        return mypath;
    }

    public setUpCanvas() {
      if(Utils.HasValue(this.canvas)) {
        this.removeAll();
      }
      this.canvas = new fabric.Canvas('canvas', {
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor: 'red',
        backgroundColor: 'rgb(200,100,200)',
        selectionLineWidth: 0
      });
      this.setCanvasSize();
      this.canvas.on('mouse:up', (options) => {
        this.canvasOnMouseUp(options);
      });
    }

    public canvasOnMouseUp(options:any) {
      let movingObject: any;
      let movingGroup: any;
      let canvas: any;
      let isJoined = false;
      let piece: JigsawPiece;
      let testObject: any;
  
      if (Utils.IsNullOrUndefined(options.target)) {
        return;
      }
      if (this.movingAGroup(options)) {
        movingGroup = options.target;
        canvas = movingGroup.canvas;
        for (let k = 0; k < movingGroup._objects.length; k++) {
          movingObject = movingGroup._objects[k];
          piece = movingObject.piece;
          this.setPieceCoords(piece,
            (movingObject.left + (movingGroup.width / 2) + movingGroup.left),
            (movingObject.top + (movingGroup.height / 2) + movingGroup.top));
          for (let i = 0; i < canvas._objects.length; i++) {
            const testGroup = canvas._objects[i];
            let testPiece: JigsawPiece;
  
            if (this.testGroupIsAlsoMovingGroup(movingGroup, testGroup)) {
              continue;
            }
            if (this.isAGroup(testGroup)) {
              for (let j = 0; j < testGroup._objects.length; j++) {
                testPiece = testGroup._objects[j].piece;
                const sideToJoinTo = this.getSideToJoinTo(piece, testPiece);
                if (!Utils.IsNullOrUndefined(sideToJoinTo)) {
                  const topLeftOffsets = this.getTopLeftOffset(sideToJoinTo, piece, testPiece);
                  this.joinTwoGroups( movingGroup, testGroup, topLeftOffsets);
                  isJoined = true;
                  break;
                }
              }
            } else {
              testObject = canvas._objects[i];
              testPiece = testObject.piece;
              const sideToJoinTo = this.checkConnections2(testObject, piece, testPiece);
              if (!Utils.IsNullOrUndefined(sideToJoinTo)) {
                let topLeftOffsets = this.getTopLeftOffset(sideToJoinTo, piece, testObject.piece)
                this.joinGroupToAPiece( movingGroup, testObject, topLeftOffsets); {
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
      }
      if (this.movingAPiece(options)) {
        movingObject = options.target;
        piece = movingObject.piece;
        canvas = movingObject.canvas;
        this.setPieceCoords(piece, movingObject.left, movingObject.top);
        for (let i = 0; i < canvas._objects.length; i++) {
          const testGroup = canvas._objects[i];
          if (this.isAGroup(testGroup)) {
            for (let j = 0; j < testGroup._objects.length; j++) {
              testObject = testGroup._objects[j];
              const testPiece = testGroup._objects[j].piece;
              const testRect = this.getTestRectangle(testPiece);
              canvas.add(testRect);
              isJoined = this.checkConnections(testRect, piece, testPiece, movingObject);
              canvas.remove(testRect);
              if (isJoined) {
                this.setPieceCoords(piece, movingObject.left, movingObject.top);
                this.pieceJoinedToGroupCanvasUpdate(testGroup, movingObject);
                break;
              }
            }
          } else {  // test piece is not in a group
            testObject = canvas._objects[i];
            const testPiece = testObject.piece;
            isJoined = this.checkConnections(testObject, piece, testPiece, movingObject);
            if (isJoined) {
              movingObject.setCoords();
              this.setPieceCoords(piece, movingObject.left, movingObject.top);
              this.pieceJoinedToPieceCanvsUpdate(movingObject, testObject);
              break;
            }
          }
        }
      }
    }

    public movingAGroup(options:any): boolean {
        return !Utils.IsNullOrUndefined(options.target._objects) && options.target._objects.length > 0;
      }

      public getTestRectangle(piece: JigsawPiece): fabric.Rect {
        const testRect = new fabric.Rect({
          width: piece.width, height: piece.height,
          left: piece.left, top: piece.top
        });
        return testRect;
      }

      public checkConnections(testRect: fabric.Rect, piece: JigsawPiece, 
        testPiece: JigsawPiece, movingObject:any):boolean {
        if (piece.id === testPiece.id) {
          return false;
        }
        if (this.isOverLeftSide(testRect, piece, testPiece)) {
          this.joinToLeftSide(piece, testPiece,movingObject);
          return true;
        }
        if (this.isOverRightSide(testRect, piece, testPiece)) {
          this.joinToRightSide(piece, testPiece,movingObject);
          return true;
        }
        if (this.isOverBottomSide(testRect, piece, testPiece)) {
          this.joinToBottomSide(piece, testPiece,movingObject);
          return true;
        }
        if (this.isOverTopSide(testRect, piece, testPiece)) {
          this.joinToTopSide(piece, testPiece,movingObject);
          return true;
        }
        return false;
      }

      
  public joinToRightSide(piece: JigsawPiece, testPiece: JigsawPiece, movingObjet:any) {
    movingObjet.setLeft(testPiece.right - testPiece.sideAllowance[RIGHT] - piece.sideAllowance[LEFT]);
    movingObjet.setTop(testPiece.top + testPiece.sideAllowance[TOP] - piece.sideAllowance[TOP]);
  }

  public joinToLeftSide(piece: JigsawPiece, testPiece: JigsawPiece,movingObject:any) {
    movingObject.setLeft(testPiece.left - piece.width + piece.sideAllowance[RIGHT] + testPiece.sideAllowance[LEFT]);
    movingObject.setTop(testPiece.top + testPiece.sideAllowance[TOP] - piece.sideAllowance[TOP]);
  }
  public joinToTopSide(piece: JigsawPiece, testPiece: JigsawPiece,movingObject:any) {
    movingObject.setTop(testPiece.top - piece.height + piece.sideAllowance[BOTTOM] + testPiece.sideAllowance[TOP]);
    movingObject.setLeft(testPiece.left + testPiece.sideAllowance[LEFT] - piece.sideAllowance[LEFT]);
  }
  public joinToBottomSide(piece: JigsawPiece, testPiece: JigsawPiece,movingObj:any) {
    movingObj.setTop(testPiece.bottom - testPiece.sideAllowance[BOTTOM] - piece.sideAllowance[TOP]);
    movingObj.setLeft(testPiece.left + testPiece.sideAllowance[LEFT] - piece.sideAllowance[LEFT]);
  }


      public getSideToJoinTo(piece: JigsawPiece, testPiece: JigsawPiece): number {
        const testRect = this.getTestRectangle(testPiece);
        this.canvas.add(testRect);
        const result = this.checkConnections2(testRect, piece, testPiece);
        this.canvas.remove(testRect);
        return result;
      }

      public checkConnections2(testRect: fabric.Rect, piece: JigsawPiece, testPiece: JigsawPiece): number {
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
    
      public movingAPiece(options:any) {
        return !Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.piece);
      }  
    
      public removeGroup(_group: any) {
        _group.destroy();
        this.canvas.remove(_group);
      }

      public setPieceCoords(piece: JigsawPiece, left: number, top: number) {
        piece.top = top;
        piece.left = left;
        piece.right = piece.left + piece.width;
        piece.bottom = piece.top + piece.height;
        piece.middle = piece.top + (piece.height / 2);
        piece.centre = piece.left + (piece.width / 2);
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
      
      public setPieceDimensions(piece:JigsawPiece, jigsaw:JigsawPuzzle, top:number, left:number) {
        piece.width = jigsaw.pieceWidth + piece.sideAllowance[LEFT] + piece.sideAllowance[RIGHT];
        piece.height = jigsaw.pieceHeight + piece.sideAllowance[TOP] + piece.sideAllowance[BOTTOM];
        this.setPieceCoords(piece, left, top);
      }
    
      public createNewGroup(canvasObjects: any) {
        const newGroup = new fabric.Group(canvasObjects, {});
        newGroup.hasControls = false;
        newGroup.hasBorders = false;
        this.canvas.add(newGroup);
        this.canvas.renderAll();
      }

      public joinTwoGroups(movingGroup: any, testGroup: any, topLeftOffsets: number[]) {
        const movingObjects = movingGroup.getObjects();
        const testObjects = testGroup.getObjects();
        this.removeGroup(movingGroup);
        this.removeGroup(testGroup);
        this.applyOffsetToMovingObjects(movingObjects, topLeftOffsets);
        this.addTestObjectsToMovingObjects(movingObjects, testObjects);
        this.createNewGroup(movingObjects);
      }

      public pieceJoinedToPieceCanvsUpdate( movingObject: any, testObject:any) {
        const newGroup = new fabric.Group([movingObject, testObject], {});
        newGroup.hasControls = false;
        newGroup.hasBorders = false;
        this.canvas.add(newGroup);
    
        this.canvas.remove(movingObject);
        this.canvas.remove(testObject);
      }

      public pieceJoinedToGroupCanvasUpdate(testGroup: any, movingObject: any) {
        movingObject.setCoords();
       const testObjects = testGroup.getObjects();
       this.removeGroup(testGroup);
       this.canvas.remove(movingObject);
       testObjects.push(movingObject);
       for (let m = 0; m < testObjects.length; m++) {
         this.canvas.add(testObjects[m]);
       }
       this.createNewGroup(testObjects);
   
       for (let item = 0; item < testObjects.length; item++) {
         this.canvas.remove(testObjects[item]);
       }
     }

      public joinGroupToAPiece (movingGroup: any, testObject: any, topLeftOffsets:number[]) {
        const movingObjects = movingGroup.getObjects();
        this.removeGroup(movingGroup);
        this.canvas.remove(testObject);
        this.applyOffsetToMovingObjects(movingObjects, topLeftOffsets );
        movingObjects.push(testObject);
        this.createNewGroup(movingObjects);
      }

      public removeAll() {
        for(let i =0 ; i< this.canvas._objects.length; i++) {
          this.canvas.remove(this.canvas._objects[i]);
        }
        this.canvas.renderAll();
      }

      public applyOffsetToMovingObjects(movingObjects, topLeftOffsets: number[]) {
        for (let m = 0; m < movingObjects.length; m++) {
          movingObjects[m].left -= topLeftOffsets[LEFT];
          movingObjects[m].top -= topLeftOffsets[TOP];
          movingObjects[m].setCoords();
        }
      }

      public addTestObjectsToMovingObjects(movingObjects, testObjects) {
        for (let tstItemId = 0; tstItemId < testObjects.length; tstItemId++) {
          movingObjects.push(testObjects[tstItemId]);
        }
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

      public getGroupPieceIds(canvasGroup: any): number[] {
        const groupIds: number[] = [];
        if (Utils.IsNullOrUndefined(canvasGroup._objects)) {
          return groupIds;
        }
    
        for (let i = 0; i < canvasGroup._objects.length; i++) {
          if (Utils.IsNullOrUndefined(canvasGroup._objects[i].piece)) { continue; }
          groupIds.push(canvasGroup._objects[i].piece.id);
        }
        return groupIds;
      }
     
}