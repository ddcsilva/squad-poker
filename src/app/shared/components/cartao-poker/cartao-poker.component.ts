import { Component, inject, input, output } from '@angular/core';

import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../core/services/icones.service';

@Component({
    selector: 'app-cartao-poker',
    imports: [],
    templateUrl: './cartao-poker.component.html'
})
export class CartaoPokerComponent {
  private iconesService = inject(IconesService);

  readonly valor = input.required<string>();
  readonly selecionado = input(false);
  readonly desabilitado = input(false);
  readonly selecionar = output<string>();

  get iconeSelecionado(): SafeHtml {
    return this.iconesService.iconeSelecionado;
  }
}
