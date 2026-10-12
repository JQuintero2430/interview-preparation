import {
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { map } from 'rxjs';

@Directive({ selector: '[labM19S6Slot]' })
export class LegacySlot {}

// Legacy: decorator inputs, outputs and queries. SEC-M19-06 runs the migration schematics on it.
@Component({
  selector: 'lab-m19-s6-legacy-widget',
  template: `
    <h4 #heading>{{ label }}</h4>
    <p>max={{ max }} readonly={{ readonly }}</p>
    <p>value={{ value }} tone={{ toneClass }} step={{ stepSeen }}</p>
    <p>tag={{ headingTag }} slots={{ slotCount }} first={{ firstText }} doubled={{ doubled }}</p>
    <button type="button" (click)="pick(max)">pick</button>
    <button type="button" (click)="closed.emit()">close</button>
    <ng-content />
  `,
})
export class LegacyWidget implements OnInit {
  @Input({ required: true }) label!: string;
  @Input({ transform: numberAttribute }) max = 5;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input() value = 0;
  @Input('tone') toneClass = '';
  @Input() set step(next: number) {
    this.stepSeen = next;
  }

  @Output() valueChange = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();
  @Output() picked = new EventEmitter<number>();

  @ViewChild('heading', { static: true }) heading!: ElementRef<HTMLElement>;
  @ContentChildren(LegacySlot, { read: ElementRef }) slots!: QueryList<ElementRef<HTMLElement>>;

  stepSeen = 0;
  headingTag = '';
  doubled = 0;

  get slotCount(): number {
    return this.slots?.length ?? 0;
  }

  get firstText(): string {
    return this.slots?.first?.nativeElement.textContent ?? '';
  }

  constructor() {
    this.picked.pipe(map((n) => n * 2)).subscribe((n) => (this.doubled = n));
  }

  ngOnInit(): void {
    this.headingTag = this.heading.nativeElement.tagName;
  }

  pick(next: number): void {
    this.value = next;
    this.valueChange.emit(next);
    this.picked.emit(next);
  }
}
