// Bug hunt Q01.21 and Output question Q01.22 (section 7: null, undefined and the nullish operators).
import { captureLogs } from '../capture';
import { runSnippet } from './run-snippet';

describe('Module 01 · null, undefined and nullish operators', () => {
  it('Q01.21 the settings loader: || replaces valid values and a plain chain throws', async () => {
    const snippet = String.raw`
function loadSettings(saved) {
  return {
    retries: saved.retries || 3,
    label: saved.label || 'Untitled',
    theme: saved.theme || 'light',
    city: saved.user.address.city,
  };
}
try {
  console.log(JSON.stringify(loadSettings({ retries: 0, label: '', theme: null })));
} catch (e) {
  console.log(e.name);
}
const saved = { retries: 0, label: '', theme: null };
console.log(saved.retries || 3, saved.label || 'Untitled', saved.theme || 'light');
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['TypeError', '3 Untitled light']);
  });

  it('Q01.21 the fix: ?? keeps 0 and empty strings, ?. stops the chain', async () => {
    const snippet = String.raw`
function loadSettings(saved) {
  return {
    retries: saved.retries ?? 3,
    label: saved.label ?? 'Untitled',
    theme: saved.theme ?? 'light',
    city: saved.user?.address.city,
  };
}
const settings = loadSettings({ retries: 0, label: '', theme: null });
console.log(JSON.stringify(settings), settings.city);
let calls = 0;
const counter = { count: 0 };
counter.count ??= (calls++, 1);
console.log(counter.count, calls);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['{"retries":0,"label":"","theme":"light"} undefined', '0 0']);
  });

  it('Q01.21 evidence: ?? versus ||, optional chaining and logical assignment', async () => {
    const snippet = String.raw`
const settings = { retries: 0, label: '', theme: null };
console.log(settings.retries || 3, settings.retries ?? 3);
console.log(settings.label || 'none', settings.theme ?? 'light');
console.log(settings.user?.name, settings.user?.name.first);
settings.retries ||= 5;
settings.label ??= 'untitled';
settings.theme ??= 'dark';
console.log(JSON.stringify(settings));
try {
  eval('null || undefined ?? 1');
} catch (e) {
  console.log(e.name);
}
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual([
      '3 0',
      'none light',
      'undefined undefined',
      '{"retries":5,"label":"","theme":"dark"}',
      'SyntaxError',
    ]);
  });

  it('Q01.22 null versus undefined: defaults, destructuring, JSON and in', async () => {
    const snippet = String.raw`
function greet(name = 'guest') { return 'hi ' + name; }
console.log(greet(undefined), '|', greet(null));
const { size = 10 } = { size: null };
const { page = 1 } = { page: undefined };
console.log(size, page);
console.log(JSON.stringify({ a: undefined, b: null }));
console.log(JSON.stringify([undefined, null]));
console.log('a' in { a: undefined }, 'a' in {});
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['hi guest | hi null', 'null 1', '{"b":null}', '[null,null]', 'true false']);
  });
});
