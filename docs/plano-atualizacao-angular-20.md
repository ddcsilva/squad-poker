# Plano de Atualização — Angular 18 → Angular 20

## Resumo Executivo

| Item | Estado Atual | Alvo |
|------|-------------|------|
| **Angular** | `^18.2.0` | `^20.0.0` |
| **TypeScript** | `~5.5.2` | `~5.8.x` |
| **Zone.js** | `~0.14.10` | Remover (Zoneless) |
| **@angular/fire** | `^18.0.1` | `^19.x+` (compatível c/ Angular 20) |
| **Tailwind CSS** | `^3.4.17` | `^4.x` (opcional, pode manter v3) |
| **Karma/Jasmine** | `karma ~6.4.0` | Migrar para **Jest** ou **Web Test Runner** |
| **Node.js** | Verificar | ≥ 20.x LTS |

---

## Diagnóstico do Estado Atual

### ✅ Pontos positivos (já alinhados com Angular 20)
- **Todos os 25 componentes já são `standalone: true`**
- **Bootstrap via `bootstrapApplication`** (sem NgModule)
- **Signals já utilizados** nos componentes principais (`SalaComponent`, `EntradaComponent`, serviços)
- **`inject()` function** usado na maioria dos serviços
- **`takeUntilDestroyed(DestroyRef)`** para gerenciar subscriptions
- **Builder `@angular-devkit/build-angular:application`** (builder moderno)
- **`InjectionToken` + interface** para repositórios (padrão correto)
- **`provideRouter`, `provideFirebaseApp`, `provideFirestore`** — APIs funcionais

### ⚠️ O que precisa ser migrado

| Item | Quantidade | Esforço |
|------|-----------|---------|
| `@Input()` decorators → `input()` signal | ~50+ propriedades | Médio |
| `@Output()` + `EventEmitter` → `output()` | ~15+ propriedades | Médio |
| `@ViewChild()` → `viewChild()` signal | 2 ocorrências | Baixo |
| `*ngIf` / `*ngFor` → `@if` / `@for` | ~20+ templates | Médio |
| `CommonModule` imports → remover | ~15 componentes | Baixo |
| `constructor(private ...)` → `inject()` | 4 classes | Baixo |
| `standalone: true` (explícito) → remover (default no v19+) | 25 componentes | Baixo |
| `zone.js` → Zoneless | 1 config | Médio-Alto |
| Karma → Jest/Web Test Runner | Infra de teste | Baixo (sem testes) |
| `@angular/fire` → versão compatível | 1 dependência | Médio |
| Lazy loading de rotas | 2 rotas | Baixo |

---

## Riscos e Dependências Externas

### 🔴 Risco Alto
1. **`@angular/fire ^18.0.1`** — Precisa ser atualizado para versão compatível com Angular 20. A versão `19.x` do AngularFire suporta Angular 19/20. Se houver breaking changes na API do Firestore, pode exigir ajustes no `FirestoreSalaRepository`.

2. **Migração Zoneless** — O app usa `ChangeDetectionStrategy.Default` em **todos** os componentes. Para ir Zoneless, todos os componentes precisam funcionar com `OnPush` ou signals puros. A boa notícia: a maioria dos dados já flui via `@Input` e signals, mas é necessário testar exaustivamente.

### 🟡 Risco Médio
3. **`html2canvas ^1.4.1`** — Biblioteca com manutenção irregular. Verificar compatibilidade com ES2022+ targets.
4. **`jspdf ^3.0.1` / `jspdf-autotable ^5.0.2`** — Geralmente estáveis, mas verificar após update.
5. **Tailwind CSS v3 → v4** — Mudança significativa (CSS-first config), mas é **opcional**. Pode manter v3.

### 🟢 Risco Baixo
6. **`uuid ^11.1.0`** — Alternativa: substituir por `crypto.randomUUID()` (nativo no browser moderno).
7. **`rxjs ~7.8.0`** — Compatível com Angular 20 sem mudanças.

---

## Fases de Implementação

### Fase 0 — Preparação e Snapshot (Estimativa: mínima)

**Objetivo:** Criar uma base segura para a migração.

- [ ] Garantir que o app compila e funciona (`ng build --configuration production`)
- [ ] Criar branch `feat/angular-20-migration`
- [ ] Atualizar Node.js para ≥ 20.x LTS se necessário
- [ ] Documentar versão exata de todas as dependências atuais (`npm list --depth=0`)
- [ ] Verificar compatibilidade do `@angular/fire` com Angular 19/20

**Critério de conclusão:** Build de produção funcional na branch de migração.

---

### Fase 1 — Angular 18 → 19 (Intermediária)

> **Por que fazer em dois saltos?** O Angular Update Guide recomenda atualizar uma major version por vez. Angular 19 introduziu fundações (standalone default, signal queries estáveis) que tornam o salto para 20 mais suave.

**Objetivo:** Atualizar para Angular 19 e estabilizar.

```bash
ng update @angular/core@19 @angular/cli@19
```

- [ ] Executar `ng update` e resolver breaking changes reportados
- [ ] Atualizar `@angular/fire` para versão compatível com Angular 19
- [ ] Atualizar TypeScript para `~5.6.x` (requisito do Angular 19)
- [ ] Resolver quaisquer erros de compilação
- [ ] Testar build de produção
- [ ] Testar funcionalidades críticas manualmente:
  - Criar sala
  - Entrar em sala
  - Votar
  - Revelar votos
  - Exportar PNG/PDF
  - PWA / Service Worker

**Critério de conclusão:** App rodando com Angular 19 sem regressões.

---

### Fase 2 — Angular 19 → 20

**Objetivo:** Atualizar para Angular 20.

```bash
ng update @angular/core@20 @angular/cli@20
```

- [ ] Executar `ng update` e resolver breaking changes
- [ ] Atualizar TypeScript para `~5.8.x`
- [ ] Atualizar `@angular/fire` para versão mais recente compatível
- [ ] Resolver deprecation warnings
- [ ] Testar build de produção
- [ ] Testar funcionalidades críticas

**Critério de conclusão:** App compilando e rodando com Angular 20.

---

### Fase 3 — Migração de Templates: Control Flow Syntax

**Objetivo:** Substituir `*ngIf`, `*ngFor`, `*ngSwitch` pela sintaxe nativa `@if`, `@for`, `@switch`.

```bash
ng generate @angular/core:control-flow-migration
```

**Arquivos afetados (~8 templates):**
- `entrada.component.html` — 7× `*ngIf`
- `sala.component.html` — 7× `*ngIf`
- `status-conexao.component.html` — 2× `*ngIf`
- `modal.component.html` — 1× `*ngIf`
- `template-exportacao.component.html` — 2× `*ngFor` + 3× `*ngIf`
- Outros componentes da sala que usem `*ngIf`/`*ngFor` via `CommonModule`

**Após migração:**
- [ ] Remover `CommonModule` dos `imports` de **todos os 15+ componentes**
- [ ] Remover `import { CommonModule } from '@angular/common'` dos arquivos .ts
- [ ] Verificar que nenhum pipe do `CommonModule` está em uso (ex: `| date`, `| currency`)
  - Se usar pipes, importá-los individualmente: `DatePipe`, `CurrencyPipe`, etc.

**Critério de conclusão:** Zero referências a `CommonModule` no projeto. Todos os templates usando `@if`/`@for`.

---

### Fase 4 — Migração de APIs Reativas: Signal Inputs/Outputs/Queries

**Objetivo:** Migrar `@Input`, `@Output`, `@ViewChild` para as APIs de signals.

#### 4a — Signal Inputs (`@Input()` → `input()`)
```bash
ng generate @angular/core:signal-input-migration
```

**Componentes afetados (~12):**
| Componente | Qtd @Input |
|---|---|
| CartaoPokerComponent | 3 |
| ModalComponent | 2 |
| ConfirmacaoModalComponent | 6 |
| CartaoVotacaoComponent | 6 |
| CabecalhoSalaComponent | 6 |
| StatusVotacaoComponent | 3 |
| ResultadoVotacaoComponent | 7+ |
| TemplateExportacaoComponent | 7 |
| SalaAlternarLayoutComponent | 1 |
| SalaBotoesAcaoComponent | vários |
| JogadoresListaComponent | vários |
| HistoricoDetalhesComponent | vários |

**Impacto nos templates:** Todas as referências `propriedade` viram `propriedade()` (chamada de signal).

#### 4b — Signal Outputs (`@Output()` → `output()`)
```bash
ng generate @angular/core:output-migration
```

**Componentes afetados (~10):**
- CartaoPokerComponent: `selecionar`
- ModalComponent: `fechar`
- ConfirmacaoModalComponent: `confirmar`, `cancelar`, `fechar`
- CartaoVotacaoComponent: `selecionarCarta`
- CabecalhoSalaComponent: `copiarCodigo`, `sair`
- SalaAlternarLayoutComponent: `alternarVisualizacao`
- SalaBotoesAcaoComponent: vários outputs
- ResultadoVotacaoComponent: vários outputs

#### 4c — Signal Queries (`@ViewChild()` → `viewChild()`)
```bash
ng generate @angular/core:signal-queries-migration
```

**Apenas 2 ocorrências:**
- `TemplateExportacaoComponent`: `@ViewChild('templateContainer')` → `viewChild.required<ElementRef>('templateContainer')`
- `HistoricoComponent`: `@ViewChild(TemplateExportacaoComponent)` → `viewChild.required(TemplateExportacaoComponent)`

**Critério de conclusão:** Zero `@Input`, `@Output`, `@ViewChild` decorators no projeto.

---

### Fase 5 — Migração para `inject()` Function

**Objetivo:** Converter constructor injection restante para `inject()`.

```bash
ng generate @angular/core:inject
```

**4 classes com constructor injection:**

| Classe | Parâmetro | Conversão |
|--------|-----------|-----------|
| `AtualizacaoService` | `private swUpdate: SwUpdate` | `private swUpdate = inject(SwUpdate)` |
| `ExportacaoService` | `private datePipe: DatePipe` | `private datePipe = inject(DatePipe)` |
| `HistoricoComponent` | `private exportacaoService: ExportacaoService` | `private exportacaoService = inject(ExportacaoService)` |
| `SalaCarregamentoComponent` | `public router: Router` | `router = inject(Router)` |

**Critério de conclusão:** Zero constructor injection (exceto em classes de erro que estendem `Error`).

---

### Fase 6 — Remover `standalone: true` (Redundante)

**Objetivo:** Limpar código. A partir do Angular 19, `standalone: true` é o default.

- [ ] Remover `standalone: true` de **todos os 25 componentes**
- [ ] Schematic automático disponível:
```bash
ng generate @angular/core:standalone-default
```

**Critério de conclusão:** Nenhum `standalone: true` explícito no código.

---

### Fase 7 — Migração Zoneless (Opcional mas Recomendado)

**Objetivo:** Remover `zone.js` e usar detecção de mudanças baseada em signals.

> ⚠️ **Esta é a fase mais complexa.** Recomendar executar apenas após todas as fases anteriores estarem concluídas e testadas.

#### Pré-requisitos:
- [ ] Todos os `@Input` migrados para `input()` signals
- [ ] State management 100% via signals
- [ ] Nenhum mutation direto de propriedades sem `signal.set()`/`signal.update()`

#### Passos:
1. **Substituir no `app.config.ts`:**
   ```typescript
   // DE:
   provideZoneChangeDetection({ eventCoalescing: true })
   // PARA:
   provideZonelessChangeDetection()
   ```

2. **Remover `zone.js` dos polyfills:**
   - Remover de `angular.json` → `polyfills: ["zone.js"]`
   - Remover de `polyfills` do test target → `["zone.js", "zone.js/testing"]`

3. **Remover `zone.js` do `package.json`:**
   ```bash
   npm uninstall zone.js
   ```

4. **Auditar componentes que mutam estado fora de signals:**
   - `StatusConexaoComponent` — Usa `addEventListener` para online/offline → verificar que `signal.set()` dispara change detection
   - `AtualizacaoService` — Usa `setInterval` → verificar que mudanças propagam sem zone
   - `SalaComponent` — Observable subscription com `takeUntilDestroyed` → OK se signals são atualizados dentro

5. **Adicionar `ChangeDetectionStrategy.OnPush`** a todos os componentes (recomendado mas não estritamente necessário com signals)

6. **Testar exaustivamente** — Sem Zone.js, qualquer operação assíncrona que muta estado sem passar por signals não vai atualizar a view.

**Critério de conclusão:** Zero referências a `zone.js`. App rodando com `provideZonelessChangeDetection()`.

---

### Fase 8 — Otimizações e Modernizações (Opcional)

**Objetivo:** Aproveitar APIs novas do Angular 20 e limpar dependências.

#### 8a — Lazy Loading de Rotas
```typescript
// DE:
import { EntradaComponent } from './features/entrada/entrada.component';
import { SalaComponent } from './features/sala/sala.component';

export const routes: Routes = [
  { path: '', component: EntradaComponent },
  { path: 'sala/:id', component: SalaComponent },
];

// PARA:
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/entrada/entrada.component')
      .then(m => m.EntradaComponent)
  },
  {
    path: 'sala/:id',
    loadComponent: () => import('./features/sala/sala.component')
      .then(m => m.SalaComponent)
  },
  { path: '**', redirectTo: '' },
];
```

#### 8b — Substituir `uuid` por API nativa
```typescript
// DE:
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();

// PARA:
const id = crypto.randomUUID();
```
Depois remover: `npm uninstall uuid @types/uuid`

#### 8c — Avaliar migração Tailwind v3 → v4
- Tailwind v4 usa configuração CSS-first (sem `tailwind.config.js`)
- Mudança significativa mas não bloqueante — pode manter v3
- Se decidir migrar, usar: `npx @tailwindcss/upgrade`

#### 8d — Migrar test runner (Karma → Jest ou Web Test Runner)
- Karma está deprecated no ecossistema Angular
- Angular 20 suporta **Web Test Runner** experimentalmente
- Como o projeto não tem testes, é o momento ideal para configurar Jest/Vitest do zero

#### 8e — Remover `provideAnimations()` se possível
- Avaliar se `provideAnimationsAsync()` é mais adequado (lazy loading de animações)

**Critério de conclusão:** Bundle menor, rotas lazy-loaded, dependências desnecessárias removidas.

---

## Checklist de Validação Pós-Migração

### Funcional
- [ ] Criar sala com nome e descrição
- [ ] Entrar em sala existente com código
- [ ] Votação: selecionar carta, revelar votos
- [ ] Nova rodada, encerrar sala
- [ ] Copiar código da sala
- [ ] Exportar histórico PNG
- [ ] Exportar histórico PDF
- [ ] Status de conexão online/offline
- [ ] PWA: Service Worker funcional
- [ ] PWA: Notificação de atualização disponível
- [ ] Remover participante da sala
- [ ] Navegação entre tabs (votação/histórico)
- [ ] Feedback háptico (vibração mobile)
- [ ] Modal de confirmação funcional

### Técnico
- [ ] `ng build --configuration production` sem erros
- [ ] Zero warnings de deprecation
- [ ] Bundle size dentro dos budgets (< 1MB warning, < 2MB error)
- [ ] Lighthouse score ≥ 90 (Performance, PWA)
- [ ] Firebase Firestore realtime sync funcional

---

## Comandos de Migração Automática (Resumo)

Executar na ordem após cada atualização de versão:

```bash
# Fase 1-2: Atualização de versão
ng update @angular/core@19 @angular/cli@19
ng update @angular/core@20 @angular/cli@20

# Fase 3: Control Flow
ng generate @angular/core:control-flow-migration

# Fase 4: Signal APIs
ng generate @angular/core:signal-input-migration
ng generate @angular/core:output-migration
ng generate @angular/core:signal-queries-migration

# Fase 5: inject() function
ng generate @angular/core:inject

# Fase 6: Standalone default
ng generate @angular/core:standalone-default
```

---

## Cronograma Sugerido

| Fase | Descrição | Prioridade | Complexidade |
|------|-----------|-----------|--------------|
| 0 | Preparação e snapshot | 🔴 Crítica | Baixa |
| 1 | Angular 18 → 19 | 🔴 Crítica | Média |
| 2 | Angular 19 → 20 | 🔴 Crítica | Média |
| 3 | Control Flow (`@if`/`@for`) | 🟡 Alta | Baixa |
| 4 | Signal Inputs/Outputs/Queries | 🟡 Alta | Média |
| 5 | `inject()` function | 🟢 Média | Baixa |
| 6 | Remover `standalone: true` | 🟢 Média | Mínima |
| 7 | Zoneless | 🔵 Opcional | Alta |
| 8 | Otimizações (lazy loading, etc.) | 🔵 Opcional | Média |

> **Recomendação:** Fases 0-4 são essenciais. Fases 5-6 são "nice-to-have" para código limpo. Fases 7-8 são melhorias de performance avançadas.
