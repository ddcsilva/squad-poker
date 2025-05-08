import { Injectable, inject } from '@angular/core';
import { Sala, HistoricoRodada } from '../models/sala.model';
import { Jogador } from '../models/usuario.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class SalaService {
  private firebase = inject(FirebaseService);
  private salaSubject = new BehaviorSubject<Sala | null>(null);
  private salaSubscription: Subscription | null = null;

  sala$ = this.salaSubject.asObservable();

  async criarSala(nomeDono: string, descricao: string): Promise<Sala> {
    const novaSala: Sala = {
      id: uuidv4(),
      nomeDono,
      descricaoVotacao: descricao,
      jogadores: [],
      status: 'aguardando',
      votosRevelados: false,
      rodadaAtual: 1,
      historicoRodadas: [],
      criadaEm: new Date(),
    };
    await this.firebase.salvarSala(novaSala);
    this.salaSubject.next(novaSala);
    return novaSala;
  }

  async carregarSala(id: string): Promise<void> {
    const sala = await this.firebase.buscarSala(id);
    if (sala) {
      this.salaSubject.next(sala);

      // Cancelar qualquer inscrição anterior
      if (this.salaSubscription) {
        this.salaSubscription.unsubscribe();
      }

      // Observar mudanças na sala em tempo real
      this.salaSubscription = this.firebase
        .observarSala(id)
        .subscribe((salaAtualizada) => {
          if (salaAtualizada) {
            this.salaSubject.next(salaAtualizada as Sala);
          }
        });
    }
  }

  async atualizarSala(sala: Sala): Promise<void> {
    await this.firebase.salvarSala(sala);
    this.salaSubject.next(sala);
  }

  async registrarVoto(jogadorId: string, voto: string): Promise<void> {
    const sala = this.salaSubject.value;
    if (!sala) return;

    const jogador = sala.jogadores.find((j) => j.id === jogadorId);
    if (jogador) {
      jogador.voto = voto;
      await this.atualizarSala(sala);
    }
  }

  async revelarVotos(): Promise<void> {
    const sala = this.salaSubject.value;
    if (!sala) return;

    sala.votosRevelados = true;
    await this.atualizarSala(sala);
  }

  async ocultarVotos(): Promise<void> {
    const sala = this.salaSubject.value;
    if (!sala) return;

    sala.votosRevelados = false;
    await this.atualizarSala(sala);
  }

  async iniciarNovaRodada(descricao: string): Promise<void> {
    const sala = this.salaSubject.value;
    if (!sala) return;

    // Salvar rodada atual no histórico
    if (sala.votosRevelados) {
      const rodadaAtual: HistoricoRodada = {
        numero: sala.rodadaAtual,
        descricao: sala.descricaoVotacao,
        votos: {},
        timestamp: new Date(),
      };

      // Coletar todos os votos
      sala.jogadores.forEach((jogador) => {
        if (jogador.voto !== null) {
          rodadaAtual.votos[jogador.id] = jogador.voto;
        }
      });

      // Determinar o resultado (moda dos votos)
      const resultado = this.calcularResultadoRodada(rodadaAtual.votos);
      rodadaAtual.resultado = resultado;

      sala.historicoRodadas.push(rodadaAtual);
    }

    // Iniciar nova rodada
    sala.rodadaAtual++;
    sala.descricaoVotacao = descricao;
    sala.votosRevelados = false;

    // Limpar votos
    sala.jogadores.forEach((jogador) => {
      jogador.voto = null;
    });

    await this.atualizarSala(sala);
  }

  async encerrarSala(): Promise<void> {
    const sala = this.salaSubject.value;
    if (!sala) return;

    sala.status = 'encerrada';
    await this.atualizarSala(sala);
  }

  private calcularResultadoRodada(votos: {
    [jogadorId: string]: string;
  }): string {
    const votosArray = Object.values(votos);
    if (votosArray.length === 0) return '-';

    // Ignorar votos especiais (?, ☕) no cálculo
    const votosNumericos = votosArray.filter((v) => !['?', '☕'].includes(v));

    if (votosNumericos.length === 0) return '?';

    // Calcular a média dos votos numéricos
    const valoresNumericos = votosNumericos.map((v) => parseInt(v));
    const soma = valoresNumericos.reduce((a, b) => a + b, 0);
    const media = soma / valoresNumericos.length;

    // Arredondar para uma casa decimal
    return media.toFixed(1);
  }

  get salaAtual(): Sala | null {
    return this.salaSubject.value;
  }

  destruirObservador() {
    if (this.salaSubscription) {
      this.salaSubscription.unsubscribe();
      this.salaSubscription = null;
    }
  }
}
