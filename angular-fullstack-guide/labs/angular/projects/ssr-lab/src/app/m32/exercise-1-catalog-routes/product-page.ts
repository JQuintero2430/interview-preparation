import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { LabM32Catalog } from './catalog';
import { LabM32Ex1NotFound } from './not-found';

/** Solution: the page looks the product up and sets the status itself when the id is unknown. */
@Component({
  selector: 'lab-m32-ex1-product',
  imports: [LabM32Ex1NotFound],
  template: `
    @if (product(); as found) {
      <h2>{{ found.name }}</h2>
      <p>Product {{ found.id }}</p>
    } @else if (product() === null) {
      <lab-m32-ex1-not-found />
    }
  `,
})
export class LabM32Ex1Product {
  private readonly response = inject(RESPONSE_INIT);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  protected readonly product = toSignal(
    inject(LabM32Catalog)
      .find(this.id)
      .pipe(
        tap((found) => {
          // The token is `null` in the browser, where the status was already sent.
          if (!found && this.response) this.response.status = 404;
        }),
      ),
  );
}
