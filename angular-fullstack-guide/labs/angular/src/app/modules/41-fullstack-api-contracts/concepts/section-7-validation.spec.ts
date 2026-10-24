import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { type AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { parsePointer } from './json-pointer';
import { type FieldProblem, type Problem, readProblem } from './problem-details';

/** Our example form: the client mirrors the syntactic rules (the server's `@NotBlank`, `@Email`, `@Size(max = 80)`). */
function buildForm() {
  const quantityRow = () => new FormGroup({ quantity: new FormControl(1, { nonNullable: true }) });
  return new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(80)],
    }),
    address: new FormGroup({
      street: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(80)] }),
    }),
    items: new FormArray([quantityRow(), quantityRow()]),
  });
}

/** Our Spring-shaped 422: a rule only the server can check (uniqueness), plus a pointer the form does not have. */
const EMAIL_TAKEN_PROBLEM = {
  type: 'https://api.example.com/problems/validation',
  title: 'Unprocessable Content',
  status: 422,
  errors: [
    { pointer: '#/email', detail: 'Email already used' },
    { pointer: '#/nickname', detail: 'Unknown field' },
  ],
};

/** Puts each server error on the control its pointer names; returns the entries that match no control. */
function applyServerErrors(form: AbstractControl, problem: Problem): FieldProblem[] {
  const unmatched: FieldProblem[] = [];
  for (const entry of problem.errors) {
    const control = form.get([...parsePointer(entry.pointer)]);
    if (control) control.setErrors({ server: entry.detail });
    else unmatched.push(entry);
  }
  return unmatched;
}

describe('Section 7: validation on both layers', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('Section 7: a JSON pointer splits into segments with ~1 and ~0 unescaped', () => {
    expect(parsePointer('#/address/street')).toEqual(['address', 'street']);
    expect(parsePointer('/a~1b/m~0n/~01')).toEqual(['a/b', 'm~n', '~1']);
    expect(parsePointer('#/c%25d')).toEqual(['c%d']);
    expect(parsePointer('')).toEqual([]);
    expect(() => parsePointer('address')).toThrow('Not a JSON Pointer: address');
  });

  it('Section 7: #/address/street resolves to the nested reactive control', () => {
    const form = buildForm();
    const control = form.get([...parsePointer('#/address/street')]);
    expect(control).toBe(form.controls.address.controls.street);
  });

  it('Section 7: #/items/1/quantity resolves to the second row of a FormArray', () => {
    const form = buildForm();
    const control = form.get([...parsePointer('#/items/1/quantity')]);
    expect(control).toBe(form.controls.items.at(1).controls.quantity);
    expect(form.get([...parsePointer('#/items/5/quantity')])).toBeNull();
  });

  it('Section 7: a server-only rule comes back as a field error the client could not have produced', async () => {
    const form = buildForm();
    form.patchValue({ email: 'ana@example.com' });
    expect(form.controls.email.errors).toBeNull();
    const http = TestBed.inject(HttpClient);
    const outcome = firstValueFrom(http.post('/api/customers', form.getRawValue())).then(
      () => null,
      (error: unknown) => error,
    );
    controller
      .expectOne('/api/customers')
      .flush(EMAIL_TAKEN_PROBLEM, { status: 422, statusText: 'Unprocessable Content' });
    const error = await outcome;
    if (!(error instanceof HttpErrorResponse)) throw new Error('expected an HttpErrorResponse');
    const problem = await readProblem(error.error);
    if (!problem) throw new Error('expected a problem detail');
    const unmatched = applyServerErrors(form, problem);
    expect(form.controls.email.errors).toEqual({ server: 'Email already used' });
    expect(unmatched).toEqual([{ pointer: '#/nickname', detail: 'Unknown field' }]);
  });
});
