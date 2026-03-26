import { Component, input, output } from '@angular/core';

import { ConfirmacaoModalComponent } from '../../../../shared/components/confirmacao-modal/confirmacao-modal.component';

@Component({
    selector: 'app-sala-remover-participante-modal',
    imports: [ConfirmacaoModalComponent],
    templateUrl: './sala-remover-participante-modal.component.html'
})
export class SalaRemoverParticipanteModalComponent {
  readonly visivel = input<boolean>(false);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
  readonly fechar = output<void>();
}
