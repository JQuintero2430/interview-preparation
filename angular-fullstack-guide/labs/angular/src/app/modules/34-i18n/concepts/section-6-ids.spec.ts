/// <reference types="@angular/localize" />
import { ɵcomputeMsgId as computeMsgId, ɵparseMessage as parseMessage } from '@angular/localize';

// Section 6 claims: a computed message ID is a hash of the text and the meaning, and of nothing else.
// `ɵcomputeMsgId` and `ɵparseMessage` are internal and may change in any release. The three IDs below are the
// ones `ng extract-i18n` wrote into `projects/i18n-lab/src/locale/messages.xlf` (the ts-js test reads them there).
const idOf = (parts: TemplateStringsArray): string => parseMessage(parts, []).id;

describe('Section 6: computed message IDs', () => {
  it('Section 6: changing one word changes the computed ID', () => {
    expect(computeMsgId('Welcome back')).toBe('4200317694838753109');
    expect(computeMsgId('Welcome home')).not.toBe(computeMsgId('Welcome back'));
  });

  it('Section 6: a description does not change the computed ID', () => {
    expect(idOf`:door|Closes a physical door:Close`).toBe(idOf`:door|Another description entirely:Close`);
    expect(idOf`:door|Closes a physical door:Close`).toBe(computeMsgId('Close', 'door'));
  });

  it('Section 6: a meaning changes the computed ID', () => {
    expect(computeMsgId('Close', 'door')).toBe('2522557153388325485');
    expect(computeMsgId('Close', 'dialog')).toBe('1426216042718898919');
  });
});
