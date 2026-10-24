// Output question Q42.05: S256 for the verifier of RFC 7636 Appendix B, through our pkce.ts model (Spring is not run).
import { challengeFor, verifyPkce } from '../../modules/42-fullstack-authentication/concepts/pkce';
import { captureLogs } from '../capture';

describe('42 · Q42.05', () => {
  it('Q42.05 S256 challenge, right verifier, changed verifier', async () => {
    const lines = await captureLogs(async (log) => {
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const challenge = await challengeFor(verifier);
      log(challenge);
      log(await verifyPkce(verifier, challenge));
      log(await verifyPkce(`${verifier.slice(0, -1)}A`, challenge));
    });
    expect(lines).toEqual(['E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'true', 'false']);
  });
});
