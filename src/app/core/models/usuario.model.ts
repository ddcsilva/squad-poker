export interface Jogador {
  id: string;
  nome: string;
  voto: string | null;
  cor: string;
  tipo: 'participante' | 'espectador';
}
