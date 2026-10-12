import {
  Component,
  ElementRef,
  OnInit,
  booleanAttribute,
  contentChildren,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'lab-m19-rating',
  template: `
    <h4 #heading>{{ label() }}</h4>
    <p>max={{ max() }} readonly={{ readonly() }} tone={{ toneClass() }} value={{ value() }}</p>
    <p>tag={{ headingTag() }} slots={{ slots().length }}</p>
    <button type="button" class="top" (click)="rateTop()">top</button>
    <button type="button" class="close" (click)="closed.emit()">close</button>
    <ng-content />
  `,
})
export class Rating implements OnInit {
  readonly label = input.required<string>();
  readonly max = input(5, { transform: numberAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly toneClass = input('', { alias: 'tone' });
  readonly value = model(0);
  readonly closed = output<void>();
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  protected readonly slots = contentChildren('slot');
  protected readonly headingTag = signal('');

  ngOnInit(): void {
    this.headingTag.set(this.heading().nativeElement.tagName);
  }

  protected rateTop(): void {
    this.value.set(this.max());
  }
}
