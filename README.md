# Squad Poker

Uma aplicação web moderna para sessões de Planning Poker, facilitando a estimativa de esforço em times ágeis.

♠️ [Acesse a aplicação](https://ddcsilva.github.io/squad-poker/)

## Sobre o Projeto

Squad Poker é uma ferramenta de Planning Poker para equipes ágeis que desejam estimar o esforço necessário para tarefas de forma colaborativa. O aplicativo permite que equipes remotas ou presenciais realizem estimativas de forma sincronizada, com suporte a participantes e espectadores.

## Funcionalidades

### Funcionalidades principais

- 🃏 **Sistema de votação com cartas**: Interface intuitiva para seleção de estimativas
- 👥 **Perfis de usuário**: Suporte a participantes (votantes) e espectadores
- 📊 **Resultado estatístico**: Exibição de média e valor mais votado após revelação
- 📋 **Histórico de rodadas**: Registro completo de todas as sessões de votação
- 📷 **Exportação de resultados**: Geração de imagens com estatísticas da votação
- 👑 **Controles de moderador**: Ferramentas para o dono da sala gerenciar participantes
- ✨ **Animações Sutis**: Transições suaves ao revelar votos ou iniciar novas rodadas
- 🚫 **Confirmação Antes de Sair**: Diálogo visual de confirmação para prevenir saídas acidentais durante votações ativas

### Características técnicas

- ⚡ **Realtime**: Atualizações em tempo real para todos os participantes
- 🔄 **Sincronização automática**: Novos participantes recebem o estado atual da sala
- 📱 **Design responsivo**: Funciona em dispositivos móveis e desktop
- 🔐 **Salas privadas**: Acesso controlado por códigos de sala
- 🧩 **Arquitetura modular**: Sistema baseado em componentes para fácil extensão

## Como usar

1. **Acesse a aplicação**: Visite [Squad Poker](https://ddcsilva.github.io/squad-poker/)
2. **Crie uma sala**: Digite seu nome, descrição da votação e escolha se deseja participar ou apenas observar
3. **Compartilhe o código**: Envie o código da sala para os outros participantes
4. **Vote nas rodadas**: Selecione seus valores nas cartas disponíveis
5. **Revele e analise**: Veja as estatísticas e exporte os resultados conforme necessário

## Tecnologias

- **Frontend**: Angular 18 com Vite
- **Backend**: Firebase (Firestore)
- **UI/UX**: Material Design inspirado
- **Hosting**: GitHub Pages

## Instalação e desenvolvimento local

### Pré-requisitos

- Node.js 18+
- NPM ou Yarn
- Angular CLI

### Instalação

```bash
# Clone o repositório
git clone https://github.com/ddcsilva/squad-poker.git

# Entre no diretório
cd squad-poker

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:4200/`.

### Configuração do Firebase

Para conectar ao Firebase, crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### Deploy para GitHub Pages

Para publicar a aplicação no GitHub Pages:

```bash
# Execute o script de deploy
npm run deploy
```

## Implementações futuras

Funcionalidades previstas para próximas versões:

1. **Tema Escuro (Dark Mode)**: Alternância entre tema claro e escuro para conforto visual em diferentes ambientes
2. **Tutorial Simples**: Tour guiado para novos usuários entenderem todas as funcionalidades
3. **Estatísticas Ampliadas**: Adição de variância e outras métricas para análise mais detalhada
4. **Persistência Local**: Armazenamento de salas recentes para fácil retorno
5. **Notificações de Jogador**: Alertas discretos quando alguém entra ou sai da sala
6. **Melhorias de Acessibilidade**: Suporte aprimorado a leitores de tela e navegação por teclado

## Contribuição

Contribuições são bem-vindas! Se você deseja contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Autor

Desenvolvido por Danilo Silva

---

♠️ **Squad Poker** - Estimativas ágeis simplificadas.
