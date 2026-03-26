import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/entrada/entrada.component').then(m => m.EntradaComponent) },
  { path: 'sala/:id', loadComponent: () => import('./features/sala/sala.component').then(m => m.SalaComponent) },
  { path: '**', redirectTo: '' },
];
