import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BootRoot, BootSvc } from './boot-root';

// Legacy: the root module (AppModule) of an NgModule app, started with bootstrapModule.
@NgModule({
  declarations: [BootRoot],
  imports: [BrowserModule],
  providers: [BootSvc],
  bootstrap: [BootRoot],
})
export class BootModule {}
