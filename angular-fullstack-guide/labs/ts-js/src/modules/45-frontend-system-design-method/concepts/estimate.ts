// Section 3 model: a back-of-envelope transfer-time estimate. Our model, not Lighthouse's code. The profile values are
// read from lighthouse@13.5.0 core/config/constants.js (default: mobileSlow4G, throttlingMethod 'simulate') and
// desktop-config.js (desktopDense4G), whose values live in @paulirish/trace_engine@0.0.65
// models/trace/lantern/simulation/Constants.js (M45 F5). Unit: throughput is in kilobits per second with 1 kilobit =
// 1,024 bits, because Lantern multiplies throughputKbps by 1024 and TCPConnection divides bits by 8 (C3).
// Ignored: CPU time (cpuSlowdownMultiplier is not used), connection setup (DNS, TCP, TLS), TCP slow start, and
// bandwidth shared by parallel requests. The result is an order of magnitude, in milliseconds.

export interface Profile {
  readonly name: string;
  readonly rttMs: number;
  /** Kilobits per second, 1 kilobit = 1,024 bits. */
  readonly throughputKbps: number;
}

export const PROFILES = {
  mobileSlow4G: { name: 'mobileSlow4G', rttMs: 150, throughputKbps: 1.6 * 1024 },
  desktopDense4G: { name: 'desktopDense4G', rttMs: 40, throughputKbps: 10 * 1024 },
} as const satisfies Record<string, Profile>;

const BITS_PER_KILOBIT = 1024;
const BITS_PER_BYTE = 8;
const MS_PER_SECOND = 1000;

/** Bytes the profile moves in one millisecond. */
export function bytesPerMs(profile: Profile): number {
  return (profile.throughputKbps * BITS_PER_KILOBIT) / BITS_PER_BYTE / MS_PER_SECOND;
}

/** Round trips times the round-trip time, plus bytes divided by throughput, in milliseconds. */
export function transferTime(profile: Profile, bytes: number, roundTrips: number): number {
  return roundTrips * profile.rttMs + bytes / bytesPerMs(profile);
}
