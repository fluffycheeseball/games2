import { ROW, COLUMN, BOTTOM, RIGHT, TOP, LEFT, CENTRE, MIDDLE } from './../constants';
import { Utils } from './../../Utils/utils';
import { JigsawPuzzle, JigsawPiece } from './dtos';
import { JigsawService, JigsawCanvasService } from './../../services/';
import { Piece } from './../decoder/dtos/piece';
import { Component, OnInit, HostListener, group , ViewChild, ElementRef} from '@angular/core';
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

  public iconSetDirectory = 'jigsaw';

  constructor(private jigsawSvce: JigsawService,  private canvasService: JigsawCanvasService  ) {
  }

  public addImages() {
    this.canvasService.createCanvasPieces(this.jigsawSvce.jigsaw);
   }

  resetSource() {
    const basePath = 'assets/images/' + this.iconSetDirectory;
    const settingsFilePath = basePath + '/puzzle.json';
    this.jigsawSvce.getJigsawPuzzleSettingsFromFile(settingsFilePath).subscribe(
      res => {
        this.jigsawSvce.SetJigsaw(res);
        this.canvasService.setPieces(this.jigsawSvce.getPieces(basePath));
        this.canvasService.CreateCustomPath();
      }
    );
  }

  ngOnInit() {
    this.resetSource();
    this.canvasService.setUpCanvas();
  }



}
