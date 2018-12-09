import { TestBed, async, ComponentFixture } from '@angular/core/testing';

import { DecoderComponent } from './decoder.component';
import { ArrayUtils } from '../../Utils';
import { Guess, IGuess } from './dtos';
import { LogService } from '../../logging/services/log.service';

describe('DecoderComponent', () => {

  let component: DecoderComponent;
  let fixture: ComponentFixture<DecoderComponent>;

  const logServiceStub = <LogService>{
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DecoderComponent
      ],
      providers: [
        LogService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecoderComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });


  it('should create the component', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should not have duplicates in solution', async(() => {
    component.GenerateSolution();
    fixture.detectChanges();
    const oldLength = component.solution.length;
    component.solution = ArrayUtils.RemoveDuplicates(component.solution);
    expect(component.solution.length).toEqual(oldLength);
  }));

  xit('should update guess as expected', async(() => {
    component.guess = new Guess(4);
    component.guess.srcIndexes[0] = 1;
    component.guess.srcIndexes[2] = 1;
    component.guess.srcIndexes[3] = 1;
    component.guess.srcIndexes[4] = 1;

    component.checkGuess();
    fixture.detectChanges();
    const oldLength = component.solution.length;
    component.solution = ArrayUtils.RemoveDuplicates(component.solution);
    expect(component.solution.length).toEqual(oldLength);
  }));

});
