import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { ConfirmacaoModalComponent } from '../../../../shared/components/confirmacao-modal/confirmacao-modal.component';

@Component({
    selector: 'app-cabecalho-sala',
    imports: [NgClass, ConfirmacaoModalComponent],
    templateUrl: './cabecalho-sala.component.html'
})
export class CabecalhoSalaComponent {
  readonly codigoSala = input<string>('');
  readonly usuario = input<Usuario | null>(null);
  readonly status = input<'aguardando' | 'encerrada'>('aguardando');
  readonly descricaoVotacao = input<string>('');
  readonly copiado = input<boolean>(false);
  readonly ehDono = input<boolean>(false);

  readonly copiarCodigo = output<void>();
  readonly sair = output<void>();

  // Estado do modal
  modalSairVisivel = false;

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  aoCopiarCodigo(): void {
    navigator.clipboard
      .writeText(this.codigoSala())
      .then(() => {
        this.vibrarDispositivo(100);
        // TODO: The 'emit' function requires a mandatory void argument
        this.copiarCodigo.emit();
      })
      .catch(error => {
        this.vibrarDispositivo(200);
        console.error('Erro ao copiar código:', error);
        this.mostrarCodigoParaCopia();
      });
  }

  // Método para abrir o modal quando o botão "Sair" é clicado
  abrirModalSair(): void {
    this.modalSairVisivel = true;
  }

  // Método para fechar o modal sem ação
  fecharModalSair(): void {
    this.modalSairVisivel = false;
  }

  // Método chamado quando a saída é confirmada no modal
  confirmarSair(): void {
    this.modalSairVisivel = false;
    // TODO: The 'emit' function requires a mandatory void argument
    this.sair.emit();
  }

  // Mensagem contextual para o modal
  obterMensagemSair(): string {
    if (this.ehDono()) {
      return 'Você é o dono desta sala. Sair irá ENCERRAR a sala para todos os participantes. Deseja continuar?';
    }
    return 'Tem certeza que deseja sair desta sala? Você será removido da lista de participantes.';
  }

  // Tipo de botão para o modal
  obterTipoBotaoSair(): 'primario' | 'perigo' | 'sucesso' {
    return this.ehDono() ? 'perigo' : 'primario';
  }

  private vibrarDispositivo(duracao: number): void {
    if (
      'vibrate' in navigator &&
      navigator.vibrate &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ) {
      try {
        navigator.vibrate(duracao);
      } catch (error) {
        // Fail silently
      }
    }
  }

  private mostrarCodigoParaCopia(): void {
    const textoTemp = document.createElement('textarea');
    textoTemp.value = `Squad Poker - Código da Sala: ${this.codigoSala()}`;
    document.body.appendChild(textoTemp);
    textoTemp.select();
    document.body.removeChild(textoTemp);
    alert(`📋 Código da sala: ${this.codigoSala()}`);
  }
}
