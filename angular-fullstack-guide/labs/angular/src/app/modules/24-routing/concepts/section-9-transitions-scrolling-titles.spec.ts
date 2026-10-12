import { ViewportScroller } from '@angular/common';
import { ApplicationRef, Component, Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  RouterStateSnapshot,
  Router,
  RouterOutlet,
  Routes,
  Scroll,
  TitleStrategy,
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { legacyScrollingExtraOptions, legacyViewTransitionsExtraOptions } from '../legacy/deprecated-forms';

@Component({ selector: 'lab-m24-page', template: 'page' })
class LabM24Page {}

@Component({ selector: 'lab-m24-scroll-root', imports: [RouterOutlet], template: '<router-outlet />' })
class LabM24ScrollRoot {}

/** Formats every title as `Shop | <title>`, and falls back to `Shop` when the branch has none. */
@Injectable({ providedIn: 'root' })
class LabM24ShopTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const built = this.buildTitle(snapshot);
    this.title.setTitle(built ? `Shop | ${built}` : 'Shop');
  }
}

const titleRoutes: Routes = [
  { path: 'home', title: 'Home', component: LabM24Page },
  { path: 'u/:id', title: (route: ActivatedRouteSnapshot) => `User ${route.params['id']}`, component: LabM24Page },
  {
    path: 'p',
    title: 'Parent',
    children: [
      { path: 'c', title: 'Child', component: LabM24Page },
      { path: 'n', component: LabM24Page },
    ],
  },
  { path: 'plain', component: LabM24Page },
];

async function titlesAfter(urls: string[], extra: Parameters<typeof TestBed.configureTestingModule>[0]['providers'] = []) {
  TestBed.configureTestingModule({ providers: [provideRouter(titleRoutes), ...extra] });
  const harness = await RouterTestingHarness.create();
  const title = TestBed.inject(Title);
  const seen: string[] = [];
  for (const url of urls) {
    await harness.navigateByUrl(url);
    seen.push(title.getTitle());
  }
  return seen;
}

/** Bootstraps a real root component, because the harness does not start the router's scroller (section 8). */
async function withBootstrappedScrolling(body: (router: Router, host: HTMLElement) => Promise<void>): Promise<void> {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const appRef = TestBed.inject(ApplicationRef);
  const ref = appRef.bootstrap(LabM24ScrollRoot, host);
  try {
    await appRef.whenStable();
    await body(TestBed.inject(Router), host);
  } finally {
    ref.destroy();
    host.remove();
  }
}

describe('Section 9: view transitions, scroll restoration and titles', () => {
  it('Section 9: route titles set document.title, deepest primary route first', async () => {
    expect(await titlesAfter(['/home', '/p/c', '/p/n'])).toEqual(['Home', 'Child', 'Parent']);
  });

  it('Section 9: a title function reads the route snapshot', async () => {
    expect(await titlesAfter(['/u/9'])).toEqual(['User 9']);
  });

  it('Section 9: a custom TitleStrategy formats every title', async () => {
    const providers = [{ provide: TitleStrategy, useExisting: LabM24ShopTitleStrategy }];
    expect(await titlesAfter(['/home', '/plain'], providers)).toEqual(['Shop | Home', 'Shop']);
  });

  it('Section 9: a route without a title keeps the previous title with the default strategy', async () => {
    expect(await titlesAfter(['/home', '/plain'])).toEqual(['Home', 'Home']);
  });

  it('Section 9: in-memory scrolling scrolls to the top and to the anchor after bootstrap', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'a', component: LabM24Page },
            { path: 'b', component: LabM24Page },
          ],
          withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
        ),
      ],
    });
    const scroller = TestBed.inject(ViewportScroller);
    const calls: string[] = [];
    vi.spyOn(scroller, 'setHistoryScrollRestoration').mockImplementation((mode) => void calls.push(`restoration:${mode}`));
    vi.spyOn(scroller, 'scrollToPosition').mockImplementation((pos) => void calls.push(`position:${pos.join(',')}`));
    vi.spyOn(scroller, 'scrollToAnchor').mockImplementation((anchor) => void calls.push(`anchor:${anchor}`));
    await withBootstrappedScrolling(async (router) => {
      await vi.waitFor(() => expect(calls).toContain('position:0,0'));
      const afterBootstrap = calls.length;
      await router.navigateByUrl('/a');
      await vi.waitFor(() => expect(calls.length).toBe(afterBootstrap + 1));
      await router.navigateByUrl('/b#sec');
      await vi.waitFor(() => expect(calls.at(-1)).toBe('anchor:sec'));
    });
    expect(calls).toEqual(['restoration:manual', 'position:0,0', 'position:0,0', 'anchor:sec']);
  });

  it('Section 9: without withInMemoryScrolling no scroll call happened', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'a', component: LabM24Page }])] });
    const scroller = TestBed.inject(ViewportScroller);
    const spy = vi.spyOn(scroller, 'scrollToPosition');
    await withBootstrappedScrolling(async (router) => {
      await router.navigateByUrl('/a');
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('Section 9: the router emits Scroll events after navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'a', component: LabM24Page },
            { path: 'b', component: LabM24Page },
          ],
          withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
        ),
      ],
    });
    const seen: { position: [number, number] | null; anchor: string | null }[] = [];
    TestBed.inject(Router).events.subscribe((e) => {
      if (e instanceof Scroll) {
        seen.push({ position: e.position, anchor: e.anchor });
      }
    });
    await withBootstrappedScrolling(async (router) => {
      await vi.waitFor(() => expect(seen.length).toBe(1));
      await router.navigateByUrl('/a');
      await vi.waitFor(() => expect(seen.length).toBe(2));
      await router.navigateByUrl('/b#sec');
      await vi.waitFor(() => expect(seen.length).toBe(3));
    });
    expect(seen).toEqual([
      { position: null, anchor: null },
      { position: null, anchor: null },
      { position: null, anchor: 'sec' },
    ]);
  });

  it('Section 9: withViewTransitions calls startViewTransition once per navigation', async () => {
    const log: string[] = [];
    const stub = (update: () => void | Promise<void>) => {
      log.push('svt');
      void update();
      const done = Promise.resolve();
      return { updateCallbackDone: done, ready: done, finished: done };
    };
    Object.defineProperty(document, 'startViewTransition', { value: stub, configurable: true, writable: true });
    try {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [
              { path: 'a', component: LabM24Page },
              { path: 'b', component: LabM24Page },
            ],
            withViewTransitions({ onViewTransitionCreated: () => void log.push('created') }),
          ),
        ],
      });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/a');
      await harness.navigateByUrl('/b');
    } finally {
      delete (document as unknown as Record<string, unknown>)['startViewTransition'];
    }
    expect(log).toEqual(['svt', 'created', 'svt', 'created']);
  });

  it('Section 9: without startViewTransition the navigation still completes', async () => {
    expect(typeof (document as unknown as Record<string, unknown>)['startViewTransition']).toBe('undefined');
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'a', component: LabM24Page }], withViewTransitions())],
    });
    const harness = await RouterTestingHarness.create();
    const ends: string[] = [];
    TestBed.inject(Router).events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        ends.push(e.urlAfterRedirects);
      }
    });
    await harness.navigateByUrl('/a');
    expect(ends).toEqual(['/a']);
  });

  it('Section 9: the legacy ExtraOptions constants hold the options the with-functions replace', () => {
    expect(legacyScrollingExtraOptions).toEqual({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' });
    expect(legacyViewTransitionsExtraOptions.enableViewTransitions).toBe(true);
  });
});
