import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';

@Component({ selector: 'lab-m29-login-page', template: '<p>login page</p>' })
export class LabM29LoginPage {}

@Component({ selector: 'lab-m29-account-page', template: '<p>account page</p>' })
export class LabM29AccountPage {}

export const authRoutes: Routes = [
  { path: 'login', component: LabM29LoginPage },
  { path: 'account', component: LabM29AccountPage, canActivate: [authGuard] },
];
