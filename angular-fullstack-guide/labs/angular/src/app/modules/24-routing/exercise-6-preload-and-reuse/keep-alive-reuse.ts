import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
  Route,
  destroyDetachedRouteHandle,
} from '@angular/router';

/** Keeps the page of the route flagged `data: { keepAlive: true }` alive while the user is away, one page at a time. */
@Injectable()
export class LabM24KeepAliveReuse extends BaseRouteReuseStrategy {
  private stored: { config: Route; handle: DetachedRouteHandle } | null = null;

  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['keepAlive'] === true;
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (!route.routeConfig) {
      return;
    }
    if (!handle) {
      // The router stores `null` when it reattaches a handle.
      if (this.stored?.config === route.routeConfig) {
        this.stored = null;
      }
      return;
    }
    if (this.stored && this.stored.config !== route.routeConfig) {
      destroyDetachedRouteHandle(this.stored.handle);
    }
    this.stored = { config: route.routeConfig, handle };
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && this.stored?.config === route.routeConfig;
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.shouldAttach(route) ? (this.stored?.handle ?? null) : null;
  }

  /** Tells `withAutoCleanupInjectors()` which injectors a stored page still needs. */
  retrieveStoredRouteHandles(): DetachedRouteHandle[] {
    return this.stored ? [this.stored.handle] : [];
  }
}
