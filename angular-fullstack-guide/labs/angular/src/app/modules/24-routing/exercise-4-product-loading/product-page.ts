import { Component, input } from '@angular/core';
import { LabM24Product } from './product-api';

/** Shows the product the router bound to its input; there is no loading state because the route waits. */
@Component({ selector: 'lab-m24-product-page', template: '<h1>{{ product().name }}</h1>' })
export class LabM24ProductPage {
  readonly product = input.required<LabM24Product>();
}

@Component({ selector: 'lab-m24-loading-home', template: 'home' })
export class LabM24LoadingHome {}

@Component({ selector: 'lab-m24-loading-not-found', template: 'not-found' })
export class LabM24LoadingNotFound {}

@Component({ selector: 'lab-m24-loading-error', template: 'error' })
export class LabM24LoadingError {}
