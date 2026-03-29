import { inject, Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const INTERVALO_VERIFICACAO_MS = 6 * 60 * 60 * 1000; // 6 horas

@Injectable({
  providedIn: 'root',
})
export class AtualizacaoService {
  private swUpdate = inject(SwUpdate);
  atualizacaoDisponivel = signal(false);

  constructor() {
    if (this.swUpdate.isEnabled) {
      // Verificar atualizações a cada 6 horas
      interval(INTERVALO_VERIFICACAO_MS)
        .pipe(takeUntilDestroyed())
        .subscribe(() => this.swUpdate.checkForUpdate());

      // Ouvir por novas atualizações
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
          takeUntilDestroyed(),
        )
        .subscribe(() => {
          this.atualizacaoDisponivel.set(true);
        });
    }
  }
  
  atualizarParaNovaVersao(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return Promise.resolve(false);
    }

    return this.swUpdate.activateUpdate().then(() => {
      window.location.reload();
      return true;
    });
  }
}
