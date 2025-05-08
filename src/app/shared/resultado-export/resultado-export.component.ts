import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Jogador } from '../../core/models/usuario.model';

@Component({
  selector: 'app-resultado-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resultado-export-container">
      <div class="cabecalho">
        <div class="titulo">
          <h2>{{ tituloPrincipal }}</h2>
          <div class="codigo-sala">Código da sala: {{ codigoSala }}</div>
        </div>
        <div class="logo">SQUAD POKER</div>
      </div>

      <div class="descricao-votacao">
        <h3>{{ descricaoVotacao }}</h3>
      </div>

      <div class="media-final">
        <div class="media-card">
          <div class="media-valor">{{ mediaFinal }}</div>
          <div class="media-texto">Média Final</div>
        </div>
      </div>

      <div class="participantes-container">
        <div class="participantes-titulo">Participantes e Votos</div>
        <div class="cartoes-grid">
          <div
            *ngFor="let jogador of jogadores"
            class="participante-card"
            [class.sem-voto]="!jogador.voto"
          >
            <div
              class="participante-avatar"
              [style.backgroundColor]="jogador.cor"
            >
              {{ jogador.nome.charAt(0).toUpperCase() }}
            </div>
            <div class="participante-nome">{{ jogador.nome }}</div>
            <div
              class="participante-carta"
              [class.carta-especial]="isCartaEspecial(jogador.voto)"
            >
              {{ jogador.voto || '-' }}
            </div>
          </div>
        </div>
      </div>

      <div class="rodape">
        <div class="data">{{ dataExportacao | date : 'dd/MM/yyyy HH:mm' }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .resultado-export-container {
        background-color: white;
        padding: 20px;
        font-family: 'Roboto', sans-serif;
        border-radius: 8px;
        color: #333;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: 0 auto;
      }

      .cabecalho {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #3f51b5;
      }

      .titulo h2 {
        margin: 0;
        color: #3f51b5;
        font-size: 24px;
      }

      .codigo-sala {
        font-size: 12px;
        color: #757575;
        margin-top: 5px;
      }

      .logo {
        font-size: 18px;
        font-weight: bold;
        color: #3f51b5;
        padding: 8px;
        border: 2px solid #3f51b5;
        border-radius: 4px;
      }

      .descricao-votacao {
        margin-bottom: 20px;
        text-align: center;
      }

      .descricao-votacao h3 {
        margin: 0;
        color: #333;
        font-size: 20px;
        padding: 10px 15px;
        background-color: #f5f5f5;
        border-radius: 4px;
        display: inline-block;
      }

      .media-final {
        display: flex;
        justify-content: center;
        margin-bottom: 30px;
      }

      .media-card {
        background-color: #3f51b5;
        color: white;
        border-radius: 8px;
        padding: 15px 40px;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .media-valor {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .media-texto {
        font-size: 14px;
        text-transform: uppercase;
      }

      .participantes-container {
        margin-bottom: 20px;
      }

      .participantes-titulo {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 15px;
        color: #3f51b5;
        text-align: center;
      }

      .cartoes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
      }

      .participante-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px 10px;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .participante-avatar {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 10px;
      }

      .participante-nome {
        font-size: 14px;
        margin-bottom: 10px;
        text-align: center;
        font-weight: 500;
      }

      .participante-carta {
        width: 40px;
        height: 60px;
        background-color: white;
        border: 2px solid #3f51b5;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        color: #3f51b5;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .carta-especial {
        background-color: #e8eaf6;
      }

      .sem-voto .participante-carta {
        border-color: #ddd;
        color: #aaa;
      }

      .rodape {
        margin-top: 20px;
        border-top: 1px solid #eee;
        padding-top: 15px;
        font-size: 12px;
        color: #757575;
        text-align: right;
      }
    `,
  ],
})
export class ResultadoExportComponent {
  @Input() tituloPrincipal: string = 'Resultado da Votação';
  @Input() descricaoVotacao: string = '';
  @Input() codigoSala: string = '';
  @Input() mediaFinal: string = '';
  @Input() jogadores: Jogador[] = [];
  @Input() dataExportacao: Date = new Date();

  isCartaEspecial(voto: string | null): boolean {
    return voto === '?' || voto === '☕';
  }
}
