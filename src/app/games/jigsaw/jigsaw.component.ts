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
      
      
      function   joinToRightSide(ePiece : JigsawPiece, testPiece: JigsawPiece, canvasObject: any) { // <-- inner function
        console.log('j join ' + ePiece.id + ' to right of ' + testPiece.id);
        options.target.setLeft(canvasObject.left + canvasObject.width - 27 - 1);
        options.target.setTop(canvasObject.top + testPiece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
        options.target.setCoords();
        console.log('test'); // <-- use variables from outer scope
      }

      function   joinToLeftSide(ePiece: JigsawPiece, testPiece: JigsawPiece, canvasObject: any) { // <-- inner function
        console.log('j join ' + ePiece.id + ' to left of ' + testPiece.id);
        options.target.setLeft(canvasObject.left - options.target.width + 27 + 1);
        options.target.setTop(canvasObject.top + testPiece.sideAllowance[TOP] - ePiece.sideAllowance[TOP]);
        options.target.setCoords();
      }
      function   joinToTopSide(ePiece : JigsawPiece, testPiece: JigsawPiece, canvasObject: any) { // <-- inner function
        console.log('j join ' + ePiece.id + ' to top of ' + testPiece.id);
        options.target.setTop(canvasObject.top - options.target.height + 27 + 1);
        options.target.setLeft(canvasObject.left + testPiece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
        options.target.setCoords();
      }
      function   joinToBottomSide(ePiece : JigsawPiece, testPiece: JigsawPiece, canvasObject: any) { // <-- inner function
        console.log('j join ' + ePiece.id + ' to bottom of ' + testPiece.id);
        options.target.setTop(canvasObject.top + canvasObject.height - 27 - 1);
        options.target.setLeft(canvasObject.left + testPiece.sideAllowance[LEFT] - ePiece.sideAllowance[LEFT]);
        options.target.setCoords();
      }    
      // this has to be in line - the javascript lib

      // check if we need to joint to another piece
      if (!Utils.IsNullOrUndefined(options.target) && !Utils.IsNullOrUndefined(options.target.grpieceidRow)) {

        const piece = options.target.grpieceidRow;
        const canvas = options.target.canvas;

        const yOff = options.e.clientY - canvas._offset.top;
        const xOff = options.e.clientX - canvas._offset.left;
        const pointInSvgPolygon = require('point-in-svg-polygon');

        // is the right side of the target piece within 20 pixels of the left side of its matching piece 
        const pieceRight = options.target.left + options.target.width;
        const pieceBottom = options.target.top + options.target.height;
       
        for (let i = 0; i < options.target.canvas._objects.length; i++) {
          
          console.log('is group? ' + canvas._objects[i]._objects) ;
          if ( canvas._objects[i]._objects !== undefined && canvas._objects[i]._objects !== null) {
            for (let j = 0; j < canvas._objects[i]._objects.length; j++) {
              
              console.log('child: ' + canvas._objects[i]._objects[j].grpieceidRow.id);
            }
          }

          
          const testPiece = options.target.canvas._objects[i].grpieceidRow;
          if (testPiece === undefined) {
            continue;
          }
          let isJoined = false;
          let result = canvas._objects[i].containsPoint(new fabric.Point(pieceRight, yOff));
          if (result === true && piece.joiningPieces[RIGHT] === testPiece.id) {
            joinToLeftSide(piece, testPiece, canvas._objects[i]);
            isJoined = true;
          }

          result = canvas._objects[i].containsPoint(new fabric.Point(options.target.left, yOff));
          if (result === true && piece.joiningPieces[LEFT] === testPiece.id) {
            joinToRightSide(piece, testPiece, canvas._objects[i]);
            isJoined = true;
          }

          result = canvas._objects[i].containsPoint(new fabric.Point(xOff, options.target.top));
          if (result === true && piece.joiningPieces[TOP] === testPiece.id) {
            joinToBottomSide(piece, testPiece, canvas._objects[i]);
            isJoined = true;
          }

          result = canvas._objects[i].containsPoint(new fabric.Point(xOff, pieceBottom));
          if (result === true && piece.joiningPieces[BOTTOM] === testPiece.id) {
            joinToTopSide(piece, testPiece, canvas._objects[i]);
            isJoined = true;
          }

          if (isJoined) {
            const group = new fabric.Group([canvas._objects[i], options.target], {});
            canvas.add(group);
            canvas.remove(options.target.canvas._objects[i]);
            canvas.remove(options.target);
            break;
          }
        }
      }
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
