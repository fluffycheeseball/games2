import { JigsawPuzzle } from './dtos/jigsaw-puzzle';
import { JigsawService } from './../../services/jigsaw.services';
import { Observable } from 'rxjs/Observable';
import { JigsawComponent } from './jigsaw.component';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import 'rxjs/add/observable/of';
import { JigsawCanvasService } from '../../services';

const jigsawPuzzle: JigsawPuzzle = new JigsawPuzzle();

const JigsawServiceStub = <JigsawService> {

};
const jigsawCanvasServiceStub = <JigsawCanvasService> {

};


let component: JigsawComponent;
let fixture: ComponentFixture<JigsawComponent>;
xdescribe('JigsawComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        JigsawComponent
      ],
      providers: [
        {provide: JigsawService, useValue: JigsawServiceStub},
        {provide: JigsawCanvasService, useValue: jigsawCanvasServiceStub}
      ],
    }).compileComponents();

    fixture = TestBed.overrideComponent(JigsawComponent, {
      set: {
        template: '<span></span>'
      }})
      .createComponent(JigsawComponent);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JigsawComponent);
   component = fixture.debugElement.componentInstance;

   fixture.detectChanges();
  });

  it('should create the component', async(() => {
    expect(component).toBeTruthy();
  }));
});
