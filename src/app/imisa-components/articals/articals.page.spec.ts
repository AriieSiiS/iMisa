import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticalsPage } from './articals.page';

describe('ArticalsPage', () => {
  let component: ArticalsPage;
  let fixture: ComponentFixture<ArticalsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticalsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
