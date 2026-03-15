# CLAUDE.md — Nexus Studio
# Atualizado com: Google OAuth, português na UI, wireframes definidos

## O que é este projeto
Sistema interno de produção de séries de Minecraft infantil para YouTube.
Ferramenta para 2-3 pessoas — não é SaaS. Sem múltiplos tenants.

## Stack
- Next.js 14 App Router + TypeScript strict
- PostgreSQL + Prisma ORM
- NextAuth.js v5 com Google OAuth
- TailwindCSS + shadcn/ui (componentes prontos)
- Anthropic Claude + OpenAI GPT-4o + Google Gemini Flash
- pdf-lib para exportação de roteiros
- Cloudflare R2 para storage
- Deploy: Vercel + Supabase

## Idioma e UI
- TODA a interface é em português do Brasil
- Textos de botões, labels, mensagens de erro, tooltips, toasts — tudo em português
- Código (variáveis, funções, comentários) em inglês
- Exemplos de tradução:
    'Save' → 'Salvar'
    'Cancel' → 'Cancelar'
    'Loading...' → 'Carregando...'
    'Are you sure?' → 'Tem certeza?'
    'Delete' → 'Excluir'
    'Edit' → 'Editar'
    'Back' → 'Voltar'
    'Error' → 'Erro'
    'Success' → 'Sucesso'

## Design System
- Tema: light mode (modo claro) — NUNCA dark mode
- Cor primária: midGreen (#1A6B35)
- Sidebar: fundo #1E2A3A (escuro), itens em cinza claro, item ativo em verde
- Fonte: Inter (padrão shadcn/ui)
- Bordas arredondadas: rounded-md no padrão shadcn
- Sem sombras pesadas — uso leve de shadow-sm

## Navegação
- Layout: sidebar fixa de 220px à esquerda + conteúdo à direita
- Sidebar contém: lista de séries (expansível) + link Checklist
- Item ativo na sidebar: fundo verde claro + texto verde escuro + bold
- Breadcrumb no topo da área de conteúdo em todas as telas

## Auth com Google
- Provider: Google OAuth via NextAuth.js v5
- Após login: redirect para /series
- Emails autorizados: verificar process.env.ALLOWED_EMAILS (separados por vírgula)
  Se email não estiver na lista: redirecionar para /unauthorized
- Sessão: JWT armazenado em cookie httpOnly
- Logout: botão no canto inferior da sidebar

## Componentes shadcn/ui a usar
- Listas e tabelas:     Table, Card
- Formulários:          Input, Textarea, Select, Checkbox
- Ações:                Button (variants: default, outline, ghost, destructive)
- Feedback:             Badge, Alert, Toast (Sonner)
- Sobreposições:        Dialog (modais), Sheet (painéis laterais)
- Navegação:            Tabs
- Conteúdo longo:       ScrollArea
- Carregamento:         Skeleton
- Progresso:            Progress

NUNCA crie componentes de UI do zero se o shadcn/ui já tiver o equivalente.

## Arquitetura crítica
- buildContext(episodeId) SEMPRE antes de qualquer chamada de IA
- Divisão em cenas: Gemini (janela grande). Geração de roteiro: Claude + GPT-4o
- Memory buffer: bufferOut de cada cena → bufferIn da próxima. Nunca pule esta etapa.
- Status de cena: ao editar o roteiro → volta para PENDENTE automaticamente
- Auto-save com debounce 2s nos campos da Bíblia da Série

## O que NUNCA fazer
- Nunca texto em inglês na interface (só no código)
- Nunca dark mode ou temas alternativos
- Nunca chamar IA sem buildContext() — a Bíblia precisa estar no payload
- Nunca mudar scene.status diretamente — sempre pela lógica de estado
- Nunca expor chaves de API no cliente (browser)
- Nunca criar componentes de UI do zero quando shadcn/ui já tem

## Tratamento de erros (em português)
- Erros de validação: Toast vermelho com a mensagem específica
- Erros de IA (timeout, API down): Toast com 'Erro ao gerar. Tente novamente.'
- Erros de auth: redirect para /login com query param ?error=unauthorized
- Erros 500: Toast com 'Ocorreu um erro inesperado. Tente novamente.'

## Ordem de construção (seguir esta ordem)
1. Auth com Google + middleware de proteção de rotas
2. Layout com sidebar + breadcrumb
3. CRUD de Séries (T2 e T3)
4. CRUD de Personagens (Sheet lateral em T3)
5. CRUD de Episódios (T4)
6. Geração de roteiro — buildContext + generate-script (T5)
7. Aprovação de roteiro (T5)
8. Divisão em cenas — divide-scenes (T6)
9. Tela de cena individual — edição + revisor (T7)
10. Checklist de produção (T8)
11. Exportador de PDF (T9)

## Como rodar localmente
1. cp .env.example .env.local e preencher
2. docker run -e POSTGRES_PASSWORD=nexus -p 5432:5432 postgres:16
3. npx prisma migrate dev
4. npx prisma db seed
5. npm run dev → http://localhost:3000
