// Section 3 claims: our drift check (not a generator) compares a client Zod schema with the `OrderDto`
// component schema of our hand-written, springdoc-shaped OpenAPI fixture and names each disagreement.
import { z } from 'zod';
import { componentSchema, contractDrift } from './contract-drift';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node), as module 33 does.
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const description: unknown = JSON.parse(readFileSync(new URL('./fixtures/orders-openapi.json', import.meta.url), 'utf8'));
const orderDto = componentSchema(description, 'OrderDto');

const ClientOrder = z.object({
  id: z.string(),
  customerName: z.string(),
  status: z.string(),
  quantity: z.number().int(),
  createdAt: z.iso.datetime(),
  note: z.string().optional(),
});

describe('Module 41 · section 3', () => {
  it('Section 3: our drift check passes when the client schema matches the component schema', () => {
    expect(contractDrift(orderDto, ClientOrder)).toEqual([]);
  });

  it('Section 3: our drift check reports a renamed required property', () => {
    const renamed = ClientOrder.omit({ customerName: true }).extend({ customer: z.string() });
    expect(contractDrift(orderDto, renamed)).toEqual([
      'customerName: required in the description, missing in the client',
      'customer: in the client, not in the description',
    ]);
  });

  it('Section 3: our drift check reports a date-time property the client parses as a Date', () => {
    const dated = ClientOrder.extend({ createdAt: z.date() });
    expect(contractDrift(orderDto, dated)).toEqual(['createdAt: the client rejects a date-time value from the wire']);
  });
});
