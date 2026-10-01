# Nexo Estudos

Painel pessoal de estudos feito com React, TypeScript e Vite. O app reúne plano diário, foco Pomodoro, progresso por matéria e revisões em uma interface responsiva em português.

## Começar

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Para verificar a versão de produção:

```bash
npm run build
npm run preview
```

## Estrutura

- `src/App.tsx`: dashboard e interações principais.
- `src/styles.css`: tokens visuais e layout responsivo.
- `src/main.tsx`: entrada da aplicação.

Sessões do plano e duração do Pomodoro ficam salvas no armazenamento local deste navegador.