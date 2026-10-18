import { REDACTED, scrub } from './scrub';

// Section 11 claim: a scrub step removes e-mail addresses and tokens from an error message and a URL before
// a report leaves the app. Pure string functions, no files and no network.
describe('Section 11: scrubbing a report', () => {
  it('Section 11: scrub removes e-mail addresses and tokens from messages and URLs', () => {
    expect(scrub('Cannot notify ana.perez+test@example.com')).toBe(`Cannot notify ${REDACTED}`);
    expect(scrub('/reset?email=ana%40example.com&step=2')).toBe(`/reset?email=${REDACTED}&step=2`);
    expect(scrub('/cb?access_token=abc123&state=x#id_token=zzz')).toBe(
      `/cb?access_token=${REDACTED}&state=x#id_token=${REDACTED}`,
    );
    expect(scrub('401 for Authorization: Bearer abc.def-ghi_123')).toBe(`401 for Authorization: Bearer ${REDACTED}`);
    expect(scrub('bad jwt eyJhbGciOi.eyJzdWIiOiIx.c2ln here')).toBe(`bad jwt ${REDACTED} here`);
    // Text without personal data or secrets is left as it was.
    expect(scrub('TypeError: x is undefined at /orders/42?page=2')).toBe('TypeError: x is undefined at /orders/42?page=2');
  });
});
