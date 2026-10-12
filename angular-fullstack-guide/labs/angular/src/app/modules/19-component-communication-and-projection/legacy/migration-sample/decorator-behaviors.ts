import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  signal,
} from '@angular/core';

@Directive({ selector: '[labM19S6Item]' })
export class TimingItem {}

// Legacy: decorator queries and an input setter, for the timing tests of section 6.
@Component({
  selector: 'lab-m19-s6-timing',
  template: `
    <span #a>a</span>
    @if (show()) {
      <span #b>b</span>
    }
    <ng-content />
  `,
})
export class Timing implements OnInit, AfterContentInit, AfterViewInit {
  readonly show = signal(false);
  readonly log: string[] = [];

  @ViewChild('a', { static: true }) staticA?: ElementRef<HTMLElement>;
  @ViewChild('a') dynamicA?: ElementRef<HTMLElement>;
  @ViewChild('b', { static: true }) staticB?: ElementRef<HTMLElement>;
  @ViewChildren('b') bs!: QueryList<ElementRef<HTMLElement>>;
  @ContentChild(TimingItem) item?: TimingItem;
  @ContentChildren(TimingItem) items?: QueryList<TimingItem>;

  @Input() set step(next: number) {
    this.log.push(`setter:${next}`);
  }

  constructor() {
    this.log.push('constructor');
  }

  ngOnInit(): void {
    this.log.push(
      `init static=${!!this.staticA} dynamic=${!!this.dynamicA} item=${!!this.item} items=${!!this.items}`,
    );
  }

  ngAfterContentInit(): void {
    this.log.push(`content item=${!!this.item} items=${this.items?.length}`);
  }

  ngAfterViewInit(): void {
    this.log.push(`view dynamic=${!!this.dynamicA} staticB=${!!this.staticB}`);
  }
}
