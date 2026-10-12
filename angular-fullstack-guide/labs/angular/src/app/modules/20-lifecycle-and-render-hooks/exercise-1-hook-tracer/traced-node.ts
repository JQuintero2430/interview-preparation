import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  Directive,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { HookLog } from './hook-log';

// The bare @Directive() lets the compiler accept lifecycle hooks on an abstract base.
@Directive()
abstract class Traced
  implements
    OnChanges,
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  readonly name = input.required<string>();
  private readonly log = inject(HookLog);

  constructor() {
    this.log.record('ctor');
  }

  ngOnChanges(): void {
    this.trace('onChanges');
  }
  ngOnInit(): void {
    this.trace('onInit');
  }
  ngDoCheck(): void {
    this.trace('doCheck');
  }
  ngAfterContentInit(): void {
    this.trace('afterContentInit');
  }
  ngAfterContentChecked(): void {
    this.trace('afterContentChecked');
  }
  ngAfterViewInit(): void {
    this.trace('afterViewInit');
  }
  ngAfterViewChecked(): void {
    this.trace('afterViewChecked');
  }
  ngOnDestroy(): void {
    this.trace('onDestroy');
  }

  private trace(hook: string): void {
    this.log.record(`${this.name()}.${hook}`);
  }
}

@Component({ selector: 'lab-m20-traced-leaf', template: `leaf` })
export class TracedLeaf extends Traced {}

@Component({
  selector: 'lab-m20-traced-node',
  imports: [TracedLeaf],
  template: `{{ count() }}<ng-content /><lab-m20-traced-leaf name="leaf" />`,
})
export class TracedNode extends Traced {
  readonly count = signal(0);
}
