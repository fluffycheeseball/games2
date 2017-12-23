import { JigsawPuzzle } from './../games/decoder/dtos/jigsaw-puzzle';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class JigsawService {

    constructor(private http: Http) {

    }

    public getJigsawPuzzleSettingsFromFile(filepath: string): Observable<JigsawPuzzle> {
        return this.http.get(filepath).map(res => res.json());
    }
}

