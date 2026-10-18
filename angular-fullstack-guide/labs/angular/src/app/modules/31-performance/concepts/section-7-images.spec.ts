import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  LabM31DensityImage,
  LabM31FillImage,
  LabM31FullWidthImage,
  LabM31LazyImage,
  LabM31PriorityImage,
  LabM31ResponsiveImage,
  LabM31UndimensionedImage,
} from './image-hosts';

/** Renders a host component and returns the `<img>` the directive wrote its attributes on. */
function renderImage(host: Type<unknown>): HTMLImageElement {
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const img = root.querySelector('img');
  if (!img) throw new Error('the host rendered no <img>');
  return img;
}

describe('Section 7: images with NgOptimizedImage', () => {
  it('Section 7: a priority image is eager with high fetch priority and sync decoding', () => {
    const img = renderImage(LabM31PriorityImage);

    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('decoding')).toBe('sync');
  });

  it('Section 7: a non-priority image is lazy with auto fetch priority', () => {
    const img = renderImage(LabM31LazyImage);

    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('fetchpriority')).toBe('auto');
    expect(img.getAttribute('decoding')).toBe('auto');
  });

  it('Section 7: a custom loader produces a 1x and 2x srcset', () => {
    const img = renderImage(LabM31DensityImage);

    expect(img.getAttribute('src')).toBe('cdn/photo.jpg');
    expect(img.getAttribute('srcset')).toBe('cdn/photo.jpg?w=300 1x, cdn/photo.jpg?w=600 2x');
  });

  it('Section 7: sizes produces one srcset entry per configured breakpoint', () => {
    const img = renderImage(LabM31ResponsiveImage);

    expect(img.getAttribute('srcset')).toBe('cdn/photo.jpg?w=320 320w, cdn/photo.jpg?w=640 640w, cdn/photo.jpg?w=960 960w');
  });

  it('Section 7: sizes of 100vw drops breakpoints below 640', () => {
    const img = renderImage(LabM31FullWidthImage);

    expect(img.getAttribute('srcset')).toBe('cdn/photo.jpg?w=640 640w, cdn/photo.jpg?w=960 960w');
  });

  it('Section 7: a fill image renders without width and height attributes', () => {
    const img = renderImage(LabM31FillImage);

    expect(img.hasAttribute('width')).toBe(false);
    expect(img.hasAttribute('height')).toBe(false);
    expect(img.getAttribute('ng-img')).toBe('true');
  });

  it('Section 7: an ngSrc without width and height throws in development', () => {
    expect(() => renderImage(LabM31UndimensionedImage)).toThrowError(/NG02954.*"width", "height"/);
  });
});
