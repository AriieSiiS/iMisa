import { TestBed } from '@angular/core/testing';

import { DataAccessServiceService } from './data-access-service.service';

describe('DataAccessServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataAccessServiceService = TestBed.get(DataAccessServiceService);
    expect(service).toBeTruthy();
  });
});
