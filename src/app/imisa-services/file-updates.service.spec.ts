import { TestBed } from '@angular/core/testing';

import { FileUpdatesService } from './file-updates.service';

describe('FileUpdatesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileUpdatesService = TestBed.get(FileUpdatesService);
    expect(service).toBeTruthy();
  });
});
