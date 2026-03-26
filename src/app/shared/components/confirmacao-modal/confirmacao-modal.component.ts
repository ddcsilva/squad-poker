import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-confirmacao-modal',
    imports: [NgClass],
    templateUrl: './confirmacao-modal.component.html'
})
export class ConfirmacaoModalComponent {
  readonly visivel = input<boolean>(false);
  readonly titulo = input<string>('Confirmação');
  readonly mensagem = input<string>('Tem certeza que deseja prosseguir?');
  readonly textoBotaoConfirmar = input<string>('Confirmar');
  readonly textoBotaoCancelar = input<string>('Cancelar');
  readonly tipoBotaoConfirmar = input<'primario' | 'perigo' | 'sucesso'>('primario');

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
  readonly fechar = output<void>();

  obterClasseBotaoConfirmar(): string {
    const base = 'w-full sm:w-auto px-4 py-2 text-white rounded-md transition-colors sm:order-2';

    const tipoBotaoConfirmar = this.tipoBotaoConfirmar();
    if (tipoBotaoConfirmar === 'perigo') {
      return `${base} bg-red-600 hover:bg-red-700`;
    } else if (tipoBotaoConfirmar === 'sucesso') {
      return `${base} bg-green-600 hover:bg-green-700`;
    } else {
      return `${base} bg-poker-blue hover:bg-blue-700`;
    }
  }

  aoConfirmar(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.confirmar.emit();
  }

  aoCancelar(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.cancelar.emit();
  }

  aoFechar(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.fechar.emit();
  }
}
