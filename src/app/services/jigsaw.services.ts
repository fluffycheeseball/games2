import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { JigsawPuzzle } from '../games/jigsaw/dtos/jigsaw-puzzle';


@Injectable()
export class JigsawService {

    constructor(private http: Http) {

    }

    public getJigsawPuzzleSettingsFromFile(filepath: string): Observable<JigsawPuzzle> {
        return this.http.get(filepath).map(res => res.json());
    }
}

