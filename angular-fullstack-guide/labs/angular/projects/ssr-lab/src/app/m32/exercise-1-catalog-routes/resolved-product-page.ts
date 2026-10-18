import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LabM32Product } from './catalog';

/** Alternative: shows the product the resolver found. */
@Component({
  selector: 'lab-m32-ex1-resolved-product',
  template: `<h2>{{ product.name }}</h2><p>Product {{ product.id }}</p>`,
})
export class LabM32Ex1ResolvedProduct {
  protected readonly product: LabM32Product = inject(ActivatedRoute).snapshot.data['product'];
}
