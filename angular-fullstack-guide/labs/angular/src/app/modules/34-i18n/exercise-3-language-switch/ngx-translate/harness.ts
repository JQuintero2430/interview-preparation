import { TestBed } from '@angular/core/testing';
import { LAB_M34_LANGUAGE_STORAGE } from '../language-store';
import { LabM34SwitchHarness } from '../harness';
import { LabM34RequestLog } from '../request-log';
import { LabM34NgxSwitch, provideLabM34Ngx } from './language-switch';

export const labM34NgxHarness: LabM34SwitchHarness = {
  async start(storage) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideLabM34Ngx(), { provide: LAB_M34_LANGUAGE_STORAGE, useValue: storage }],
    });
    const fixture = TestBed.createComponent(LabM34NgxSwitch);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  },
  requests: () => TestBed.inject(LabM34RequestLog).paths,
};
