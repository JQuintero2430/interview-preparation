import {
  Component,
  ContentChildren,
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

// Legacy: decorator inputs, outputs and queries. Exercise 19.1 moves it to signal APIs.
@Component({
  selector: 'lab-m19-legacy-rating',
  template: `
    <h4 #heading>{{ label }}</h4>
    <p>max={{ max }} readonly={{ readonly }} tone={{ toneClass }} value={{ value }}</p>
    <p>tag={{ headingTag }} slots={{ slots.length }}</p>
    <button type="button" class="top" (click)="rateTop()">top</button>
    <button type="button" class="close" (click)="closed.emit()">close</button>
    <ng-content />
  `,
})
export class LegacyRating implements OnInit {
  @Input({ required: true }) label!: string;
  @Input({ transform: numberAttribute }) max = 5;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input('tone') toneClass = '';
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();
  @ViewChild('heading', { static: true }) heading!: ElementRef<HTMLElement>;
  @ContentChildren('slot') slots!: QueryList<ElementRef<HTMLElement>>;

  headingTag = '';

  ngOnInit(): void {
    this.headingTag = this.heading.nativeElement.tagName;
  }

  rateTop(): void {
    this.value = this.max;
    this.valueChange.emit(this.value);
  }
}
