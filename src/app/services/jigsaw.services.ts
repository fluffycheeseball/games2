import { JigsawPuzzle } from './../games/jigsaw/dtos/jigsaw-puzzle';
import { Utils } from './../Utils/utils';
import { JigsawPiece } from './../games/jigsaw/dtos/jigsawpiece';
import { ROW, TOP, LEFT, COLUMN, BOTTOM, RIGHT } from './../games/constants';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class JigsawService {

    public canvasWidth: number;
    public canvasHeight: number;

    public jigsaw: JigsawPuzzle = new JigsawPuzzle();

    public shapeUpXLTR = [35, 2, 3, -2, -18, 30, 30, -18, -2, 3, 2, 35];
    public shapeUpYLTR = [15, -10, -5, -5, -15, 0, 0, 15, 5, 5, 10, -15];

    public shapeDownXRTL = [-35, -2, -3, 2, 18, -30, -30, 18, 2, -3, -2, -35];
    public shapeDownYRTL = [-15, 10, 5, 5, 15, 0, 0, -15, -5, -5, -10, 15];

    public shapeDownXLTR = [35, 2, 3, -2, -18, 30, 30, -18, -2, 3, 2, 35];
    public shapeDownYLTR = [-15, 10, 5, 5, 15, 0, 0, -15, -5, -5, -10, 15];

    public shapeUpXRTL = [-35, -2, -3, 2, 18, -30, -30, 18, 2, -3, -2, -35];
    public shapeUpYRTL = [15, -10, -5, -5, -15, 0, 0, 15, 5, 5, 10, -15];

    public shapeLeftXUpwards = [15, -10, -5, -5, -15, 0, 0, 15, 5, 5, 10, -15];
    public shapeLeftYUpwards = [-35, -2, -3, 2, 18, -30, -30, 18, 2, -3, -2, -35];
    public shapeLeftXDownwards = [-15, 10, 5, 5, 15, 0, 0, -15, -5, -5, -10, 15];
    public shapeLeftYDownwards = [35, 2, 3, -2, -18, 30, 30, -18, -2, 3, 2, 35];

    public shapeRightXUpwards = [-15, 10, 5, 5, 15, 0, 0, -15, -5, -5, -10, 15];
    public shapeRightYUpwards = [-35, -2, -3, 2, 18, -30, -30, 18, 2, -3, -2, -35];
    public shapeRightXDownwards = [15, -10, -5, -5, -15, 0, 0, 15, 5, 5, 10, -15];
    public shapeRightYDownwards = [35, 2, 3, -2, -18, 30, 30, -18, -2, 3, 2, 35];


    constructor(private http: Http) {
    }

    public getJigsawPuzzleSettingsFromFile(filepath: string): Observable<JigsawPuzzle> {
        return this.http.get(filepath).map(res => res.json());
    }

    public SetJigsaw(res: JigsawPuzzle) {
        this.jigsaw = res;
        this.setNodules();
    }

    public SetCanvasDimensions(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    public getPieces(basePath: string): JigsawPiece[] {
        const pieces: JigsawPiece[] = [];
        const spacer = 0;
        let i = 0;
        for (let row = 0; row < this.jigsaw.puzzleHeight; ++row) {
            for (let col = 0; col < this.jigsaw.puzzleWidth; ++col) {

                const id = 'img' + ('000' + col).slice(-3) + '_' + ('000' + row).slice(-3);
                const piece: JigsawPiece = {
                    id: i++,
                    topleft: undefined,
                    pattern: undefined,
                    tlCorner: undefined,
                    GridPosition: [row, col],
                    joiningPieces: [null, null, null, null]
                };
                piece.joiningPieces = this.GetIdsOfJoiningPieces(row, col, piece.id);
                const sideProfiles = this.getSideProfiles(piece.GridPosition);
                piece.topleft = this.getTopLeft(sideProfiles, piece.GridPosition);
                piece.pattern = this.getPath(row, col, sideProfiles);
                const intialX = (col * (this.jigsaw.pieceWidth + spacer)) + 0;
                const initialY = (row * (this.jigsaw.pieceHeight + spacer)) + 0;
                piece.tlCorner = [intialX, initialY];
                pieces.push(piece);
            }
        }
        return pieces;
    }

    public GetIdsOfJoiningPieces(row: number, col: number, id: number): number[] {
        const joiningIds = [null, null, null, null];

        if (row > 0) {
            joiningIds[TOP] = ((row - 1) * this.jigsaw.puzzleWidth) + col;
        }
        if (row < this.jigsaw.puzzleHeight - 1) {
            joiningIds[BOTTOM] = ((row + 1) * this.jigsaw.puzzleWidth) + col;
        }

        if (col > 0) {
            joiningIds[LEFT] = id - 1;

        }
        if (col < this.jigsaw.puzzleHeight - 1) {
            joiningIds[RIGHT] = id + 1;
        }
        //console.log('this id: ' + id + ' top: ' + joiningIds[TOP] + ' bottom: ' + joiningIds[BOTTOM] +' left: ' + joiningIds[LEFT] +' right: ' + joiningIds[RIGHT]);
        return joiningIds;
    }

    public getTopLeft(sideProfiles: string[], gridPosition: number[]): number[] {

        const topLeft = [0, 0];
        switch (sideProfiles[TOP]) {
            case 'up': {
                topLeft[ROW] = (gridPosition[ROW] * -100) + 19;
                break;
            }
            case 'down': {
                topLeft[ROW] = (gridPosition[ROW] * -100) + 8;
                break;
            }
        }
        switch (sideProfiles[LEFT]) {
            case 'left': {
                topLeft[COLUMN] = (gridPosition[COLUMN] * -100) + 19;
                break;
            }
            case 'right': {
                topLeft[COLUMN] = (gridPosition[COLUMN] * -100) + 8;
                break;
            }
        }
        return topLeft;
    }

    public getSidePath(side: string, offsetX: number, offsetY: number, sideShape: string): string {
        if (sideShape === 'straight') {
            return this.GetStraightSidePath(side);
        }
        if (sideShape === undefined) {
            console.log('Error: undefined side shape');
        }
        let coords: number[];
        coords = this.getPathCoords( offsetX, offsetY, side, sideShape);
        return this.coordsToString(coords);
    }

    public GetStraightSidePath(side: string): string {
        if (side === 'top') {
            return ' h ' + this.jigsaw.pieceWidth;
        }
        if (side === 'bottom') {
            return ' h ' + '-' + this.jigsaw.pieceWidth;
        }
        if (side === 'right') {
            return ' v ' + this.jigsaw.pieceHeight;
        }
        if (side === 'left') {
            return ' v ' + '-' + this.jigsaw.pieceHeight;
        }
        console.log('Error: invalid side: ' + side);
        return '';
    }

    public getPathCoords(offsetX: number, offsetY: number, side: string, sideShape: string): number[] {

        let curvePointsX: number[] = [];
        let curvePointsY: number[] = [];
        switch (side) {
            case 'top': {
                curvePointsX = this.shapeDownXLTR;
                curvePointsY = this.shapeDownYLTR;
                if (sideShape === 'up') {
                    curvePointsX = this.shapeUpXLTR;
                    curvePointsY = this.shapeUpYLTR;
                }
                break;
            }
            case 'bottom': {
                offsetX += this.jigsaw.pieceWidth;
                offsetY += this.jigsaw.pieceHeight;
                curvePointsX = this.shapeDownXRTL;
                curvePointsY = this.shapeDownYRTL;
                if (sideShape === 'up') {
                    curvePointsX = this.shapeUpXRTL;
                    curvePointsY = this.shapeUpYRTL;
                }
                break;
            }
            case 'right': {
                offsetX +=  this.jigsaw.pieceWidth;
                curvePointsX = this.shapeRightXDownwards;
                curvePointsY = this.shapeRightYDownwards;
                if (sideShape === 'right') {
                    curvePointsX = this.shapeLeftXDownwards;
                    curvePointsY = this.shapeLeftYDownwards;
                }
                break;
            }
            case 'left': {
                offsetY += this.jigsaw.pieceHeight;
                curvePointsX = this.shapeRightXUpwards;
                curvePointsY = this.shapeRightYUpwards;
                if (sideShape === 'left') {
                    curvePointsX = this.shapeLeftXUpwards;
                    curvePointsY = this.shapeLeftYUpwards;
                }
                break;
            }
        }
        const p: number[] = new Array();
        p.push(offsetX);
        p.push(offsetY);
        for (let k = 0; k < 12; k++) {
            offsetX += curvePointsX[k];
            offsetY += curvePointsY[k];
            p.push(offsetX);
            p.push(offsetY);
            if (k > 0 && (k < 11) && (k + 1) % 2 === 0) {
                p.push(offsetX);
                p.push(offsetY);
            }
        }
        return p;
    }

    public coordsToString(coords: number[]) {
        let str = '';

        for (let i = 0; i < coords.length; i++) {
            if (i % 6 === 0) {
                str = str + ' C ';
            } else {
                str = str + ',';
            }
            str = str + (coords[i]).toString();
        }

        return str;

    }

    public getPath(row: number, col: number, sideProfiles: string[]): string {
        const spacer = 0;
        const offsetX = Utils.GetRandomIntInRange(0,500);//'//' (col * (this.jigsaw.pieceWidth + spacer));
        const offsetY = Utils.GetRandomIntInRange(0,500);//(row * (this.jigsaw.pieceHeight + spacer));
        let path = 'M ' + Utils.padLeft(offsetX, 4) + ' ' + Utils.padLeft(offsetY, 4);
        path = path + this.getSidePath('top', offsetX, offsetY, sideProfiles[TOP]);
        path = path + this.getSidePath('right', offsetX, offsetY, sideProfiles[RIGHT]);
        path = path + this.getSidePath('bottom', offsetX, offsetY, sideProfiles[BOTTOM]);
        path = path + this.getSidePath('left', offsetX, offsetY, sideProfiles[LEFT]);
        return path + ' z';
    }

    public getSideProfiles(gridPosition: number[]): string[] {
        const sideProfiles = ['', '', '', ''];
        sideProfiles[TOP] = this.getSideShape('top', gridPosition[ROW], gridPosition[COLUMN]);
        sideProfiles[BOTTOM] = this.getSideShape('bottom', gridPosition[ROW], gridPosition[COLUMN]);
        sideProfiles[LEFT] = this.getSideShape('left', gridPosition[ROW], gridPosition[COLUMN]);
        sideProfiles[RIGHT] = this.getSideShape('right', gridPosition[ROW], gridPosition[COLUMN]);
        return sideProfiles;
    }
    public setNodules() {
        this.jigsaw.horizontals = new Array();
        this.jigsaw.verticals = new Array();

        const numVerticalJoins = (this.jigsaw.puzzleWidth - 1) * this.jigsaw.puzzleHeight;
        for (let col = 0; col < numVerticalJoins; col++) {
            const noduleType = Utils.getRandomBoolean() === true ? 'left' : 'right';
            this.jigsaw.verticals.push(noduleType);
        }
        const numHorizontalJoins = (this.jigsaw.puzzleHeight - 1) * this.jigsaw.puzzleWidth;
        for (let row = 0; row < numHorizontalJoins; row++) {
            const noduleType = Utils.getRandomBoolean() === true ? 'up' : 'down';
            this.jigsaw.horizontals.push(noduleType);
        }
    }

    public getSideShape(side: string, row: number, col: number): string {
        switch (side) {
            case 'top':
                {
                    if (row === 0) {
                        return 'straight';
                    }
                    return this.jigsaw.horizontals[((row - 1) * this.jigsaw.puzzleHeight) + col];
                }
            case 'left':
                {
                    if (col === 0) { return 'straight'; }
                    return this.jigsaw.verticals[((col - 1) * this.jigsaw.puzzleWidth) + row];
                }
            case 'right':
                {
                    if (col === this.jigsaw.puzzleWidth - 1) { return 'straight'; }
                    return this.jigsaw.verticals[(col * this.jigsaw.puzzleWidth) + row];
                }
            case 'bottom':
                {
                    if (row === this.jigsaw.puzzleHeight - 1) { return 'straight'; }
                    return this.jigsaw.horizontals[(row * this.jigsaw.puzzleHeight) + col];
                }
            default:
                {
                    console.log('Error: invalid side: ' + side);
                }
        }
    }
}

