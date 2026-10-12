import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { App } from './app';
import { AppRoutingModule } from './app-routing.module';
import { Greeter } from './greeter';
import { Hello } from './hello';
import { SharedModule } from './shared/shared.module';

// Migration sample: the root module (scope, providers and bootstrap in one class).
@NgModule({
  declarations: [App, Hello],
  imports: [BrowserModule, SharedModule, AppRoutingModule],
  providers: [Greeter],
  bootstrap: [App],
})
export class AppModule {}
