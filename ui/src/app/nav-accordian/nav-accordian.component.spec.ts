import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavAccordianComponent } from './nav-accordian.component';

describe('NavAccordianComponent', () => {
  let component: NavAccordianComponent;
  let fixture: ComponentFixture<NavAccordianComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavAccordianComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavAccordianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
