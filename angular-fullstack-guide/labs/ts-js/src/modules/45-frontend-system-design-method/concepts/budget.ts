// Section 6 model: the bytes a time target leaves after the fixed costs. Our model, not Lighthouse's code; the profiles
// are estimate.ts's (M45 F5). Ignored: CPU time (Lighthouse's mobile profile lists a 4x CPU slowdown, which this model
// does not apply), connection setup, slow start and parallel requests. The result is an order of magnitude, in bytes.
import { bytesPerMs, type Profile } from './estimate';

/** Bytes that fit in targetMs once round trips and server time are subtracted; zero when the fixed costs use it all. */
export function maxBytes(targetMs: number, profile: Profile, roundTrips: number, serverMs: number): number {
  const transferMs = targetMs - roundTrips * profile.rttMs - serverMs;
  return Math.max(0, transferMs * bytesPerMs(profile));
}
