import { Component } from '@angular/core';
import { LabM18FailingPanel } from './fixtures/lab-m18-failing-panel';
import { LabM18Panel } from './fixtures/lab-m18-panel';
import { LabM18SlowPanel } from './fixtures/lab-m18-slow-panel';

// A @defer body names its component statically, so each fixture module gets a host of the same shape.
@Component({
  selector: 'lab-m18-e3-panel-host',
  imports: [LabM18Panel],
  template: `
    @defer (on interaction; prefetch on hover) {
      <lab-m18-panel />
    } @placeholder {
      <button id="placeholder" type="button">Open panel</button>
    } @loading (after 40ms; minimum 100ms) {
      <p id="loading">Loading panel</p>
    } @error {
      <p id="error">The panel failed to load</p>
    }
  `,
})
export class LazyPanelHost {}

@Component({
  selector: 'lab-m18-e3-slow-panel-host',
  imports: [LabM18SlowPanel],
  template: `
    @defer (on interaction; prefetch on hover) {
      <lab-m18-slow-panel />
    } @placeholder {
      <button id="placeholder" type="button">Open panel</button>
    } @loading (after 40ms; minimum 100ms) {
      <p id="loading">Loading panel</p>
    } @error {
      <p id="error">The panel failed to load</p>
    }
  `,
})
export class SlowPanelHost {}

@Component({
  selector: 'lab-m18-e3-failing-panel-host',
  imports: [LabM18FailingPanel],
  template: `
    @defer (on interaction; prefetch on hover) {
      <lab-m18-failing-panel />
    } @placeholder {
      <button id="placeholder" type="button">Open panel</button>
    } @loading (after 40ms; minimum 100ms) {
      <p id="loading">Loading panel</p>
    } @error {
      <p id="error">The panel failed to load</p>
    }
  `,
})
export class FailingPanelHost {}
