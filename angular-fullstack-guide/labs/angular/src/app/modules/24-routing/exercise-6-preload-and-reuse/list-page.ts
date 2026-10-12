import { Component, Injectable, OnDestroy, inject } from '@angular/core';

/** A route-level service: its injector is the one `withAutoCleanupInjectors()` may destroy. */
@Injectable()
export class LabM24ListState implements OnDestroy {
  static built = 0;
  static destroyed = 0;

  constructor() {
    LabM24ListState.built++;
  }

  ngOnDestroy(): void {
    LabM24ListState.destroyed++;
  }
}

/** A list page that counts how many instances were built and destroyed. */
@Component({ selector: 'lab-m24-list-page', template: 'list' })
export class LabM24ListPage implements OnDestroy {
  static built = 0;
  static destroyed = 0;

  readonly state = inject(LabM24ListState);

  constructor() {
    LabM24ListPage.built++;
  }

  ngOnDestroy(): void {
    LabM24ListPage.destroyed++;
  }
}

@Component({ selector: 'lab-m24-home-page', template: 'home' })
export class LabM24HomePage {}

@Component({ selector: 'lab-m24-detail-page', template: 'detail' })
export class LabM24DetailPage {}
