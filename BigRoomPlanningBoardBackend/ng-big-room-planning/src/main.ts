/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { getAppConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const appConfig = getAppConfig();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

// Duplicate code 1
const mode = localStorage.getItem('theme') === 'dark' || 
  ((!('theme' in localStorage) || localStorage.getItem('theme') === 'system') 
    && window.matchMedia('(prefers-color-scheme: dark)').matches)

document.documentElement.setAttribute('data-theme', mode ? 'dark' : 'light');