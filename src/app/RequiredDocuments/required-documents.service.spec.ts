import { TestBed } from '@angular/core/testing';

import { RequiredDocumentsService } from './required-documents.service';

describe('RequiredDocumentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RequiredDocumentsService = TestBed.get(RequiredDocumentsService);
    expect(service).toBeTruthy();
  });
});
