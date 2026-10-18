import { Routes } from '@angular/router';
import { LabM33CookieSession, LabM33LocalStorageStore, LabM33MemoryStore, LabM33TokenStore } from './token-store';
import { LabM33TokensPage } from './tokens-page';

/** Section 8: one page, three places for the credential (server/security/08-tokens.mjs answers the API). */
export const M33_TOKEN_ROUTES: Routes = [
  { path: 'local', component: LabM33TokensPage, providers: [{ provide: LabM33TokenStore, useClass: LabM33LocalStorageStore }] },
  { path: 'memory', component: LabM33TokensPage, providers: [{ provide: LabM33TokenStore, useClass: LabM33MemoryStore }] },
  { path: 'cookie', component: LabM33TokensPage, providers: [{ provide: LabM33TokenStore, useClass: LabM33CookieSession }] },
];
