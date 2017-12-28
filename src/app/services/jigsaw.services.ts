import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { JigsawPuzzle } from '../games/jigsaw/dtos/jigsaw-puzzle';


@Injectable()
export class JigsawService {

    public middlePiece = [
        // top
        0, 0, 35, 15, 37, 5,
        37, 5, 40, 0, 38, -5,
        38, -5, 20, -20, 50, -20,
        50, -20, 80, -20, 62, -5,
        62, -5, 60, 0, 63, 5,
        63, 5, 65, 15, 100, 0,

        // right
        100, 0, 85, 35, 95, 37,
        95, 37, 100, 40, 105, 38,
        105, 38, 120, 20, 120, 50,
        120, 50, 120, 80, 105, 62,
        105, 62, 100, 60, 95, 63,
        95, 63, 85, 65, 100, 100,

        // bottom
        100, 100, 65, 85, 63, 95,
        63, 95, 60, 100, 62, 105,
        62, 105, 80, 120, 50, 120,
        50, 120, 20, 120, 38, 105,
        38, 105, 40, 100, 37, 95,
        37, 95, 35, 85, 0, 100,

        // left
        0, 100, 15, 65, 5, 63,
        5, 63, 0, 60, -5, 62,
        -5, 62, -20, 80, -20, 50,
        -20, 50, -20, 20, -5, 38,
        -5, 38, 0, 40, 5, 37,
        5, 37, 15, 35, 0, 0
    ];

    constructor(private http: Http) {
    }

    public getJigsawPuzzleSettingsFromFile(filepath: string): Observable<JigsawPuzzle> {
        return this.http.get(filepath).map(res => res.json());
    }
}

