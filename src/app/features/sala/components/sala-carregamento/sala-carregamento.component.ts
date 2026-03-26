import { Component, inject, input, output } from '@angular/core';

import { Router } from '@angular/router';

@Component({
    selector: 'app-sala-loading',
    imports: [],
    templateUrl: './sala-carregamento.component.html'
})
export class SalaCarregamentoComponent {
  readonly carregando = input<boolean>(false);
  readonly erro = input<string | null>(null);

  readonly voltar = output<void>();

  router = inject(Router);
}
