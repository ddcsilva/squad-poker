import { Routes } from '@angular/router';
import { EntradaComponent } from './features/entrada/entrada.component';
import { SalaComponent } from './features/sala/sala.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: EntradaComponent },
  { path: 'sala/:id', component: SalaComponent },
  { path: '**', component: NotFoundComponent },
];
