import { Component, inject, input } from '@angular/core';

import { Usuario } from '../../../../core/models/usuario.model';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../core/services/icones.service';

@Component({
    selector: 'app-status-votacao',
    imports: [],
    templateUrl: './status-votacao.component.html'
})
export class StatusVotacaoComponent {
  private iconesService = inject(IconesService);

  readonly numeroRodada = input<number>(1);
  readonly usuario = input<Usuario | null>(null);
  readonly votosRevelados = input<boolean>(false);

  get iconeVotou(): SafeHtml {
    return this.iconesService.iconeVotou;
  }

  get iconeAguardando(): SafeHtml {
    return this.iconesService.iconeAguardando;
  }

  get iconeEspectador(): SafeHtml {
    return this.iconesService.iconeEspectador;
  }

  get iconeResultados(): SafeHtml {
    return this.iconesService.iconeResultados;
  }
}
