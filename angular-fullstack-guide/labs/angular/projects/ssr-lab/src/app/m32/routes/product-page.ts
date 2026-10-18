import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** One product page, served by three parameterized server routes that differ in their fallback. */
@Component({
  selector: 'lab-m32-routes-product',
  template: `<h2>Product {{ id }}</h2>`,
})
export class LabM32RoutesProduct {
  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
}
