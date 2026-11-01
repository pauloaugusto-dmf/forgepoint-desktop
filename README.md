# Forgepoint Desktop 🎮⚡

Gerenciador de ideias de jogos e catálogo de mecânicas reutilizáveis para desktop.

Inspirado na arquitetura do **Axies (Game Dev)** e construído seguindo os padrões do **Cashpoint** e **Checkpoint**.

---

## 🚀 Tecnologias

- **Electron** (Processo principal com SQLite nativo e frameless titlebar)
- **React 18** + **Vite** (Renderer rápido e modular)
- **Tailwind CSS** (Tema Dark elegante com indicadores de status visuais)
- **SQLite 3** (`sqlite` + `sqlite3`, banco local em `userData/forgepoint.sqlite`)
- **Lucide React** (Ícones modernos)
- **Sonner** (Notificações toast)

---

## 📦 Funcionalidades

- **Catálogo de Mecânicas Reutilizáveis**:
  - Cadastro de mecânicas com descrição técnica e suporte a GIFs/imagens (locais ou URLs).
  - Status de implementação global (`Implementada` / `A Programar`).
  - Indicador de em quantos e quais jogos cada mecânica está sendo aproveitada.

- **Ideias & Projetos de Jogos**:
  - Cadastro de conceitos de jogos com imagem de capa/concept art.
  - Vínculo N:N com mecânicas do catálogo e notas personalizadas por jogo.
  - Status local de integração (`is_integrated`): saiba o que já está plugado no jogo.
  - Cálculo de índice de reaproveitamento (`% reaproveitável`).

- **Dashboard / KPIs**:
  - Contadores rápidos no topo: Total de Ideias, Total de Mecânicas, Prontas p/ Reusar e A Programar.
  - Filtros rápidos e busca em tempo real.

- **Backup & Restauração**:
  - Exportação completa em arquivo `.json`.
  - Importação e restauração a qualquer momento.

---

## 🛠️ Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Rodar em Modo de Desenvolvimento
```bash
npm run dev
```

### 3. Gerar Build de Produção
```bash
npm run build
```

Para gerar o instalador do Windows:
```bash
npm run build:win
```
