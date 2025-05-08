import {
  Component,
  OnDestroy,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';
import html2canvas from 'html2canvas';

import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { AnimationService } from '../../core/services/animation.service';
import { Sala, HistoricoRodada } from '../../core/models/sala.model';
import { Jogador } from '../../core/models/usuario.model';
import { UsuarioCardComponent } from '../../shared/usuario-card/usuario-card.component';
import { CardPokerComponent } from '../../shared/card-poker/card-poker.component';
import { ResultadoExportComponent } from '../../shared/resultado-export/resultado-export.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';

@Component({
  standalone: true,
  selector: 'app-sala',
  imports: [
    CommonModule,
    FormsModule,
    UsuarioCardComponent,
    CardPokerComponent,
    ResultadoExportComponent,
    ConfirmationDialogComponent,
  ],
  templateUrl: './sala.component.html',
  animations: [
    trigger('revealVotes', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(50, [
              animate(
                '200ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('newRound', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(20px)' })
        ),
      ]),
    ]),
    trigger('pageTransition', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class SalaComponent implements OnInit, OnDestroy {
  @ViewChild('exportContainer') exportContainer: ElementRef | undefined;
  @ViewChild('resultadoSessao') resultadoSessao: ElementRef | undefined;
  @ViewChild('detalheRodada') detalheRodada: ElementRef | undefined;

  sala: Sala | null = null;
  jogador: Jogador | null = null;
  subscription: Subscription | null = null;
  routerSubscription: Subscription | null = null;
  votoPendente: string | null = null;
  novaDescricao: string = '';
  cartasPoker: string[] = ['1', '2', '3', '5', '8', '13', '21', '?', '☕'];
  mostrarHistorico: boolean = false;
  rodadaSelecionada: HistoricoRodada | null = null;

  // Data atual para uso no template
  dataAtual = new Date();

  // Notificação de cópia
  mostrarNotificacaoCopia: boolean = false;

  // Configuração para exportação
  exportandoImagem: boolean = false;
  exibirAreaExportacao: boolean = false;
  dadosExportacao: {
    titulo: string;
    descricao: string;
    codigoSala: string;
    media: string;
    jogadores: Jogador[];
    data: Date;
  } | null = null;

  // Flag para controlar se estamos saindo após confirmação
  saidaConfirmada: boolean = false;

  // Diálogo de confirmação de saída
  mostrarDialogoSaida: boolean = false;
  destino: string | null = null;

  // Auxiliar para uso no template
  objectKeys = Object.keys;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salaService: SalaService,
    private usuarioService: UsuarioService,
    private animationService: AnimationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.jogador = this.usuarioService.usuarioAtual;
    if (!this.jogador) {
      this.router.navigate(['/']);
      return;
    }

    // Configura o listener para navegação interna do Angular
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: any) => {
        // Ignorar se estamos apenas atualizando a mesma rota
        if (event.url.includes(`/sala/${id}`)) {
          return;
        }

        // Se a votação estiver ativa e a saída não foi confirmada, bloquear navegação
        if (this.deveConfirmarAntesDeNavegar() && !this.saidaConfirmada) {
          event.preventDefault();
          this.destino = event.url;
          this.mostrarDialogoSaida = true;
        }
      });

    this.salaService.carregarSala(id).then(() => {
      this.sala = this.salaService.salaAtual;

      if (!this.sala) {
        this.router.navigate(['/']);
        return;
      }

      // Registra para atualizações em tempo real
      this.subscription = this.salaService.sala$.subscribe((sala) => {
        this.sala = sala;

        // Atualizar o voto do jogador atual caso tenha mudado remotamente
        if (this.sala && this.jogador) {
          const jogadorNaSala = this.sala.jogadores.find(
            (j) => j.id === this.jogador!.id
          );
          if (jogadorNaSala) {
            this.jogador.voto = jogadorNaSala.voto;
            this.jogador.tipo = jogadorNaSala.tipo;
          }
        }
      });

      // Adiciona jogador na sala se ainda não estiver
      if (
        this.sala &&
        !this.sala.jogadores.some((j) => j.id === this.jogador!.id)
      ) {
        this.sala.jogadores.push(this.jogador!);
        this.salaService.atualizarSala(this.sala);
      }
    });
  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    // Remover o jogador da sala se ele ainda estiver lá
    if (this.sala && this.jogador) {
      await this.removerJogadorDaSala();
    }

    this.salaService.destruirObservador();
  }

  async selecionarCarta(valor: string) {
    if (!this.sala || !this.jogador || this.sala.votosRevelados) return;

    // Espectadores não podem votar
    if (this.jogador.tipo === 'espectador') return;

    // Atualiza voto localmente primeiro
    this.votoPendente = valor;

    // Registra voto no servidor
    await this.salaService.registrarVoto(this.jogador.id, valor);
  }

  async revelarVotos() {
    if (!this.sala || !this.jogador) return;
    await this.salaService.revelarVotos();
  }

  async reiniciarVotacao() {
    if (!this.sala || !this.jogador) return;
    await this.salaService.ocultarVotos();

    // Limpar votos de todos os jogadores
    this.sala.jogadores.forEach((jogador) => {
      jogador.voto = null;
    });

    await this.salaService.atualizarSala(this.sala);
  }

  async proximaRodada() {
    if (!this.sala || !this.jogador || !this.novaDescricao.trim()) return;
    await this.salaService.iniciarNovaRodada(this.novaDescricao);
    this.novaDescricao = '';
  }

  async encerrarSala() {
    if (!this.sala || !this.jogador) return;
    if (confirm('Tem certeza que deseja encerrar esta sala?')) {
      await this.salaService.encerrarSala();
    }
  }

  async removerParticipante(jogadorId: string) {
    if (!this.sala || !this.ehDonoDaSala()) return;

    if (confirm('Tem certeza que deseja remover este participante?')) {
      // Filtra o jogador da lista
      this.sala.jogadores = this.sala.jogadores.filter(
        (j) => j.id !== jogadorId
      );

      // Atualiza a sala
      await this.salaService.atualizarSala(this.sala);
    }
  }

  voltarTelaInicial() {
    // Verificar se precisa confirmar antes de sair
    if (this.deveConfirmarAntesDeNavegar()) {
      this.destino = '/';
      this.mostrarDialogoSaida = true;
    } else {
      // Se não precisar confirmar, verifica se é o dono da sala
      if (this.sala && this.jogador) {
        // Verificar se o usuário é o dono da sala
        const ehDono = this.ehDonoDaSala();

        if (ehDono) {
          // Se for o dono, encerre a sala
          this.salaService.encerrarSala().then(() => {
            this.router.navigate(['/']);
          });
        } else {
          // Se não for o dono, apenas remova o jogador
          this.removerJogadorDaSala().then(() => {
            this.router.navigate(['/']);
          });
        }
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  // Métodos para o diálogo de confirmação
  confirmarSaida() {
    this.saidaConfirmada = true;
    this.mostrarDialogoSaida = false;

    // Verificar se o usuário é o dono da sala
    const ehDono = this.ehDonoDaSala();

    // Remover o jogador da sala antes de sair
    if (this.sala && this.jogador) {
      // Se o usuário é o dono da sala, encerre a sala completamente
      if (ehDono) {
        this.salaService.encerrarSala().then(() => {
          if (this.destino) {
            this.router.navigate([this.destino]);
          } else {
            this.router.navigate(['/']);
          }
        });
      } else {
        // Se não é o dono, apenas remove o jogador normalmente
        this.removerJogadorDaSala().then(() => {
          if (this.destino) {
            this.router.navigate([this.destino]);
          } else {
            this.router.navigate(['/']);
          }
        });
      }
    } else if (this.destino) {
      this.router.navigate([this.destino]);
    } else {
      this.router.navigate(['/']);
    }
  }

  cancelarSaida() {
    this.mostrarDialogoSaida = false;
    this.destino = null;
  }

  ehDonoDaSala(): boolean {
    return this.sala?.nomeDono === this.jogador?.nome;
  }

  ehEspectador(): boolean {
    return this.jogador?.tipo === 'espectador';
  }

  calcularResultadoVotos(): string {
    if (!this.sala || !this.sala.votosRevelados) return '';

    const votos = this.sala.jogadores
      .filter((j) => j.voto !== null)
      .map((j) => j.voto as string);

    if (votos.length === 0) return 'Nenhum voto';

    // Filtrar votos não numéricos para estatísticas
    const votosNumericos = votos.filter((v) => !['?', '☕'].includes(v));

    if (votosNumericos.length === 0) {
      return 'Sem consenso';
    }

    // Calcular estatísticas
    const valoresNumericos = votosNumericos.map((v) => parseInt(v));
    const media =
      valoresNumericos.reduce((a, b) => a + b, 0) / valoresNumericos.length;

    // Encontrar a moda (valor mais frequente)
    const contagem: { [key: string]: number } = {};
    let maxContagem = 0;
    let moda = '';

    votosNumericos.forEach((voto) => {
      contagem[voto] = (contagem[voto] || 0) + 1;
      if (contagem[voto] > maxContagem) {
        maxContagem = contagem[voto];
        moda = voto;
      }
    });

    return `Média: ${media.toFixed(1)} | Valor mais votado: ${moda}`;
  }

  /**
   * Calcula apenas a média numérica dos votos para uso em exportação
   */
  calcularMediaVotos(
    votos: { [jogadorId: string]: string } | Jogador[]
  ): string {
    let votosArray: string[] = [];

    if (Array.isArray(votos)) {
      // É um array de Jogador
      votosArray = votos
        .filter((j) => j.voto !== null)
        .map((j) => j.voto as string);
    } else {
      // É um objeto de votos do histórico
      votosArray = Object.values(votos);
    }

    if (votosArray.length === 0) return '-';

    // Filtrar votos não numéricos
    const votosNumericos = votosArray.filter((v) => !['?', '☕'].includes(v));

    if (votosNumericos.length === 0) return '?';

    // Calcular média
    const valoresNumericos = votosNumericos.map((v) => parseInt(v));
    const media =
      valoresNumericos.reduce((a, b) => a + b, 0) / valoresNumericos.length;

    return media.toFixed(1);
  }

  toggleHistorico() {
    this.mostrarHistorico = !this.mostrarHistorico;
  }

  selecionarRodada(rodada: HistoricoRodada) {
    this.rodadaSelecionada = rodada;
  }

  voltarDoHistorico() {
    this.rodadaSelecionada = null;
  }

  exibirIdTruncado(): string {
    if (!this.sala) return '';
    // Exibir apenas os primeiros 8 caracteres do ID
    return this.sala.id.substring(0, 8) + '...';
  }

  copiarCodigoSala() {
    if (!this.sala) return;

    navigator.clipboard
      .writeText(this.sala.id)
      .then(() => {
        // Mostrar notificação e escondê-la após 2 segundos
        this.mostrarNotificacaoCopia = true;
        setTimeout(() => {
          this.mostrarNotificacaoCopia = false;
        }, 2000);
      })
      .catch(() => {
        console.error('Não foi possível copiar o código');
      });
  }

  todosVotaram(): boolean {
    if (!this.sala) return false;

    // Apenas participantes ativos precisam votar (não espectadores)
    const participantes = this.sala.jogadores.filter(
      (j) => j.tipo === 'participante'
    );
    return participantes.every((j) => j.voto !== null);
  }

  obterNomeJogador(jogadorId: string): string {
    if (!this.sala) return '';
    const jogador = this.sala.jogadores.find((j) => j.id === jogadorId);
    return jogador?.nome || 'Jogador desconhecido';
  }

  /**
   * Exporta diretamente o resultado da sessão atual como imagem
   */
  async exportarResultadoAtual() {
    if (!this.sala) return;

    this.exportandoImagem = true;

    // Preparar os dados para a exportação
    const dadosExportacao = {
      titulo: 'Resultado da Votação',
      descricao: this.sala.descricaoVotacao,
      codigoSala: this.sala.id,
      media: this.calcularMediaVotos(this.sala.jogadores),
      jogadores: [...this.sala.jogadores],
      data: new Date(),
    };

    try {
      // Criar elemento temporário fora da visualização
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);

      // Separar participantes e espectadores
      const participantes = dadosExportacao.jogadores.filter(
        (j) => j.tipo === 'participante'
      );
      const espectadores = dadosExportacao.jogadores.filter(
        (j) => j.tipo === 'espectador'
      );

      // Renderizar o componente dinamicamente
      tempContainer.innerHTML = `
        <div class="resultado-export-container" style="background-color: white; padding: 20px; font-family: 'Roboto', sans-serif; border-radius: 8px; color: #333; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); width: 800px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3f51b5;">
            <div>
              <h2 style="margin: 0; color: #3f51b5; font-size: 24px;">${
                dadosExportacao.titulo
              }</h2>
              <div style="font-size: 12px; color: #757575; margin-top: 5px;">Código da sala: ${
                dadosExportacao.codigoSala
              }</div>
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #3f51b5; padding: 8px; border: 2px solid #3f51b5; border-radius: 4px;">♠️ SQUAD POKER</div>
          </div>

          <div style="margin-bottom: 20px; text-align: center;">
            <h3 style="margin: 0; color: #333; font-size: 20px; padding: 10px 15px; background-color: #f5f5f5; border-radius: 4px; display: inline-block;">${
              dadosExportacao.descricao
            }</h3>
          </div>

          <div style="display: flex; justify-content: center; margin-bottom: 30px;">
            <div style="background-color: #3f51b5; color: white; border-radius: 8px; padding: 15px 40px; text-align: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 5px;">${
                dadosExportacao.media
              }</div>
              <div style="font-size: 14px; text-transform: uppercase;">Média Final</div>
            </div>
          </div>

          ${
            participantes.length > 0
              ? `
          <div style="margin-bottom: 20px;">
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 15px; color: #3f51b5; text-align: center;">Participantes e Votos</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
              ${participantes
                .map(
                  (j) => `
                <div style="display: flex; flex-direction: column; align-items: center; padding: 15px 10px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                  <div style="width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; margin-bottom: 10px; background-color: ${
                    j.cor
                  };">
                    ${j.nome.charAt(0).toUpperCase()}
                  </div>
                  <div style="font-size: 14px; margin-bottom: 10px; text-align: center; font-weight: 500;">${
                    j.nome
                  }</div>
                  <div style="width: 40px; height: 60px; background-color: white; border: 2px solid ${
                    j.voto ? '#3f51b5' : '#ddd'
                  }; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: ${
                    j.voto ? '#3f51b5' : '#aaa'
                  }; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    ${j.voto || '-'}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
          `
              : ''
          }

          ${
            espectadores.length > 0
              ? `
          <div style="margin-bottom: 20px;">
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 15px; color: #757575; text-align: center;">Espectadores</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
              ${espectadores
                .map(
                  (j) => `
                <div style="display: flex; flex-direction: column; align-items: center; padding: 15px 10px; background-color: #f5f5f5; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                  <div style="width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; margin-bottom: 10px; background-color: ${
                    j.cor
                  };">
                    ${j.nome.charAt(0).toUpperCase()}
                  </div>
                  <div style="font-size: 14px; margin-bottom: 10px; text-align: center; font-weight: 500;">${
                    j.nome
                  } <span style="font-size: 10px; color: #757575;">(Espectador)</span></div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
          `
              : ''
          }

          <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #757575; text-align: right;">
            <div>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div>Desenvolvido por Danilo Silva</div>
          </div>
        </div>
      `;

      // Capturar a imagem
      const element = tempContainer;
      const canvas = await html2canvas(element, {
        backgroundColor: '#fff',
        scale: 2, // melhor qualidade
        logging: false,
      });

      // Criar nome de arquivo
      const descricao =
        dadosExportacao.descricao.replace(/[^a-zA-Z0-9]/g, '_') || 'votacao';
      const dataHora = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .substring(0, 19);
      const filename = `squad_poker_${descricao.substring(
        0,
        30
      )}_${dataHora}.png`;

      // Download da imagem
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();

      // Limpar
      document.body.removeChild(link);
      document.body.removeChild(tempContainer);
    } catch (err) {
      console.error('Erro ao exportar imagem:', err);
      alert('Erro ao gerar a imagem. Por favor, tente novamente.');
    } finally {
      this.exportandoImagem = false;
    }
  }

  /**
   * Exporta diretamente a rodada do histórico como imagem
   */
  async exportarRodadaHistorico() {
    if (!this.sala || !this.rodadaSelecionada) return;

    this.exportandoImagem = true;

    // Converter votos da rodada histórica para uma lista de jogadores com votos
    const jogadoresComVotos: Jogador[] = this.sala.jogadores.map((j) => {
      return {
        ...j,
        voto: this.rodadaSelecionada?.votos[j.id] || null,
      };
    });

    // Separar participantes e espectadores
    const participantes = jogadoresComVotos.filter(
      (j) => j.tipo === 'participante'
    );
    const espectadores = jogadoresComVotos.filter(
      (j) => j.tipo === 'espectador'
    );

    // Preparar os dados para a exportação
    const dadosExportacao = {
      titulo: `Rodada ${this.rodadaSelecionada.numero}`,
      descricao: this.rodadaSelecionada.descricao,
      codigoSala: this.sala.id,
      media: this.rodadaSelecionada.resultado || '-',
      jogadores: jogadoresComVotos,
      data: this.rodadaSelecionada.timestamp,
    };

    try {
      // Criar elemento temporário fora da visualização
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);

      // Renderizar o componente dinamicamente (mesmo HTML que a função anterior)
      tempContainer.innerHTML = `
        <div class="resultado-export-container" style="background-color: white; padding: 20px; font-family: 'Roboto', sans-serif; border-radius: 8px; color: #333; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); width: 800px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3f51b5;">
            <div>
              <h2 style="margin: 0; color: #3f51b5; font-size: 24px;">${
                dadosExportacao.titulo
              }</h2>
              <div style="font-size: 12px; color: #757575; margin-top: 5px;">Código da sala: ${
                dadosExportacao.codigoSala
              }</div>
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #3f51b5; padding: 8px; border: 2px solid #3f51b5; border-radius: 4px;">♠️ SQUAD POKER</div>
          </div>

          <div style="margin-bottom: 20px; text-align: center;">
            <h3 style="margin: 0; color: #333; font-size: 20px; padding: 10px 15px; background-color: #f5f5f5; border-radius: 4px; display: inline-block;">${
              dadosExportacao.descricao
            }</h3>
          </div>

          <div style="display: flex; justify-content: center; margin-bottom: 30px;">
            <div style="background-color: #3f51b5; color: white; border-radius: 8px; padding: 15px 40px; text-align: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 5px;">${
                dadosExportacao.media
              }</div>
              <div style="font-size: 14px; text-transform: uppercase;">Média Final</div>
            </div>
          </div>

          ${
            participantes.length > 0
              ? `
          <div style="margin-bottom: 20px;">
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 15px; color: #3f51b5; text-align: center;">Participantes e Votos</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
              ${participantes
                .map(
                  (j) => `
                <div style="display: flex; flex-direction: column; align-items: center; padding: 15px 10px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                  <div style="width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; margin-bottom: 10px; background-color: ${
                    j.cor
                  };">
                    ${j.nome.charAt(0).toUpperCase()}
                  </div>
                  <div style="font-size: 14px; margin-bottom: 10px; text-align: center; font-weight: 500;">${
                    j.nome
                  }</div>
                  <div style="width: 40px; height: 60px; background-color: white; border: 2px solid ${
                    j.voto ? '#3f51b5' : '#ddd'
                  }; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: ${
                    j.voto ? '#3f51b5' : '#aaa'
                  }; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    ${j.voto || '-'}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
          `
              : ''
          }

          ${
            espectadores.length > 0
              ? `
          <div style="margin-bottom: 20px;">
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 15px; color: #757575; text-align: center;">Espectadores</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
              ${espectadores
                .map(
                  (j) => `
                <div style="display: flex; flex-direction: column; align-items: center; padding: 15px 10px; background-color: #f5f5f5; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                  <div style="width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; margin-bottom: 10px; background-color: ${
                    j.cor
                  };">
                    ${j.nome.charAt(0).toUpperCase()}
                  </div>
                  <div style="font-size: 14px; margin-bottom: 10px; text-align: center; font-weight: 500;">${
                    j.nome
                  } <span style="font-size: 10px; color: #757575;">(Espectador)</span></div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
          `
              : ''
          }

          <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #757575; text-align: right;">
            <div>${new Date(
              dadosExportacao.data
            ).toLocaleDateString()} ${new Date(
        dadosExportacao.data
      ).toLocaleTimeString()}</div>
            <div>Made with ❤️ by Danilo Silva</div>
          </div>
        </div>
      `;

      // Capturar a imagem
      const element = tempContainer;
      const canvas = await html2canvas(element, {
        backgroundColor: '#fff',
        scale: 2, // melhor qualidade
        logging: false,
      });

      // Criar nome de arquivo
      const descricao =
        dadosExportacao.descricao.replace(/[^a-zA-Z0-9]/g, '_') || 'rodada';
      const dataHora = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .substring(0, 19);
      const rodadaNum = this.rodadaSelecionada.numero;
      const filename = `rodada_${rodadaNum}_${descricao.substring(
        0,
        20
      )}_${dataHora}.png`;

      // Download da imagem
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();

      // Limpar
      document.body.removeChild(link);
      document.body.removeChild(tempContainer);
    } catch (err) {
      console.error('Erro ao exportar imagem da rodada:', err);
      alert('Erro ao gerar a imagem. Por favor, tente novamente.');
    } finally {
      this.exportandoImagem = false;
    }
  }

  // Métodos não utilizados agora que temos exportação direta
  prepararExportacaoSessaoAtual() {
    this.exportarResultadoAtual();
  }

  prepararExportacaoHistorico() {
    this.exportarRodadaHistorico();
  }

  async exportarComoImagem() {
    // Não usamos mais este método
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    // Verificar se deve mostrar a mensagem de confirmação
    if (this.deveConfirmarAntesDeNavegar()) {
      // Esta é a mensagem padrão que a maioria dos navegadores exibirá
      const message =
        'Há uma votação em andamento. Tem certeza que deseja sair?';

      // Para navegadores mais antigos (necessário converter para BeforeUnloadEvent para acessar returnValue)
      (event as BeforeUnloadEvent).returnValue = message;

      // Verificar se o usuário é o dono da sala
      const ehDono = this.ehDonoDaSala();

      // Remover o jogador da sala sincronamente o melhor que pudermos
      if (this.sala && this.jogador) {
        if (ehDono) {
          // Se for o dono, encerre a sala
          this.sala.status = 'encerrada';
          this.salaService.atualizarSala(this.sala);
        } else {
          // Se não for o dono, apenas remova o jogador
          this.sala.jogadores = this.sala.jogadores.filter(
            (j) => j.id !== this.jogador!.id
          );
          this.salaService.atualizarSala(this.sala);
        }
      }

      return message; // Para navegadores mais antigos
    }

    // Se não precisar confirmar, apenas remove o jogador da sala ou encerra se for o dono
    if (this.sala && this.jogador) {
      // Verificar se o usuário é o dono da sala
      const ehDono = this.ehDonoDaSala();

      if (ehDono) {
        // Se for o dono, encerre a sala
        this.sala.status = 'encerrada';
        this.salaService.atualizarSala(this.sala);
      } else {
        // Se não for o dono, apenas remova o jogador
        this.sala.jogadores = this.sala.jogadores.filter(
          (j) => j.id !== this.jogador!.id
        );
        this.salaService.atualizarSala(this.sala);
      }
    }

    // Retorna undefined para não mostrar a confirmação em navegadores mais antigos
    return undefined;
  }

  /**
   * Verifica se deve mostrar a confirmação de saída
   * Considera que uma votação está ativa quando:
   * - A sala está aberta (status = 'aguardando')
   * - O jogador é participante (não espectador)
   * - O jogador já votou ou os votos não foram revelados
   */
  deveConfirmarAntesDeNavegar(): boolean {
    if (!this.sala || !this.jogador) {
      return false;
    }

    const salaAberta = this.sala.status === 'aguardando';
    const ehParticipante = this.jogador.tipo === 'participante';
    const votacaoEmAndamento = !this.sala.votosRevelados;
    const jogadorVotou = this.jogador.voto !== null;

    // Deve confirmar se a sala está aberta, o usuário é participante,
    // e a votação está em andamento (ou o jogador já votou)
    return salaAberta && ehParticipante && (votacaoEmAndamento || jogadorVotou);
  }

  // Método auxiliar para remover o jogador da sala
  private async removerJogadorDaSala(): Promise<void> {
    if (this.sala && this.jogador) {
      // Filtra o jogador atual da lista
      this.sala.jogadores = this.sala.jogadores.filter(
        (j) => j.id !== this.jogador!.id
      );

      // Tenta atualizar a sala no servidor
      try {
        await this.salaService.atualizarSala(this.sala);
      } catch (err) {
        console.error('Erro ao remover jogador da sala:', err);
      }
    }
  }
}
