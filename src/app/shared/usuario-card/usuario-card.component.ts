import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Jogador } from '../../core/models/usuario.model';
import { AnimationService } from '../../core/services/animation.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  standalone: true,
  selector: 'app-usuario-card',
  imports: [CommonModule],
  templateUrl: './usuario-card.component.html',
  styleUrls: ['./usuario-card.component.css'],
  animations: [
    trigger('revealVotes', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class UsuarioCardComponent {
  @Input() jogador!: Jogador;
  @Input() votosRevelados: boolean = false;
  @Input() ehDono: boolean = false;
  @Input() podeRemover: boolean = false;
  @Input() nomeDono: string = '';

  @Output() remover = new EventEmitter<string>();

  constructor(private animationService: AnimationService) {}

  removerUsuario() {
    this.remover.emit(this.jogador.id);
  }
}
