import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';

@Component({
  selector: 'app-nav-accordian',
  templateUrl: './nav-accordian.component.html',
  styleUrls: ['./nav-accordian.component.css']
})
export class NavAccordianComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  click(id: string) {
    const elem: HTMLElement = document.getElementById(id);
    if (elem.classList.contains('collapse')) {
      elem.classList.remove('collapse');
      return;
    }
    elem.classList.add('collapse');
    }
}
