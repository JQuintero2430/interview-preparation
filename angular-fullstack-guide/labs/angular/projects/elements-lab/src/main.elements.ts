import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { defineLabElements } from './elements/define';

// The `elements` build's entry: no root component; the host page loads this bundle and uses the defined tags.
createApplication({ providers: [provideBrowserGlobalErrorListeners()] })
  .then((appRef) => defineLabElements(appRef.injector))
  .catch((err) => console.error(err));
