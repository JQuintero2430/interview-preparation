import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Badge } from './badge';
import { ShortPipe } from './short-pipe';

// Migration sample: the classic SharedModule (declarations plus a re-export of CommonModule).
@NgModule({
  declarations: [Badge, ShortPipe],
  imports: [CommonModule],
  exports: [CommonModule, Badge, ShortPipe],
})
export class SharedModule {}
