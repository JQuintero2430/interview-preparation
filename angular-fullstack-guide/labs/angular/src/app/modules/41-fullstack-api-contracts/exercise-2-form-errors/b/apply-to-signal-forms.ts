import { type FieldTree, type ValidationError, isFieldTree, submit } from '@angular/forms/signals';
import { type ApplyResult, type Customer, type FieldError, SERVER_ERROR, applyFieldErrors, fieldOrder } from '../server-errors';

/** Walks a field tree by pointer tokens; a missing key or row gives `undefined`. */
export function fieldAt(root: unknown, tokens: readonly string[]): FieldTree<unknown> | undefined {
  const found = tokens.reduce<unknown>((node, token) => (isFieldTree(node) ? Reflect.get(node, token) : undefined), root);
  return isFieldTree(found) ? found : undefined;
}

/**
 * Variant b: submits through `submit()`. The action sends the value and returns each server error as a
 * submission error on its field; errors without a field carry no `fieldTree`, so they land on the form.
 */
export async function submitWithServerErrors(
  tree: FieldTree<Customer>,
  send: (value: Customer) => Promise<readonly FieldError[]>,
): Promise<ApplyResult> {
  let result: ApplyResult = { applied: [], formLevel: [], firstInvalid: null };
  await submit(tree, async (field) => {
    const value = field().value();
    const onFields: ValidationError.WithOptionalFieldTree[] = [];
    result = applyFieldErrors(await send(value), fieldOrder(value), (tokens, detail) => {
      const fieldTree = fieldAt(field, tokens);
      if (fieldTree) onFields.push({ kind: SERVER_ERROR, message: detail, fieldTree });
      return fieldTree !== undefined;
    });
    return [...onFields, ...result.formLevel.map((message) => ({ kind: SERVER_ERROR, message }))];
  });
  return result;
}
