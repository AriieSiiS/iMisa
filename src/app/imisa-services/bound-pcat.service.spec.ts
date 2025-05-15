import { TestBed } from '@angular/core/testing';

import { BoundPcatService } from './bound-pcat.service';

describe('BoundPcatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BoundPcatService = TestBed.get(BoundPcatService);
    expect(service).toBeTruthy();
  });
});
