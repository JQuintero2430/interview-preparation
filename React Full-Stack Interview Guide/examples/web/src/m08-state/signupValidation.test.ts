import { emptySignup, hasNoErrors, validateSignup } from './signupValidation';

const valid = { email: 'ana@example.com', password: 'correct-horse', confirm: 'correct-horse' };

test('valid values produce no errors', () => {
  expect(validateSignup(valid)).toEqual({});
  expect(hasNoErrors(validateSignup(valid))).toBe(true);
});

test('empty values report email and password, but an empty confirm matches an empty password', () => {
  expect(validateSignup(emptySignup)).toEqual({
    email: 'Enter a valid email',
    password: 'Use at least 8 characters',
  });
});

test('a mismatched confirmation is reported on the confirm field only', () => {
  expect(validateSignup({ ...valid, confirm: 'correct-horsE' })).toEqual({
    confirm: 'Passwords do not match',
  });
});
