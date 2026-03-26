import { Component, input, output } from '@angular/core';

import { SalaBotoesAcaoComponent } from '../sala-botoes-acao/sala-botoes-acao.component';

@Component({
    selector: 'app-sala-painel-moderacao',
    imports: [SalaBotoesAcaoComponent],
    templateUrl: './sala-painel-moderacao.component.html'
})
export class SalaPainelModeracaoComponent {
  readonly ehModerador = input<boolean>(false);
  readonly votosRevelados = input<boolean>(false);
  readonly descricaoNovaRodada = input<string>('');
  readonly processando = input<boolean>(false);
  readonly temEmpate = input<boolean>(false);
  readonly participantesQueVotaram = input<number>(0);
  readonly totalParticipantes = input<number>(0); // 🆕 Novo input

  readonly revelarVotos = output<void>();
  readonly reiniciarVotacao = output<void>();
  readonly descricaoMudou = output<string>();
  readonly criarNovaRodada = output<void>();
  readonly encerrarSala = output<void>();
}
