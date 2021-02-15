import {TestBed} from '@angular/core/testing';

import {GeonodeService} from './geonode.service';

describe('GeonodeService', () => {
  let service: GeonodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeonodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
