import { Component } from "@angular/core";
import { Hello } from "./hello";
import { RouterOutlet } from "@angular/router";

// Migration sample: the root component.
@Component({
  selector: "lab-m15-mig-app",
  template: '<lab-m15-mig-hello name="Ada" /><router-outlet />',
  imports: [Hello, RouterOutlet],
})
export class App {}
