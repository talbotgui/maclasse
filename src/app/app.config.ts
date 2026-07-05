import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

/** Configuration principale de l'application Angular. */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withHashLocation()),
  ],
};
