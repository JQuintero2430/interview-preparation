import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LabM39LegacyOrderPanel } from './legacy-order-panel';
import { LabM39LegacyOrdersService } from './legacy-orders.service';

// Legacy on purpose (SYLLABUS §5, module 39 section 10): compilation scope, provider and export in one class.
@NgModule({
  declarations: [LabM39LegacyOrderPanel],
  imports: [CommonModule],
  exports: [LabM39LegacyOrderPanel],
  providers: [LabM39LegacyOrdersService],
})
export class LabM39LegacyOrdersModule {}
