import { CSP_NONCE } from '@angular/core';
import { TestBed } from '@angular/core/testing';

const ROOT_NONCE = 'bGFiLW0zMy1ub25jZQ==';

describe('Section 5: the CSP nonce Angular reads', () => {
  afterEach(() => document.querySelectorAll('lab-root').forEach((element) => element.remove()));

  it('Section 5: CSP_NONCE defaults to the ngCspNonce attribute of the root element', () => {
    // Without the attribute and without a provider, the token's factory finds nothing.
    expect(TestBed.inject(CSP_NONCE)).toBeNull();

    TestBed.resetTestingModule();
    const root = document.createElement('lab-root');
    root.setAttribute('ngCspNonce', ROOT_NONCE);
    document.body.append(root);

    expect(TestBed.inject(CSP_NONCE)).toBe(ROOT_NONCE);
  });
});
