import { TestBed } from '@angular/core/testing';

import { NativestorageService } from './nativestorage.service';

describe('NativestorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NativestorageService = TestBed.get(NativestorageService);
    expect(service).toBeTruthy();
  });
});
