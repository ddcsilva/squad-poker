import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Página não encontrada</h2>
      <p>A página que você está procurando não existe ou foi removida.</p>
      <a routerLink="/">Voltar para a página inicial</a>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        text-align: center;
        margin: 100px auto;
        max-width: 500px;
      }
      h1 {
        font-size: 80px;
        margin-bottom: 0;
        color: #3f51b5;
      }
      h2 {
        margin-top: 0;
        color: #666;
      }
      a {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #3f51b5;
        color: white;
        text-decoration: none;
        border-radius: 4px;
      }
    `,
  ],
})
export class NotFoundComponent {}
