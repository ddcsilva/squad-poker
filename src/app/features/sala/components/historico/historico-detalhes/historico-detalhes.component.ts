import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HistoricoRodada } from '../../../../../core/models/sala.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../../core/services/icones.service';

@Component({
    selector: 'app-historico-detalhes',
    imports: [DatePipe],
    templateUrl: './historico-detalhes.component.html'
})
export class HistoricoDetalhesComponent {
  private iconesService = inject(IconesService);

  readonly rodada = input.required<HistoricoRodada>();
  readonly nomeDono = input<string>('');
  readonly exportandoPNG = input<boolean>(false);

  readonly voltar = output<void>();
  readonly exportar = output<void>();

  get iconeVoltar(): SafeHtml {
    return this.iconesService.iconeVoltar;
  }

  get iconeDownload(): SafeHtml {
    return this.iconesService.iconeDownload;
  }

  get iconeCarregando(): SafeHtml {
    return this.iconesService.iconeCarregando;
  }

  get iconeCoroa(): SafeHtml {
    return this.iconesService.iconeCoroa;
  }

  obterJogadoresIds(rodada: HistoricoRodada): string[] {
    if (!rodada.votos) return [];
    return Object.keys(rodada.votos);
  }

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  trackById(index: number, jogadorId: string): string {
    return jogadorId;
  }
}
