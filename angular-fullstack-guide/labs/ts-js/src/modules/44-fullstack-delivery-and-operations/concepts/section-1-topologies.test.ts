// Section 1 claims, about our model (topology-model.ts): direct calls across origins pay preflights and need CORS on
// every service, a same-origin proxy needs none, a BFF that aggregates costs one round trip, and only a BFF keeps the
// token off the browser. The origins are strings the test passes; nothing touches a network.
import { requestPlan, type Call, type Screen, type Topology } from './topology-model';

const page = 'https://app.example.com';
const orders: Call = { origin: 'https://api.example.com', method: 'POST', contentType: 'application/json' };
const users: Call = { origin: 'https://users.example.com', method: 'GET' };
const prices: Call = { origin: 'https://prices.example.com', method: 'GET' };

const checkout: Screen = { pageOrigin: page, calls: [orders, users, prices], edgeOrigin: 'https://edge.example.com' };

describe('Module 44 · section 1', () => {
  it('Section 1: direct calls from app.example.com to api.example.com are cross-origin and a JSON POST is preflighted', () => {
    const single = requestPlan('direct', { ...checkout, calls: [orders] });
    expect(single.corsRequiredOn).toEqual(['https://api.example.com']);
    expect(single.preflights).toBe(1);
    expect(single.roundTrips).toBe(2);
    const form = requestPlan('direct', { ...checkout, calls: [{ ...orders, contentType: 'text/plain' }] });
    expect(form.preflights).toBe(0);
    expect(requestPlan('direct', checkout).corsRequiredOn).toHaveLength(3);
  });

  it('Section 1: a same-origin /api route through the reverse proxy needs no CORS', () => {
    const plan = requestPlan('proxy', checkout);
    expect(plan.corsRequiredOn).toEqual([]);
    expect(plan.preflights).toBe(0);
    expect(plan.roundTrips).toBe(3);
  });

  it('Section 1: a BFF that aggregates three service calls costs the browser one round trip', () => {
    const behindGateway = requestPlan('gateway', checkout);
    expect(behindGateway.requests).toBe(3);
    expect(behindGateway.preflights).toBe(1);
    const sameOriginBff = requestPlan('bff', { ...checkout, edgeOrigin: page });
    expect(sameOriginBff.requests).toBe(1);
    expect(sameOriginBff.roundTrips).toBe(1);
    expect(requestPlan('bff', { ...checkout, calls: [] }).requests).toBe(0);
  });

  it('Section 1: with a BFF the browser holds a session cookie and never a token', () => {
    expect(requestPlan('bff', checkout).browserHolds).toBe('session cookie');
    const withoutBff: readonly Topology[] = ['direct', 'proxy', 'gateway'];
    for (const topology of withoutBff) {
      expect(requestPlan(topology, checkout).browserHolds).toBe('bearer token');
    }
  });
});
