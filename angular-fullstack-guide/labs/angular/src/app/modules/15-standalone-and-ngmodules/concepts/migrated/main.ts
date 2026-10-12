import {
  platformBrowser,
  BrowserModule,
  bootstrapApplication,
} from "@angular/platform-browser";

import { Greeter } from "./app/greeter";
import { AppRoutingModule } from "./app/app-routing.module";
import { App } from "./app/app";
import { importProvidersFrom } from "@angular/core";

bootstrapApplication(App, {
  providers: [importProvidersFrom(BrowserModule, AppRoutingModule), Greeter],
}).catch((err) => console.error(err));
