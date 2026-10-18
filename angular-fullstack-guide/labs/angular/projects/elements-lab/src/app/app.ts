import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BUILD_LABEL } from './build-info';
import { LabErrorLogView } from './error-log-view';

@Component({
  imports: [RouterOutlet, LabErrorLogView],
  selector: 'lab-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly label = BUILD_LABEL;
}
