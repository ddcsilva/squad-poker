import { Component, inject, input, output } from '@angular/core';

import { trigger, transition, style, animate } from '@angular/animations';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../core/services/icones.service';

@Component({
    selector: 'app-sala-encerrada',
    imports: [],
    templateUrl: './sala-encerrada.component.html',
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ]),
    ]
})
export class SalaEncerradaComponent {
  private iconesService = inject(IconesService);

  readonly titulo = input<string>('Sala Encerrada');
  readonly mensagem = input<string>('Esta sala foi encerrada pelo moderador.\nObrigado por participar!');
  readonly mostrarBotaoVoltar = input<boolean>(false);

  readonly voltar = output<void>();

  get iconeEncerrado(): SafeHtml {
    return this.iconesService.iconeEncerrado;
  }

  aoVoltar(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.voltar.emit();
  }
}
