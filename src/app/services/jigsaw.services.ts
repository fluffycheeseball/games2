import { Utils } from './../Utils/utils';
import { JigsawPiece } from './../games/jigsaw/dtos/jigsawpiece';
import { ROW, TOP, LEFT, COLUMN, BOTTOM, RIGHT } from './../games/constants';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { JigsawPuzzle } from '../games/jigsaw/dtos/jigsaw-puzzle';


@Injectable()
export class JigsawService {
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

    public getPieces(basePath: string): JigsawPiece[] {
        const pieces: JigsawPiece[] = [];
        const spacer = 0;

        for (let row = 0; row < this.jigsaw.puzzleHeight; ++row) {
            for (let col = 0; col < this.jigsaw.puzzleWidth; ++col) {
                const intialX = (col * (this.jigsaw.pieceWidth + spacer)) + 0;
                const initialY = (row * (this.jigsaw.pieceHeight + spacer)) + 0;
                const id = 'img' + ('000' + col).slice(-3) + '_' + ('000' + row).slice(-3);
                const piece: JigsawPiece = {
                    id: id,
                    filePath: null,
                    topleft: undefined,
                    pattern: undefined,
                    tlCorner:undefined,
                    GridPosition: [row, col]
                };
                const sideProfiles = this.getSideProfiles(piece.GridPosition);
                piece.topleft = this.getTopLeft(sideProfiles, piece.GridPosition);
                piece.pattern = this.getPath(row, col, intialX, initialY, sideProfiles);
                piece.tlCorner = [intialX, initialY];
                pieces.push(piece);
            }
        }
        return pieces;
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

    public getSidePath(side: string, left: number, top: number, sideShape: string): string {
        if (sideShape === 'straight') {
            return this.GetStraightSidePath(side, left, top);
        }
        if (sideShape === undefined) {
            console.log('Error: undefined side shape');
        }
        const right = left + this.jigsaw.pieceWidth;
        const bottom = top + this.jigsaw.pieceHeight;
        let coords: number[];
        switch (side) {
            case 'top': {
                coords = sideShape === 'up' ?
                    this.getPathCoords(this.shapeUpXLTR, this.shapeUpYLTR, left, top) :
                    this.getPathCoords(this.shapeDownXLTR, this.shapeDownYLTR, left, top);
                break;
            }
            case 'bottom': {
                coords = sideShape === 'up' ?
                    this.getPathCoords(this.shapeUpXRTL, this.shapeUpYRTL, right, bottom) :
                    this.getPathCoords(this.shapeDownXRTL, this.shapeDownYRTL, right, bottom);
                break;
            }
            case 'right': {
                coords = sideShape === 'right' ?
                    this.getPathCoords(this.shapeLeftXDownwards, this.shapeLeftYDownwards, right, top) :
                    this.getPathCoords(this.shapeRightXDownwards, this.shapeRightYDownwards, right, top);
                break;
            }
            case 'left': {

                coords = sideShape === 'left' ?
                    this.getPathCoords(this.shapeLeftXUpwards, this.shapeLeftYUpwards, left, bottom) :
                    this.getPathCoords(this.shapeRightXUpwards, this.shapeRightYUpwards, left, bottom);
                break;
            }
        }

        return this.coordsToString(coords);
    }

    public GetStraightSidePath(side: string, left: number, top: number): string {
        const right = left + this.jigsaw.pieceWidth;
        const bottom = top + this.jigsaw.pieceHeight;
        if (side === 'top') {
            return ' L ' + right + ' ' + top;
        }
        if (side === 'bottom') {
            return ' L ' + left + ' ' + bottom;
        }
        if (side === 'right') {
            return ' L ' + right + ' ' + bottom;
        }
        if (side === 'left') {
            return ' L ' + left + ' ' + top;
        }
        console.log('Error: invalid side: ' + side);
        return '';
    }

    public getPathCoords(offsetsX: number[], offsetsY: number[], lastX: number, lastY: number): number[] {
        const p: number[] = new Array();
        p.push(lastX);
        p.push(lastY);
        for (let k = 0; k < 12; k++) {
            lastX = lastX + offsetsX[k];
            p.push(lastX);
            lastY = lastY + offsetsY[k];
            p.push(lastY);
            if (k > 0 && (k < 11) && (k + 1) % 2 === 0) {
                p.push(lastX);
                p.push(lastY);
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

    public getPath(row: number, col: number, left: number, top: number, sideProfiles: string[]): string {
        let path = 'M ' + Utils.padLeft(left, 4) + ' ' + Utils.padLeft(top, 4);
        path = path + this.getSidePath('top', left, top, sideProfiles[TOP]);
        path = path + this.getSidePath('right', left, top, sideProfiles[RIGHT]);
        path = path + this.getSidePath('bottom', left, top, sideProfiles[BOTTOM]);
        path = path + this.getSidePath('left', left, top, sideProfiles[LEFT]);
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

