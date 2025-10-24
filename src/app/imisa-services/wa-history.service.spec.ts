import { TestBed } from '@angular/core/testing';

import { WaHistoryService } from './wa-history.service';

describe('WaHistoryService', () => {
  let service: WaHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
