import { Observable } from 'rxjs';
import { Sala } from '../models/sala.model';
import { Usuario } from '../models/usuario.model';

/**
 * Interface para o repositório de salas
 */
export interface ISalaRepository {
  /**
   * Salva uma sala no repositório
   * @param sala Sala a ser salva
   */
  salvar(sala: Sala): Promise<void>;

  /**
   * Busca uma sala pelo ID
   * @param id ID da sala
   * @returns Sala encontrada ou null se não existir
   */
  buscarPorId(id: string): Promise<Sala | null>;

  /**
   * Adiciona um jogador à sala de forma atômica
   * @param salaId ID da sala
   * @param jogador Jogador a ser adicionado
   * @returns Sala atualizada com o novo jogador
   */
  adicionarJogador(salaId: string, jogador: Usuario): Promise<Sala>;

  /**
   * Observable que emite atualizações da sala em tempo real
   * @param id ID da sala a ser observada
   * @returns Observable da sala
   */
  observar(id: string): Observable<Sala>;
}
