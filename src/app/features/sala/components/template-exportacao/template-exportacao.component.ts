import { Component, ElementRef, input, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-template-exportacao',
    imports: [DatePipe],
    templateUrl: './template-exportacao.component.html',
    styles: [
        `
      .template-invisivel {
        position: fixed;
        top: 0;
        left: 0;
        visibility: hidden;
        opacity: 0;
        z-index: -9999;
        pointer-events: none;
      }

      .template-visivel {
        position: fixed;
        top: 0;
        left: 0;
        opacity: 0;
        z-index: 9999;
        pointer-events: none;
      }
    `,
    ]
})
export class TemplateExportacaoComponent {
  readonly templateContainer = viewChild.required<ElementRef>('templateContainer');

  readonly numeroRodada = input<number>(1);
  readonly descricaoRodada = input<string>('');
  readonly pontuacaoFinal = input<string>('');
  readonly participantes = input<{
    id: string;
    nome: string;
    voto: string | null;
    cor: string;
    tipo: 'participante' | 'espectador';
}[]>([]);
  readonly codigoSala = input<string>('');
  readonly dataRodada = input<Date>(new Date());
  readonly visivel = input<boolean>(false);

  // Métodos auxiliares
  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  // Filtra apenas participantes com direito a voto
  get apenasParticipantes() {
    return this.participantes().filter(p => p.tipo === 'participante');
  }

  // Filtra apenas espectadores
  get apenasEspectadores() {
    return this.participantes().filter(p => p.tipo === 'espectador');
  }
}
