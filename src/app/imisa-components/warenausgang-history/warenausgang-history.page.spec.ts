import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarenausgangHistoryPage } from './warenausgang-history.page';

describe('WarenausgangHistoryPage', () => {
  let component: WarenausgangHistoryPage;
  let fixture: ComponentFixture<WarenausgangHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WarenausgangHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
