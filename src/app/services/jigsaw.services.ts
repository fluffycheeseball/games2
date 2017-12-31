import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { JigsawPuzzle } from '../games/jigsaw/dtos/jigsaw-puzzle';


@Injectable()
export class JigsawService {

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
}

