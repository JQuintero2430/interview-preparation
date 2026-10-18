import { Component, ElementRef, inject, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/** The Section 2 payload: a handler that only counts, never alerts. */
const PAYLOAD = '<img src="x" onerror="window.__m33Hits=(window.__m33Hits||0)+1">';

@Component({ template: `<p>{{ value }}</p>` })
class InterpolationHost {
  protected readonly value = PAYLOAD;
}

@Component({ template: `<p [innerHTML]="value"></p>` })
class InnerHtmlHost {
  protected readonly value = `<b>hi</b><script>window.__m33Hits=1</script>${PAYLOAD}`;
}

@Component({ template: `<p></p>` })
class RendererHost {
  readonly renderer = inject(Renderer2);
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}

describe('Section 2: escaping by default and the paths around it', () => {
  it('Section 2: interpolation renders markup as text', () => {
    const fixture = TestBed.createComponent(InterpolationHost);
    fixture.detectChanges();
    const paragraph = (fixture.nativeElement as HTMLElement).querySelector('p');

    expect(paragraph?.textContent).toBe(PAYLOAD); // the characters, not an element
    expect(paragraph?.children.length).toBe(0);
    expect(paragraph?.innerHTML).toContain('&lt;img src="x"'); // serialized back with the angle bracket escaped
  });

  it('Section 2: an [innerHTML] binding removes the script and the event handler', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); // development mode warns here
    const fixture = TestBed.createComponent(InnerHtmlHost);
    fixture.detectChanges();
    const paragraph = (fixture.nativeElement as HTMLElement).querySelector('p');

    expect(paragraph?.innerHTML).toBe('<b>hi</b><img src="x">');
    expect(paragraph?.querySelector('script')).toBeNull();
    expect(paragraph?.querySelector('[onerror]')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('Section 2: Renderer2.setProperty writes innerHTML without sanitizing', () => {
    const fixture = TestBed.createComponent(RendererHost);
    const { renderer, host } = fixture.componentInstance;
    const paragraph = host.querySelector('p');
    if (!paragraph) throw new Error('the template renders a paragraph');

    renderer.setProperty(paragraph, 'innerHTML', PAYLOAD);

    expect(paragraph.querySelector('img')?.getAttribute('onerror')).toBe('window.__m33Hits=(window.__m33Hits||0)+1');
    expect(paragraph.innerHTML).toBe(PAYLOAD);
  });
});
