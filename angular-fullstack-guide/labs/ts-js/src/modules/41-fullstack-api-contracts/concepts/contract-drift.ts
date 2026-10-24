// Our checker, not a generator: compares a client Zod object schema with one OpenAPI component schema
// (`properties`, `required`, `type` and `format` of primitive properties) and lists every disagreement.
import { z } from 'zod';

/** The part of an OpenAPI component schema our checker reads; other keywords are ignored. */
const ComponentSchema = z.object({
  properties: z.record(z.string(), z.object({ type: z.string(), format: z.string().optional() })),
  required: z.array(z.string()).default([]),
});

export type ComponentSchema = z.infer<typeof ComponentSchema>;

/** One wire value per OpenAPI type, or `type/format`, fed to the client field. */
const WIRE_SAMPLES: Record<string, unknown> = {
  string: 'text',
  'string/date-time': '2026-10-20T08:30:00Z',
  integer: 2,
  number: 2.5,
  boolean: true,
};

/** Reads `components.schemas[name]` from a parsed OpenAPI document. */
export function componentSchema(document: unknown, name: string): ComponentSchema {
  const parsed = z.object({ components: z.object({ schemas: z.record(z.string(), z.unknown()) }) }).parse(document);
  return ComponentSchema.parse(parsed.components.schemas[name]);
}

function wireSample(type: string, format: string | undefined): unknown {
  return WIRE_SAMPLES[`${type}/${format}`] ?? WIRE_SAMPLES[type];
}

/** Lists the disagreements between the description and the client; an empty list means in sync. */
export function contractDrift(component: ComponentSchema, client: { readonly shape: Record<string, z.ZodType> }): string[] {
  const problems: string[] = [];
  for (const [name, { type, format }] of Object.entries(component.properties)) {
    const field = client.shape[name];
    const required = component.required.includes(name);
    if (!field) {
      if (required) problems.push(`${name}: required in the description, missing in the client`);
      continue;
    }
    if (!required && !field.safeParse(undefined).success) {
      problems.push(`${name}: optional in the description, required in the client`);
    }
    if (!field.safeParse(wireSample(type, format)).success) {
      problems.push(`${name}: the client rejects a ${format ?? type} value from the wire`);
    }
  }
  for (const name of Object.keys(client.shape)) {
    if (!(name in component.properties)) problems.push(`${name}: in the client, not in the description`);
  }
  return problems;
}
