import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../core/services/animation.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  standalone: true,
  selector: 'app-card-poker',
  imports: [CommonModule],
  template: `
    <div
      class="card-poker"
      [class.selected]="selecionado"
      [class.disabled]="desabilitado"
      (click)="selecionarCarta()"
      [@cardVote]="selecionado ? 'selected' : 'unselected'"
    >
      <div class="card-value">{{ valor }}</div>
    </div>
  `,
  styles: [
    `
      .card-poker {
        width: 60px;
        height: 90px;
        background-color: white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        border: 2px solid #e0e0e0;
        position: relative;
      }

      .card-poker:hover:not(.disabled) {
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .card-value {
        font-size: 24px;
        font-weight: bold;
        color: #3f51b5;
      }

      .selected {
        background-color: #e8eaf6;
        border: 2px solid #3f51b5;
        box-shadow: 0 5px 15px rgba(63, 81, 181, 0.2);
      }

      .disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
  animations: [
    trigger('cardVote', [
      transition('* => selected', [
        animate(
          '200ms ease-out',
          style({ transform: 'translateY(-8px) scale(1.05)' })
        ),
      ]),
      transition('selected => *', [
        animate(
          '150ms ease-in',
          style({ transform: 'translateY(0) scale(1)' })
        ),
      ]),
    ]),
  ],
})
export class CardPokerComponent {
  @Input() valor: string = '';
  @Input() selecionado: boolean = false;
  @Input() desabilitado: boolean = false;
  @Output() selecionar = new EventEmitter<string>();

  constructor(private animationService: AnimationService) {}

  selecionarCarta() {
    if (!this.desabilitado) {
      this.selecionar.emit(this.valor);
    }
  }
}
