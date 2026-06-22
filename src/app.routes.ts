import { Routes } from '@angular/router';
import { ChatbotComponent } from './app/components/chatbot/chatbot';

export const chatbotRoutes: Routes = [
  { path: '', component: ChatbotComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
