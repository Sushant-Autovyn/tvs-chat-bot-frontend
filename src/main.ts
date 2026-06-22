import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { chatbotAppConfig } from './app.config';

bootstrapApplication(App, chatbotAppConfig)
  .catch((err) => console.error(err));
