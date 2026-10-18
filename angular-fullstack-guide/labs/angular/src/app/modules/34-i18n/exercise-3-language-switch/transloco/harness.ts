import { TestBed } from '@angular/core/testing';
import { LAB_M34_LANGUAGE_STORAGE } from '../language-store';
import { LabM34SwitchHarness } from '../harness';
import { LabM34RequestLog } from '../request-log';
import { LabM34TranslocoSwitch, provideLabM34Transloco } from './language-switch';

export const labM34TranslocoHarness: LabM34SwitchHarness = {
  async start(storage) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideLabM34Transloco(),
        { provide: LAB_M34_LANGUAGE_STORAGE, useValue: storage },
      ],
    });
    const fixture = TestBed.createComponent(LabM34TranslocoSwitch);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  },
  requests: () => TestBed.inject(LabM34RequestLog).paths,
};
