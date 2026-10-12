import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, model } from '@angular/core';
import { PanelBody } from './panel-body';

@Component({
  selector: 'lab-m19-panel',
  imports: [NgTemplateOutlet],
  template: `
    <header>
      <button type="button" class="toggle" (click)="open.set(!open())">toggle</button>
      <ng-content select="[panelTitle]">Untitled</ng-content>
    </header>
    @if (open()) {
      <section><ng-container [ngTemplateOutlet]="body()?.template" /></section>
    }
  `,
})
export class Panel {
  readonly open = model(false);
  protected readonly body = contentChild(PanelBody);
}
