import { Component, input, output } from '@angular/core';


@Component({
    selector: 'app-sala-alternar-layout',
    imports: [],
    templateUrl: './sala-alternar-layout.component.html'
})
export class SalaAlternarLayoutComponent {
  readonly mostrandoHistorico = input<boolean>(false);
  readonly alternarVisualizacao = output<boolean>();
}
