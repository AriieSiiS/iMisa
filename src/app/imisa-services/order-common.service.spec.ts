import { TestBed } from '@angular/core/testing';

import { OrderCommonService } from './order-common.service';

describe('OrderCommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderCommonService = TestBed.get(OrderCommonService);
    expect(service).toBeTruthy();
  });
});
