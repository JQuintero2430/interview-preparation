import { escapeHtml, isSafeHttpUrl } from './escapeHtml';

const payload = '<img src=x onerror="alert(1)">';

test('innerHTML parses attacker markup into live elements (the XSS sink)', () => {
  const box = document.createElement('div');
  box.innerHTML = payload;
  const img = box.querySelector('img');
  expect(img).not.toBeNull();
  expect(img?.hasAttribute('onerror')).toBe(true); // a real browser would run it when the load fails
});

test('textContent treats the same string as inert text', () => {
  const box = document.createElement('div');
  box.textContent = payload;
  expect(box.querySelector('img')).toBeNull();
  expect(box.textContent).toBe(payload);
});

test('escaped markup rendered through innerHTML displays as text', () => {
  const box = document.createElement('div');
  box.innerHTML = escapeHtml(payload);
  expect(box.querySelector('img')).toBeNull();
  expect(box.textContent).toBe(payload);
});

test('escaping does not make a javascript: URL safe; a scheme allow-list does', () => {
  expect(escapeHtml('javascript:alert(1)')).toBe('javascript:alert(1)');
  expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
  expect(isSafeHttpUrl('  JaVaScRiPt:alert(1)')).toBe(false);
  expect(isSafeHttpUrl('https://example.com/a')).toBe(true);
  expect(isSafeHttpUrl('/relative/path')).toBe(true);
});
