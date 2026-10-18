import { mayImport, type LibraryType, type Scope } from './rules';

const at = (type: LibraryType, scope: Scope = 'orders') => ({ type, scope });

describe('Module 38 · section 4', () => {
  it('Section 4: the rule table allows feature to ui, data-access and util', () => {
    expect(mayImport(at('feature'), at('ui'))).toBe(true);
    expect(mayImport(at('feature'), at('data-access'))).toBe(true);
    expect(mayImport(at('feature'), at('util'))).toBe(true);
  });

  it('Section 4: the rule table rejects ui to data-access and util to ui', () => {
    expect(mayImport(at('ui'), at('data-access'))).toBe(false);
    expect(mayImport(at('util'), at('ui'))).toBe(false);
    expect(mayImport(at('ui'), at('feature'))).toBe(false);
  });

  it('Section 4: the rule table rejects a scope importing another scope except shared', () => {
    expect(mayImport(at('feature', 'orders'), at('ui', 'catalog'))).toBe(false);
    expect(mayImport(at('feature', 'orders'), at('ui', 'shared'))).toBe(true);
    expect(mayImport(at('ui', 'shared'), at('util', 'orders'))).toBe(false);
  });
});
