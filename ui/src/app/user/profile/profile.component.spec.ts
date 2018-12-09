import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, PatternValidator, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

xdescribe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileComponent ],
      providers: [ { provide: FormBuilder, useValue: formBuilder } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    component.profileForm = formBuilder.group({
      chain: ['chain', Validators.required],
            ip: [
                '',
                Validators.required
            ],
            action: ['action', Validators.required]
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('have invalid first name', () => {
    expect(component.profileForm.controls['firstName'].invalid).toBeTruthy();
  });
});
