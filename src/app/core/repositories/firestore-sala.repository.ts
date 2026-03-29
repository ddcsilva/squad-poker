import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, onSnapshot, runTransaction } from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';
import {
  SalaNaoEncontradaError,
  SalaEncerradaError,
} from '../errors/sala-errors';
import { Observable } from 'rxjs';
import { Sala, HistoricoRodada } from '../models/sala.model';
import { ISalaRepository } from '../interfaces/sala-repository.interface';

/**
 * Implementação do repositório de salas usando Firebase Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreSalaRepository implements ISalaRepository {
  private firestore = inject(Firestore);

  /**
   * Salva uma sala no Firestore
   */
  async salvar(sala: Sala): Promise<void> {
    try {
      const salaRef = doc(this.firestore, 'salas', sala.id);
      await setDoc(salaRef, sala, { merge: true });
    } catch (error) {
      console.error('Erro ao salvar sala:', error);
      throw new Error('Não foi possível salvar os dados da sala');
    }
  }

  /**
   * Busca uma sala pelo ID no Firestore
   */
  async buscarPorId(id: string): Promise<Sala | null> {
    try {
      const salaRef = doc(this.firestore, 'salas', id);
      const snapshot = await getDoc(salaRef);

      if (!snapshot.exists()) {
        return null;
      }

      return this.converterParaSala(snapshot.data() as Record<string, unknown>, id);
    } catch (error) {
      console.error('Erro ao buscar sala:', error);
      throw new Error('Não foi possível buscar a sala');
    }
  }

  /**
   * Adiciona um jogador à sala de forma atômica usando Firestore Transaction
   */
  async adicionarJogador(salaId: string, jogador: Usuario): Promise<Sala> {
    const salaRef = doc(this.firestore, 'salas', salaId);

    return runTransaction(this.firestore, async (transaction) => {
      const snapshot = await transaction.get(salaRef);

      if (!snapshot.exists()) {
        throw new SalaNaoEncontradaError(salaId);
      }

      const data = snapshot.data();

      if (data['status'] === 'encerrada') {
        throw new SalaEncerradaError();
      }

      const sala = this.converterParaSala(data, salaId);
      sala.jogadores.push(jogador);

      transaction.update(salaRef, { jogadores: sala.jogadores });

      return sala;
    });
  }

  /**
   * Cria um Observable que emite atualizações da sala em tempo real
   */
  observar(id: string): Observable<Sala> {
    const salaRef = doc(this.firestore, 'salas', id);

    return new Observable<Sala>(observer => {
      const unsubscribe = onSnapshot(
        salaRef,
        snapshot => {
          if (snapshot.exists()) {
            try {
              const sala = this.converterParaSala(snapshot.data() as Record<string, unknown>, id);
              observer.next(sala);
            } catch (error) {
              observer.error(new Error('Falha ao processar dados da sala'));
            }
          } else {
            observer.error(new Error('Sala não encontrada'));
          }
        },
        error => {
          console.error('Erro ao observar sala:', error);
          observer.error(new Error('Falha ao observar a sala'));
        }
      );

      // Retorna a função para cancelar a subscription
      return unsubscribe;
    });
  }

  /**
   * Converte dados brutos do Firestore para o modelo Sala com validação de shape
   */
  private converterParaSala(data: Record<string, unknown>, id: string): Sala {
    const criadaEm = this.converterTimestampParaDate(data['criadaEm']);

    const historicoRodadas: HistoricoRodada[] = Array.isArray(data['historicoRodadas'])
      ? data['historicoRodadas'].map((rodada: Record<string, unknown>) => ({
          numero: Number(rodada['numero'] ?? 0),
          descricao: String(rodada['descricao'] ?? ''),
          pontuacaoFinal: String(rodada['pontuacaoFinal'] ?? ''),
          votos: this.converterVotos(rodada['votos']),
          timestamp: this.converterTimestampParaDate(rodada['timestamp']),
        }))
      : [];

    return {
      id,
      nomeDono: String(data['nomeDono'] ?? ''),
      descricaoVotacao: String(data['descricaoVotacao'] ?? ''),
      jogadores: this.converterJogadores(data['jogadores']),
      status: data['status'] === 'encerrada' ? 'encerrada' : 'aguardando',
      votosRevelados: Boolean(data['votosRevelados']),
      rodadaAtual: Number(data['rodadaAtual'] ?? 1),
      historicoRodadas,
      criadaEm,
    };
  }

  /**
   * Converte e valida o array de jogadores do Firestore
   */
  private converterJogadores(jogadores: unknown): Usuario[] {
    if (!Array.isArray(jogadores)) return [];
    return jogadores
      .filter((j): j is Record<string, unknown> => j != null && typeof j === 'object')
      .map((j) => ({
        id: String(j['id'] ?? ''),
        nome: String(j['nome'] ?? ''),
        voto: j['voto'] != null ? String(j['voto']) : null,
        cor: String(j['cor'] ?? ''),
        tipo: j['tipo'] === 'espectador' ? 'espectador' as const : 'participante' as const,
      }));
  }

  /**
   * Converte e valida o mapa de votos de uma rodada
   */
  private converterVotos(votos: unknown): HistoricoRodada['votos'] {
    if (votos == null || typeof votos !== 'object') return {};
    const resultado: HistoricoRodada['votos'] = {};
    for (const [jogadorId, voto] of Object.entries(votos as Record<string, unknown>)) {
      if (voto != null && typeof voto === 'object') {
        const v = voto as Record<string, unknown>;
        resultado[jogadorId] = {
          valor: String(v['valor'] ?? ''),
          nome: String(v['nome'] ?? ''),
          cor: String(v['cor'] ?? ''),
        };
      }
    }
    return resultado;
  }

  /**
   * Converte um timestamp do Firestore para um objeto Date do JavaScript
   */
  private converterTimestampParaDate(timestamp: unknown): Date {
    if (!timestamp) return new Date();

    // Se já for uma data, retorna ela mesma
    if (timestamp instanceof Date) return timestamp;

    // Se for um timestamp do Firestore (tem propriedade seconds)
    if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp) {
      return new Date((timestamp as { seconds: number }).seconds * 1000);
    }

    // Tenta converter string ou number para Date
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }

    return new Date();
  }
}
