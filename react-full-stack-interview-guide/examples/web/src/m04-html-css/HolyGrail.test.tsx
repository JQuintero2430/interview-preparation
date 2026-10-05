import { render, screen } from '@testing-library/react';
import { HolyGrail } from './HolyGrail';

function setup() {
  return render(
    <HolyGrail
      title="Docs"
      nav={
        <ul>
          <li>
            <a href="/a">Alpha</a>
          </li>
        </ul>
      }
      aside={<p>Related links</p>}
    >
      <p>Article body</p>
    </HolyGrail>,
  );
}

describe('HolyGrail', () => {
  it('exposes the five landmarks', () => {
    setup();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Related' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('has exactly one h1 inside the banner', () => {
    setup();
    const h1 = screen.getByRole('heading', { level: 1, name: 'Docs' });
    expect(screen.getByRole('banner')).toContainElement(h1);
  });

  it('keeps DOM (reading and tab) order independent of the grid placement', () => {
    setup();
    const order = ['banner', 'navigation', 'main', 'complementary', 'contentinfo'].map((r) =>
      screen.getByRole(r),
    );
    for (let i = 0; i < order.length - 1; i++) {
      const a = order[i];
      const b = order[i + 1];
      expect(a?.compareDocumentPosition(b as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }
  });

  it('provides a skip link that targets the main landmark', () => {
    setup();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveAttribute('href', `#${screen.getByRole('main').id}`);
  });

  it('applies the CSS Module classes (Vitest returns "_<name>_<hash>" when CSS is not processed)', () => {
    setup();
    expect(screen.getByRole('main').className).toMatch(/_main_/);
    expect(screen.getByRole('banner').className).toMatch(/_header_/);
    expect(screen.getByRole('complementary').className).toMatch(/_aside_/);
  });
});
