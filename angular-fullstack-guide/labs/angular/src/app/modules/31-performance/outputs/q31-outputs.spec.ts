import { IMAGE_LOADER, ImageLoader, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * The loader of Q31.18: a root-relative URL with the requested width, so the development-mode
 * preconnect check (which looks at other origins) has nothing to report.
 * @param config - What the directive asks for: the `ngSrc` value and, for a `srcset` entry, a width.
 * @returns `/img/<src>?w=<width>`.
 */
const q3118Loader: ImageLoader = (config) => `/img/${config.src}?w=${config.width}`;

/** Two images with the same source and size, only the first marked `priority`. */
@Component({
  selector: 'lab-m31-q3118-host',
  imports: [NgOptimizedImage],
  providers: [{ provide: IMAGE_LOADER, useValue: q3118Loader }],
  template: `
    <img id="with-priority" ngSrc="a.png" width="400" height="200" priority alt="With priority" />
    <img id="without-priority" ngSrc="a.png" width="400" height="200" alt="Without priority" />
  `,
})
class LabM31Q3118Host {}

/** Renders the host and returns the `<img>` with the given id. */
function renderImage(id: string): HTMLImageElement {
  const fixture = TestBed.createComponent(LabM31Q3118Host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const img = root.querySelector<HTMLImageElement>(`#${id}`);
  if (!img) throw new Error(`the host rendered no <img id="${id}">`);
  return img;
}

describe('Q31.18 outputs', () => {
  it('Q31.18 a priority image is eager, high and sync, a plain one lazy, auto and auto, and both share one srcset', () => {
    const priority = renderImage('with-priority');
    const plain = renderImage('without-priority');
    const srcset = '/img/a.png?w=400 1x, /img/a.png?w=800 2x';

    expect(priority.getAttribute('loading')).toBe('eager');
    expect(priority.getAttribute('fetchpriority')).toBe('high');
    expect(priority.getAttribute('decoding')).toBe('sync');
    expect(priority.getAttribute('srcset')).toBe(srcset);

    expect(plain.getAttribute('loading')).toBe('lazy');
    expect(plain.getAttribute('fetchpriority')).toBe('auto');
    expect(plain.getAttribute('decoding')).toBe('auto');
    expect(plain.getAttribute('srcset')).toBe(srcset);
  });
});
