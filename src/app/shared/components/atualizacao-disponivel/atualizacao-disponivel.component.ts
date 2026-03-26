import { Component, inject } from '@angular/core';

import { AtualizacaoService } from '../../../core/services/atualizacao.service';

@Component({
    selector: 'app-atualizacao-disponivel',
    imports: [],
    templateUrl: './atualizacao-disponivel.component.html'
})
export class AtualizacaoDisponivelComponent {
  atualizacaoService = inject(AtualizacaoService);

  atualizar(): void {
    this.atualizacaoService.atualizarParaNovaVersao();
  }
}
