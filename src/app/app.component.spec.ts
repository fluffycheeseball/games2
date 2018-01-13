import { NavAccordianComponent } from './nav-accordian/nav-accordian.component';
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

let fixture;
let component, de, element;
describe('AppComponent', () => {
 
// asynchronous block
beforeEach(async(() => {
  TestBed.configureTestingModule({
    declarations: [AppComponent, MockNavAccordianComponent, MockRouterOutlet],
    providers: [
    //  {provide: MyService, useClass: MockMyService} // **--passing Mock service**
  ]
  })
  .compileComponents();
}));

// synchronous block
beforeEach(() => {
  fixture = TestBed.overrideComponent(AppComponent, {
    set: {
      template: '<span></span>'
    }});
  component = TestBed.createComponent(AppComponent).componentInstance;
});


  it('should create the app', async(() => {
        expect(component).toBeTruthy();
  }));
});

@Component({
  selector: 'app-nav-accordian',
  template: ''
})
class MockNavAccordianComponent {
}

@Component({
  selector: 'router-outlet',
  template: ''
})
class MockRouterOutlet {
}


