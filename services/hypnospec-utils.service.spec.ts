import { TestBed } from '@angular/core/testing';

import { HypnospecUtilsService } from './hypnospec-utils.service';

describe('HypnospecUtilsService', () => {
  let service: HypnospecUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HypnospecUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
