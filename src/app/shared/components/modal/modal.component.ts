import { Component, inject, input, output } from '@angular/core';

import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../core/services/icones.service';

@Component({
    selector: 'app-modal',
    imports: [],
    templateUrl: './modal.component.html'
})
export class ModalComponent {
  private iconesService = inject(IconesService);

  readonly visivel = input(false);
  readonly titulo = input('');
  readonly fechar = output<void>();

  get iconeFechar(): SafeHtml {
    return this.iconesService.iconeFechar;
  }

  fecharModal() {
    // TODO: The 'emit' function requires a mandatory void argument
    this.fechar.emit();
  }
}
