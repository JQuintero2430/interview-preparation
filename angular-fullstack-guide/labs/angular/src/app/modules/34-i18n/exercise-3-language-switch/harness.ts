import { ComponentFixture } from '@angular/core/testing';
import { LabM34LanguageStorage } from './language-store';

/** What each library's folder offers the shared spec: a started page and the files its loaders were asked for. */
export interface LabM34SwitchHarness {
  start(storage: LabM34LanguageStorage): Promise<ComponentFixture<unknown>>;
  requests(): readonly string[];
}
