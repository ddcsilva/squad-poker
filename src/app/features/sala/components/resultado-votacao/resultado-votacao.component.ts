import { Component, inject, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../core/services/icones.service';
import { VotoValidators } from '../../../../core/validators/voto.validators';

@Component({
    selector: 'app-resultado-votacao',
    imports: [NgClass],
    templateUrl: './resultado-votacao.component.html'
})
export class ResultadoVotacaoComponent {
  private iconesService = inject(IconesService);

  readonly jogadores = input<Usuario[]>([]);
  readonly nomeDono = input<string>('');
  readonly ehModerador = input<boolean>(false);
  readonly pontuacaoFinal = input<string>('');
  readonly temEmpate = input<boolean>(false);
  readonly valorMaisVotado = input<string>('-');
  readonly contagemMaisVotado = input<number>(0);
  readonly totalVotosValidos = input<number>(0);
  readonly valoresEmpatados = input<string[]>([]);

  readonly pontuacaoFinalMudou = output<string>();

  get iconeCoroa(): SafeHtml {
    return this.iconesService.iconeCoroa;
  }

  trackById(index: number, jogador: Usuario): string {
    return jogador.id;
  }

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  obterClasseContainerResultado(): string {
    if (this.temEmpate()) {
      return 'bg-yellow-50 border-yellow-100';
    }
    return 'bg-green-50 border-green-100';
  }

  obterClasseCartaVotada(jogador: Usuario): object {
    if (!jogador.voto) return {};

    return {
      'bg-yellow-50': this.temEmpate() && this.valoresEmpatados().includes(jogador.voto),
      'border-yellow-500': this.temEmpate() && this.valoresEmpatados().includes(jogador.voto),
      'bg-green-50': !this.temEmpate() && jogador.voto === this.valorMaisVotado(),
      'border-green-500': !this.temEmpate() && jogador.voto === this.valorMaisVotado(),
    };
  }

  calcularPorcentagemMaisVotado(): string {
    const totalVotosValidos = this.totalVotosValidos();
    if (totalVotosValidos === 0) return '0';
    const percentual = (this.contagemMaisVotado() / totalVotosValidos) * 100;
    return percentual.toFixed(0);
  }

  aoPontuacaoFinalMudada(event: Event): void {
    // 1. Obter o valor do input
    const input = event.target as HTMLInputElement;

    // 2. Validar o valor
    const resultadoValidacao = VotoValidators.validarPontuacaoFinal(input.value);

    // 3. Emitir o valor se for válido
    if (resultadoValidacao.valido) {
      this.pontuacaoFinalMudou.emit(resultadoValidacao.valorSanitizado || '');
    } else {
      console.warn('Pontuação inválida:', resultadoValidacao.erro);
    }
  }
}
