import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaTabsPage } from './wa-tabs.page';

describe('WaTabsPage', () => {
  let component: WaTabsPage;
  let fixture: ComponentFixture<WaTabsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WaTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
