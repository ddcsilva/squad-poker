import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { SALA_REPOSITORY } from './core/repositories/sala-repository.token';
import { FirestoreSalaRepository } from './core/repositories/firestore-sala.repository';
import { USUARIO_REPOSITORY } from './core/repositories/usuario-repository.token';
import { LocalStorageUsuarioRepository } from './core/repositories/local-storage-usuario.repository';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAnimations(),
    { provide: SALA_REPOSITORY, useClass: FirestoreSalaRepository },
    { provide: USUARIO_REPOSITORY, useClass: LocalStorageUsuarioRepository },
    DatePipe,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
