import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraScannerComponent } from './camera-scanner.component';

describe('CameraScannerComponent', () => {
  let component: CameraScannerComponent;
  let fixture: ComponentFixture<CameraScannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraScannerComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
