import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HistoricoRodada } from '../../../../../core/models/sala.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../../core/services/icones.service';

@Component({
    selector: 'app-historico-lista',
    imports: [DatePipe],
    templateUrl: './historico-lista.component.html'
})
export class HistoricoListaComponent {
  private iconesService = inject(IconesService);

  readonly historicoRodadas = input<HistoricoRodada[]>([]);
  readonly exportandoPDF = input<boolean>(false);

  readonly selecionarRodada = output<HistoricoRodada>();
  readonly exportarHistorico = output<void>();

  get iconeDownload(): SafeHtml {
    return this.iconesService.iconeDownload;
  }

  get iconeCarregando(): SafeHtml {
    return this.iconesService.iconeCarregando;
  }

  trackByRodadaNumero(index: number, rodada: HistoricoRodada): number {
    return rodada.numero;
  }
}
