import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoader, NgOptimizedImage } from '@angular/common';
import { Component, Provider } from '@angular/core';

/** Breakpoints the lab hosts use instead of the sixteen defaults, so the expected `srcset` stays short. */
export const LAB_M31_BREAKPOINTS: readonly number[] = [320, 640, 960];

/**
 * A stand-in for an image CDN's loader: a relative URL, so the development-mode preconnect check
 * (which looks at other origins) has nothing to report.
 * @param config - What the directive asks for: the `ngSrc` value and, for a `srcset` entry, a width.
 * @returns `cdn/<src>` with `?w=<width>` when a width was requested.
 */
export const labM31CdnLoader: ImageLoader = (config) =>
  config.width === undefined ? `cdn/${config.src}` : `cdn/${config.src}?w=${config.width}`;

const LOADER: Provider = { provide: IMAGE_LOADER, useValue: labM31CdnLoader };
const CONFIG: Provider = { provide: IMAGE_CONFIG, useValue: { breakpoints: [...LAB_M31_BREAKPOINTS] } };

/** An image with `priority`. */
@Component({
  selector: 'lab-m31-priority-image',
  imports: [NgOptimizedImage],
  providers: [LOADER],
  template: `<img ngSrc="hero.jpg" width="800" height="400" priority alt="Hero" />`,
})
export class LabM31PriorityImage {}

/** The same image without `priority`. */
@Component({
  selector: 'lab-m31-lazy-image',
  imports: [NgOptimizedImage],
  providers: [LOADER],
  template: `<img ngSrc="hero.jpg" width="800" height="400" alt="Hero" />`,
})
export class LabM31LazyImage {}

/** A 300 px image with no `sizes`: the density `srcset`. */
@Component({
  selector: 'lab-m31-density-image',
  imports: [NgOptimizedImage],
  providers: [LOADER],
  template: `<img ngSrc="photo.jpg" width="300" height="200" alt="Photo" />`,
})
export class LabM31DensityImage {}

/** An image with `sizes` and the configured breakpoints: the responsive `srcset`. */
@Component({
  selector: 'lab-m31-responsive-image',
  imports: [NgOptimizedImage],
  providers: [LOADER, CONFIG],
  template: `<img ngSrc="photo.jpg" width="960" height="640" sizes="50vw" alt="Photo" />`,
})
export class LabM31ResponsiveImage {}

/** An image whose `sizes` is exactly `100vw`. */
@Component({
  selector: 'lab-m31-full-width-image',
  imports: [NgOptimizedImage],
  providers: [LOADER, CONFIG],
  template: `<img ngSrc="photo.jpg" width="960" height="640" sizes="100vw" alt="Photo" />`,
})
export class LabM31FullWidthImage {}

/** A `fill` image inside a positioned parent, with no dimensions. */
@Component({
  selector: 'lab-m31-fill-image',
  imports: [NgOptimizedImage],
  providers: [LOADER],
  styles: `
    .frame {
      position: relative;
      height: 200px;
    }
  `,
  template: `
    <div class="frame">
      <img ngSrc="photo.jpg" fill alt="Photo" />
    </div>
  `,
})
export class LabM31FillImage {}

/** An `ngSrc` image with neither `width` nor `height`. */
@Component({
  selector: 'lab-m31-undimensioned-image',
  imports: [NgOptimizedImage],
  providers: [LOADER],
  template: `<img ngSrc="photo.jpg" alt="Photo" />`,
})
export class LabM31UndimensionedImage {}
