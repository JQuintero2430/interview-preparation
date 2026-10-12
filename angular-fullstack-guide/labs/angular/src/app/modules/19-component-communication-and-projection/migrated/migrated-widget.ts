import {
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  booleanAttribute,
  numberAttribute,
  input,
  output,
  viewChild,
  contentChildren,
} from '@angular/core';
import { map } from 'rxjs';

@Directive({ selector: '[labM19S6Slot]' })
export class MigratedSlot {}

// Migrated: the output of `ng generate @angular/core:signals --insert-todos` run on
// legacy/migration-sample/legacy-widget.ts (SEC-M19-06). Only the names and this comment were edited.
@Component({
  selector: 'lab-m19-s6-migrated-widget',
  template: `
    <h4 #heading>{{ label() }}</h4>
    <p>max={{ max() }} readonly={{ readonly() }}</p>
    <p>value={{ value }} tone={{ toneClass() }} step={{ stepSeen }}</p>
    <p>tag={{ headingTag }} slots={{ slotCount }} first={{ firstText }} doubled={{ doubled }}</p>
    <button type="button" (click)="pick(max())">pick</button>
    <button type="button" (click)="closed.emit()">close</button>
    <ng-content />
  `,
})
export class MigratedWidget implements OnInit {
  readonly label = input.required<string>();
  readonly max = input(5, { transform: numberAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() value = 0;
  readonly toneClass = input('', { alias: 'tone' });
  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input() set step(next: number) {
    this.stepSeen = next;
  }

  readonly valueChange = output<number>();
  readonly closed = output<void>();
  @Output() picked = new EventEmitter<number>();

  readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  readonly slots = contentChildren(MigratedSlot, { read: ElementRef });

  stepSeen = 0;
  headingTag = '';
  doubled = 0;

  get slotCount(): number {
    return this.slots()?.length ?? 0;
  }

  get firstText(): string {
    return this.slots()?.at(0)!?.nativeElement.textContent ?? '';
  }

  constructor() {
    this.picked.pipe(map((n) => n * 2)).subscribe((n) => (this.doubled = n));
  }

  ngOnInit(): void {
    this.headingTag = this.heading().nativeElement.tagName;
  }

  pick(next: number): void {
    this.value = next;
    this.valueChange.emit(next);
    this.picked.emit(next);
  }
}
