import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Jogador } from '../models/usuario.model';

const LOCAL_STORAGE_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private usuarioSubject = new BehaviorSubject<Jogador | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor() {
    const json = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (json) {
      this.usuarioSubject.next(JSON.parse(json));
    }
  }

  definirUsuario(usuario: Jogador): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  get usuarioAtual(): Jogador | null {
    return this.usuarioSubject.value;
  }

  limparUsuario(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    this.usuarioSubject.next(null);
  }
}
