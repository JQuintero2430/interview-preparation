import { Component } from '@angular/core';
import { LabM38PageHeading } from '../../../shared/ui/page-heading';
import { pageTitle } from '../../../shared/util/page-title';

@Component({
  selector: 'lab-m38-orders-home',
  imports: [LabM38PageHeading],
  template: `<lab-m38-page-heading [text]="title" />`,
})
export class LabM38OrdersHome {
  protected readonly title = pageTitle('orders');
}
