import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Jogador } from '../../core/models/usuario.model';

import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  selector: 'app-entrada',
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada.component.html',
})
export class EntradaComponent {
  nomeJogador = '';
  descricaoVotacao = '';
  mostrarCampoSala = false;
  codigoSala = '';
  tipoUsuario: 'participante' | 'espectador' = 'participante';

  constructor(
    private salaService: SalaService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  async criarSala() {
    if (!this.nomeJogador.trim() || !this.descricaoVotacao.trim()) {
      return;
    }

    const jogador: Jogador = {
      id: uuidv4(),
      nome: this.nomeJogador,
      voto: null,
      cor: this.gerarCorAleatoria(),
      tipo: this.tipoUsuario,
    };

    const sala = await this.salaService.criarSala(
      jogador.nome,
      this.descricaoVotacao
    );
    this.usuarioService.definirUsuario(jogador);
    this.router.navigate(['/sala', sala.id]);
  }

  alternarModoEntrada() {
    this.mostrarCampoSala = !this.mostrarCampoSala;
  }

  async entrarEmSala() {
    if (!this.nomeJogador.trim() || !this.codigoSala.trim()) {
      return;
    }

    try {
      await this.salaService.carregarSala(this.codigoSala);

      if (!this.salaService.salaAtual) {
        throw new Error('Sala não encontrada');
      }

      const jogador: Jogador = {
        id: uuidv4(),
        nome: this.nomeJogador,
        voto: null,
        cor: this.gerarCorAleatoria(),
        tipo: this.tipoUsuario,
      };

      this.usuarioService.definirUsuario(jogador);
      this.router.navigate(['/sala', this.codigoSala]);
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      alert('Erro ao entrar na sala. Verifique o código e tente novamente.');
    }
  }

  private gerarCorAleatoria(): string {
    const cores = [
      '#E57373',
      '#64B5F6',
      '#81C784',
      '#FFD54F',
      '#BA68C8',
      '#9575CD',
      '#4DB6AC',
      '#FF8A65',
      '#F06292',
      '#7986CB',
    ];
    return cores[Math.floor(Math.random() * cores.length)];
  }
}
