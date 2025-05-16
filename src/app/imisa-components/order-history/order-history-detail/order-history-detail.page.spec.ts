import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderHistoryDetailPage } from './order-history-detail.page';

describe('OrderHistoryDetailPage', () => {
  let component: OrderHistoryDetailPage;
  let fixture: ComponentFixture<OrderHistoryDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderHistoryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
