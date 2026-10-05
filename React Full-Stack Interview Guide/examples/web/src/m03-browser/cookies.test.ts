import { serializeCookie } from './cookies';

test('a typical session cookie', () => {
  expect(
    serializeCookie('__Host-sid', 'a b', { secure: true, httpOnly: true, sameSite: 'Lax', path: '/', maxAgeSeconds: 3600 }),
  ).toBe('__Host-sid=a%20b; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Lax');
});

test('SameSite=None without Secure is rejected (browsers drop it)', () => {
  expect(() => serializeCookie('x', '1', { sameSite: 'None' })).toThrow(/Secure/);
  expect(serializeCookie('x', '1', { sameSite: 'None', secure: true })).toBe('x=1; Secure; SameSite=None');
});

test('__Host- prefix rules: Secure, Path=/, no Domain', () => {
  expect(() => serializeCookie('__Host-a', '1', { secure: true, path: '/', domain: 'example.com' })).toThrow();
  expect(() => serializeCookie('__Host-a', '1', { secure: true })).toThrow();
  expect(() => serializeCookie('__Host-a', '1', { path: '/' })).toThrow();
});

test('__Secure- needs Secure; partitioned needs Secure; bad names rejected', () => {
  expect(() => serializeCookie('__Secure-a', '1')).toThrow();
  expect(() => serializeCookie('a', '1', { partitioned: true })).toThrow();
  expect(() => serializeCookie('bad name', '1')).toThrow();
});
