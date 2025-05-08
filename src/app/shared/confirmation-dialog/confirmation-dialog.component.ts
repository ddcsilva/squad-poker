import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="overlay" (click)="onCancelClick($event)">
      <div class="dialog-container" [@dialogAnimation]>
        <div class="dialog-content" (click)="stopPropagation($event)">
          <div class="dialog-header">
            <h2>{{ title }}</h2>
            <button class="close-button" (click)="onCancelClick($event)">
              ×
            </button>
          </div>
          <div class="dialog-body">
            <p>{{ message }}</p>
          </div>
          <div class="dialog-footer">
            <button class="btn secondary" (click)="onCancelClick($event)">
              {{ cancelButtonText }}
            </button>
            <button class="btn danger" (click)="onConfirmClick($event)">
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 500px;
        overflow: hidden;
      }

      .dialog-header {
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 18px;
        color: #3f51b5;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }

      .close-button:hover {
        color: #333;
      }

      .dialog-body {
        padding: 20px;
      }

      .dialog-body p {
        margin: 0;
        line-height: 1.5;
        color: #333;
      }

      .dialog-footer {
        padding: 15px 20px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
    `,
  ],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ opacity: 0, transform: 'scale(0.9)' })
        ),
      ]),
    ]),
  ],
})
export class ConfirmationDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmação';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Input() confirmButtonText = 'Sim';
  @Input() cancelButtonText = 'Não';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirmClick(event: MouseEvent): void {
    event.stopPropagation();
    this.confirm.emit();
  }

  onCancelClick(event: MouseEvent): void {
    event.stopPropagation();
    this.cancel.emit();
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
