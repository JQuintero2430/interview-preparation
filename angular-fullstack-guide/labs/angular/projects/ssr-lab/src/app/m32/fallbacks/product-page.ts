import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** One product page, served by three parameterized server routes that differ only in their fallback (Q32.07). */
@Component({
  selector: 'lab-m32-fallbacks-product',
  template: `<h2>Fallback product {{ id }}</h2>`,
})
export class LabM32FallbacksProduct {
  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
}
