import { JigsawPuzzle } from './dtos/jigsaw-puzzle';
import { JigsawService } from './../../services/jigsaw.services';
import { Observable } from 'rxjs/Observable';
import { JigsawComponent } from './jigsaw.component';
import { TestBed, async } from '@angular/core/testing';
import 'rxjs/add/observable/of';

const jigsawPuzzle: JigsawPuzzle = new JigsawPuzzle();

class JigsawServiceStub {
  public getJigsawPuzzleSettingsFromFile(path: string): Observable<JigsawPuzzle> {
    return Observable.of(jigsawPuzzle);
  }
}

let fixture;
describe('JigsawComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        JigsawComponent
      ],
      providers: [{provide: JigsawService, useClass: JigsawServiceStub}],
    }).compileComponents();

    fixture = TestBed.overrideComponent(JigsawComponent, {
      set: {
        template: '<span></span>'
      }})
      .createComponent(JigsawComponent);
  }));

  it('should create the component', async(() => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
