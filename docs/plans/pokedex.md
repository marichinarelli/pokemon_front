# Plano: Pokédex pessoal (coleção + fotos + login)

> Gerado por plan-tdd em 2026-11-09. Fonte: ideia inline ("pokedex para visualizar todos os meus pokemons, adicionar, adicionar imagens e sistema de login").

## Configuração
- Comando de testes (suíte): `npm test` (= `vitest run`)
- Comando de teste único: `npx vitest run <arquivo> -t "<nome>"`
- Comando E2E (só bloco B8): `npm run e2e`
- Branch: `main`
- Commit por subtarefa aprovada: sim
- Stack / framework de teste: React 19 + Vite + TypeScript, React Router (`react-router-dom`), Tailwind CSS v4, Supabase (`@supabase/supabase-js`), Vitest + jsdom + Testing Library + user-event + MSW; Playwright no E2E.
- Antes de executar: o repo está vazio e sem commits. Fazer commit inicial só com `docs/plans/pokedex.md` (working tree limpo). A suíte não existe até B0.S2; baseline considerada verde.

### Convenções (valem para todas as subtarefas)
- Componentes e funções com **export nomeado** (`export function LoginPage()`), nunca `export default` (exceto `vite.config.ts` e `playwright.config.ts`).
- Importar tipos com `import type` (o tsconfig do template usa `verbatimModuleSyntax`).
- Testes ficam ao lado do arquivo testado (`X.tsx` → `X.test.tsx`). Importar `describe, it, expect, vi` de `'vitest'` (sem globals).
- Interações com `const user = userEvent.setup()` de `@testing-library/user-event`.
- Services são mockados com automock: `vi.mock('<caminho relativo>/services/<nome>')` no topo do teste e `vi.mocked(fn).mockResolvedValue(...)` dentro do teste.
- Mensagens para o usuário em erro: elemento com `role="alert"`.
- Textos de UI exatamente como escritos nas subtarefas (os testes buscam por eles).
- Estilo: classes Tailwind livres, mas sem mudar textos, labels, roles ou estrutura especificados.

## Decisões (da sabatina)
- Stack: React + Vite + TS, React Router, Tailwind, Vitest + Testing Library.
- Backend: Supabase (Auth + Postgres + Storage). Sem backend próprio.
- Login: email + senha (cadastro, login, logout). Confirmação de email desligada no Supabase. Sem recuperação de senha.
- Pokémon: buscado na PokéAPI por nome ou número e adicionado à coleção. A mesma espécie pode entrar mais de uma vez.
- Dados próprios por entrada: apelido (opcional), foto (opcional, substitui a arte oficial na exibição), notas (opcional).
- Foto: qualquer `image/*` até 10MB, num bucket **público** `pokemon-photos`, caminho `<user_id>/<uuid>.<ext>`.
- Telas: lista em grid, busca por nome/apelido, filtro por tipo, detalhe, editar, excluir.
- Schema: migration SQL versionada em `supabase/migrations/`, com tabela, RLS por usuário e bucket.
- Testes: PokéAPI simulada com MSW; Supabase mockado na camada `src/services`. Integração de página com Testing Library e unitários para lógica pura. Bloco final E2E com Playwright contra Supabase real.
- Execução: commit por subtarefa aprovada, direto na `main`.

## Premissas
- Ao adicionar, nome, tipos e URL da arte oficial são **copiados** para a tabela. A lista e o filtro não chamam a PokéAPI.
- Rotas protegidas: sem sessão, redireciona para `/login`.
- Excluir pede `window.confirm("Excluir este pokémon da sua Pokédex?")`. Ao confirmar, apaga o registro e depois a foto do Storage. Falha ao apagar a foto é ignorada.
- Editar com foto nova faz upload da nova, salva e depois apaga a antiga (falha ao apagar a antiga é ignorada). Não existe "remover foto sem trocar".
- Chaves do Supabase em `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). O E2E usa `E2E_EMAIL` e `E2E_PASSWORD` do mesmo arquivo. `.env.local` fica fora do git (o `.gitignore` do Vite já ignora `*.local`).
- As funções de service que só repassam ao Supabase (`services/auth.ts`, CRUD de `services/pokedex.ts`, `uploadPhoto`/`deletePhoto`) são subtarefas de **preparação** sem teste unitário. Elas são cobertas pelo E2E do B8. A lógica pura dentro delas (`rowToEntry`, `buildPhotoPath`, `photoPathFromUrl`) tem teste unitário.
- B0 entrega só a fundação (build + Vitest rodando). Não tem teste de comportamento.
- **Antes do B8** o orquestrador para e pede ao usuário:
  1. criar o projeto no Supabase;
  2. rodar a migration no SQL Editor;
  3. desligar "Confirm email" em Auth → Providers → Email;
  4. criar o usuário de teste;
  5. preencher `.env.local`.

## Fora de escopo
- Recuperação de senha, login social, confirmação de email.
- Paginação, cache (React Query etc.), modo offline.
- Várias fotos por pokémon; remover a foto sem trocar.
- Mostrar estatísticas, evoluções ou golpes da PokéAPI.
- Deploy.

## Mapa de arquivos (referência)
```
src/
  main.tsx                     BrowserRouter + AuthProvider + App
  App.tsx                      rotas
  index.css                    @import "tailwindcss";
  types.ts                     AppUser, PokemonPreview, PokedexEntry, NewPokedexEntry, PokedexEntryUpdate
  lib/supabase.ts              cliente Supabase
  lib/typeColors.ts            cor por tipo
  lib/validatePhoto.ts         validação da foto
  lib/filterEntries.ts         filterEntries, uniqueTypes
  services/auth.ts             signUp, signIn, signOut, getCurrentUser, onAuthChange
  services/pokedex.ts          rowToEntry, listEntries, getEntry, createEntry, updateEntry, deleteEntry
  services/pokeapi.ts          fetchPokemon
  services/storage.ts          buildPhotoPath, photoPathFromUrl, uploadPhoto, deletePhoto
  auth/AuthProvider.tsx        AuthContext, AuthProvider, useAuth
  auth/ProtectedRoute.tsx
  components/Header.tsx
  components/PokemonCard.tsx
  pages/LoginPage.tsx, SignupPage.tsx, PokedexPage.tsx, AddPokemonPage.tsx,
        PokemonDetailPage.tsx, EditPokemonPage.tsx
  test/setup.ts, test/msw.ts, test/fixtures.ts, test/renderPage.tsx
supabase/migrations/20261109000000_pokedex.sql
e2e/pokedex.spec.ts, e2e/fixtures/foto.png, playwright.config.ts
```

## Blocos

### [x] B0 — Fundação
- Objetivo: projeto Vite + React + TS com Tailwind, Vitest/Testing Library/MSW configurados, tipos de domínio, cliente Supabase, fixtures de teste e migration SQL.
- Pronto quando: `npm run build` passa e `npx vitest run --passWithNoTests` sai com código 0.
- Depende de: —

#### [x] B0.S1 — Criar o projeto Vite react-ts e instalar dependências
- Tipo: preparação
- Depende de: —
- Paralelo: não
- Arquivos: `package.json` (criar), `package-lock.json` (criar), `index.html` (criar), `tsconfig.json` (criar), `tsconfig.app.json` (criar), `tsconfig.node.json` (criar), `vite.config.ts` (criar), `eslint.config.js` (criar), `.gitignore` (editar), `README.md` (criar), `public/` (criar), `src/main.tsx` (criar), `src/App.tsx` (criar), `src/index.css` (criar), `src/vite-env.d.ts` (criar, se o template gerar)
- Verificação: `npm run build` → termina sem erro e gera `dist/`.
- Implementação:
  1. Na raiz do repo (que tem `.git`, `.gitignore` e `docs/`), mova `docs/` e `.gitignore` temporariamente para fora do repo, rode `CI=1 npm create vite@6 . -- --template react-ts` e devolva `docs/` ao lugar. Descarte o `.gitignore` antigo: o gerado pelo Vite já ignora `.DS_Store`. Se o gerado não tiver `.DS_Store`, acrescente essa linha.
  2. `npm install`
  3. `npm install react-router-dom @supabase/supabase-js`
  4. `npm install -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw@2` (msw@2, não @3: o msw@3 exige typescript>=5.9 e o template fixa ~5.8.3; decisão do usuário em 2026-11-09)
  5. Apague `src/App.css` e a pasta `src/assets/`. Apague `public/vite.svg` e remova a tag `<link rel="icon" ...>` do `index.html`.
  6. No `index.html`, troque o `<title>` para `Pokédex`.
  7. `src/App.tsx` fica exatamente:
     ```tsx
     export function App() {
       return <h1 className="text-2xl font-bold">Pokédex</h1>
     }
     ```
  8. `src/main.tsx` fica exatamente:
     ```tsx
     import { StrictMode } from 'react'
     import { createRoot } from 'react-dom/client'
     import './index.css'
     import { App } from './App'

     createRoot(document.getElementById('root')!).render(
       <StrictMode>
         <App />
       </StrictMode>,
     )
     ```
  9. `src/index.css` fica vazio por enquanto (o B0.S2 preenche).
- Contexto para ler: nenhum (repo vazio).
- Aceite: verificação passa; suíte não piora.

#### [x] B0.S2 — Configurar Tailwind, Vitest, jsdom e MSW
- Tipo: preparação
- Depende de: B0.S1
- Paralelo: não
- Arquivos: `vite.config.ts` (editar), `src/index.css` (editar), `package.json` (editar), `src/test/setup.ts` (criar), `src/test/msw.ts` (criar)
- Verificação: `npx vitest run --passWithNoTests` → sai com código 0; `npm run build` → sem erro.
- Implementação:
  - `vite.config.ts` fica exatamente:
    ```ts
    /// <reference types="vitest/config" />
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import tailwindcss from '@tailwindcss/vite'

    export default defineConfig({
      plugins: [react(), tailwindcss()],
      test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        clearMocks: true,
        env: {
          VITE_SUPABASE_URL: 'http://localhost:54321',
          VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        },
      },
    })
    ```
    (Se o template usar `@vitejs/plugin-react-swc`, mantenha o import que o template gerou.)
  - `src/index.css` contém só: `@import "tailwindcss";`
  - `package.json` → em `scripts`, adicione `"test": "vitest run"` e `"test:watch": "vitest"`.
  - `src/test/msw.ts`:
    ```ts
    import { setupServer } from 'msw/node'

    export const server = setupServer()
    ```
  - `src/test/setup.ts`:
    ```ts
    import '@testing-library/jest-dom/vitest'
    import { afterAll, afterEach, beforeAll } from 'vitest'
    import { cleanup } from '@testing-library/react'
    import { server } from './msw'

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
    afterEach(() => {
      cleanup()
      server.resetHandlers()
    })
    afterAll(() => server.close())
    ```
- Contexto para ler: `vite.config.ts`, `package.json`, `tsconfig.app.json`
- Aceite: verificação passa; suíte não piora.

#### [x] B0.S3 — Tipos de domínio, cliente Supabase, .env.example e fixtures de teste
- Tipo: preparação
- Depende de: B0.S2
- Paralelo: não
- Arquivos: `src/types.ts` (criar), `src/lib/supabase.ts` (criar), `.env.example` (criar), `src/test/fixtures.ts` (criar)
- Verificação: `npm run build` → sem erro; `npx vitest run --passWithNoTests` → código 0.
- Implementação:
  - `src/types.ts`:
    ```ts
    export type AppUser = { id: string; email: string }

    export type PokemonPreview = {
      pokeapiId: number
      name: string
      types: string[]
      artworkUrl: string
    }

    export type PokedexEntry = {
      id: string
      userId: string
      pokeapiId: number
      pokemonName: string
      types: string[]
      artworkUrl: string
      nickname: string | null
      photoUrl: string | null
      notes: string | null
      createdAt: string
    }

    export type NewPokedexEntry = Omit<PokedexEntry, 'id' | 'userId' | 'createdAt'>

    export type PokedexEntryUpdate = Pick<PokedexEntry, 'nickname' | 'photoUrl' | 'notes'>
    ```
  - `src/lib/supabase.ts`:
    ```ts
    import { createClient } from '@supabase/supabase-js'

    export const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    )
    ```
  - `.env.example`:
    ```
    VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
    VITE_SUPABASE_ANON_KEY=sua-anon-key
    ```
  - `src/test/fixtures.ts`:
    ```ts
    import type { AppUser, PokedexEntry, PokemonPreview } from '../types'

    export const PIKACHU_ARTWORK =
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'

    export const testUser: AppUser = { id: 'user-1', email: 'ash@pallet.com' }

    export const pikachuPreview: PokemonPreview = {
      pokeapiId: 25,
      name: 'pikachu',
      types: ['electric'],
      artworkUrl: PIKACHU_ARTWORK,
    }

    export function makeEntry(overrides: Partial<PokedexEntry> = {}): PokedexEntry {
      return {
        id: 'entry-1',
        userId: 'user-1',
        pokeapiId: 25,
        pokemonName: 'pikachu',
        types: ['electric'],
        artworkUrl: PIKACHU_ARTWORK,
        nickname: null,
        photoUrl: null,
        notes: null,
        createdAt: '2026-11-09T12:00:00.000Z',
        ...overrides,
      }
    }
    ```
- Contexto para ler: `vite.config.ts`
- Aceite: verificação passa; suíte não piora.

#### [x] B0.S4 — Migration SQL: tabela, RLS e bucket de fotos
- Tipo: preparação
- Depende de: —
- Paralelo: sim
- Arquivos: `supabase/migrations/20261109000000_pokedex.sql` (criar)
- Verificação: `grep -c "create policy" supabase/migrations/20261109000000_pokedex.sql` → `7`; `grep -c "enable row level security" supabase/migrations/20261109000000_pokedex.sql` → `1`.
- Implementação: o arquivo contém exatamente:
  ```sql
  create table public.pokedex_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    pokeapi_id integer not null,
    pokemon_name text not null,
    types text[] not null default '{}',
    artwork_url text not null,
    nickname text,
    photo_url text,
    notes text,
    created_at timestamptz not null default now()
  );

  create index pokedex_entries_user_id_idx on public.pokedex_entries (user_id);

  alter table public.pokedex_entries enable row level security;

  create policy "entries: ler as proprias" on public.pokedex_entries
    for select to authenticated using (user_id = auth.uid());
  create policy "entries: inserir as proprias" on public.pokedex_entries
    for insert to authenticated with check (user_id = auth.uid());
  create policy "entries: editar as proprias" on public.pokedex_entries
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy "entries: excluir as proprias" on public.pokedex_entries
    for delete to authenticated using (user_id = auth.uid());

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('pokemon-photos', 'pokemon-photos', true, 10485760, array['image/*']);

  create policy "fotos: enviar na propria pasta" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'pokemon-photos' and (storage.foldername(name))[1] = auth.uid()::text);
  create policy "fotos: atualizar na propria pasta" on storage.objects
    for update to authenticated
    using (bucket_id = 'pokemon-photos' and (storage.foldername(name))[1] = auth.uid()::text);
  create policy "fotos: excluir da propria pasta" on storage.objects
    for delete to authenticated
    using (bucket_id = 'pokemon-photos' and (storage.foldername(name))[1] = auth.uid()::text);
  ```
- Contexto para ler: nenhum.
- Aceite: verificação passa; suíte não piora.

### [x] B1 — Autenticação
- Objetivo: cadastro, login e logout com email e senha; rotas protegidas redirecionam para `/login`.
- Pronto quando: testes de AuthProvider, Header, ProtectedRoute, LoginPage, SignupPage e App passam.
- Depende de: B0

#### [x] B1.S1 — Service de autenticação sobre o Supabase
- Tipo: preparação
- Depende de: —
- Paralelo: não
- Arquivos: `src/services/auth.ts` (criar)
- Verificação: `npm run build` → sem erro.
- Implementação: exporte exatamente estas funções:
  ```ts
  import type { User } from '@supabase/supabase-js'
  import { supabase } from '../lib/supabase'
  import type { AppUser } from '../types'

  function toAppUser(user: User): AppUser {
    return { id: user.id, email: user.email ?? '' }
  }

  export async function signUp(email: string, password: string): Promise<AppUser> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data.user) {
      if (error?.message.toLowerCase().includes('already registered')) {
        throw new Error('Este email já está cadastrado')
      }
      throw new Error('Não foi possível criar a conta')
    }
    return toAppUser(data.user)
  }

  export async function signIn(email: string, password: string): Promise<AppUser> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw new Error('Email ou senha inválidos')
    return toAppUser(data.user)
  }

  export async function signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  export async function getCurrentUser(): Promise<AppUser | null> {
    const { data } = await supabase.auth.getSession()
    return data.session?.user ? toAppUser(data.session.user) : null
  }

  export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? toAppUser(session.user) : null)
    })
    return () => data.subscription.unsubscribe()
  }
  ```
- Contexto para ler: `src/lib/supabase.ts`, `src/types.ts`
- Aceite: verificação passa; suíte não piora.

#### [x] B1.S2 — AuthProvider expõe o usuário da sessão atual
- Tipo: comportamento
- Depende de: B1.S1
- Paralelo: não
- Arquivos: `src/auth/AuthProvider.tsx` (criar)
- Teste:
  - Arquivo: `src/auth/AuthProvider.test.tsx`
  - Nome: `mostra o usuário da sessão atual depois de carregar`
  - Tipo: integração
  - Dado: `vi.mock('../services/auth')`; `getCurrentUser` resolve `testUser`; `onAuthChange` retorna `() => {}` (`vi.mocked(onAuthChange).mockReturnValue(() => {})`). Um componente `Probe` definido no teste: `const { user, loading } = useAuth(); return <p>{loading ? 'carregando' : user?.email ?? 'anônimo'}</p>`.
  - Quando: renderiza `<AuthProvider><Probe /></AuthProvider>`.
  - Então: `await screen.findByText('ash@pallet.com')` existe.
- Implementação: em `src/auth/AuthProvider.tsx`:
  ```ts
  export type AuthContextValue = {
    user: AppUser | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
  }
  export const AuthContext = createContext<AuthContextValue | null>(null)
  export function AuthProvider({ children }: { children: ReactNode }) { ... }
  export function useAuth(): AuthContextValue
  ```
  - `AuthProvider`: estados `user` (inicial `null`) e `loading` (inicial `true`). Num `useEffect` de montagem: chama `authService.getCurrentUser()` → `setUser(result)`, `setLoading(false)`; e assina `authService.onAuthChange(setUser)`, retornando o unsubscribe no cleanup.
  - `signIn` chama `authService.signIn` e faz `setUser` com o retorno. `signUp` faz o mesmo com `authService.signUp`. `signOut` chama `authService.signOut` e faz `setUser(null)`. Erros dos services propagam (não capture).
  - Importe os services como `import * as authService from '../services/auth'`.
  - `useAuth()` lê o contexto; se for `null`, lança `new Error('useAuth precisa estar dentro de AuthProvider')`.
- Contexto para ler: `src/services/auth.ts`, `src/types.ts`, `src/test/fixtures.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S3 — Helper de teste `renderPage`
- Tipo: preparação
- Depende de: B1.S2
- Paralelo: não
- Arquivos: `src/test/renderPage.tsx` (criar)
- Verificação: `npm run build` → sem erro; `npm test` → verde.
- Implementação:
  ```tsx
  import type { ReactElement } from 'react'
  import { render } from '@testing-library/react'
  import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
  import { vi } from 'vitest'
  import { AuthContext, type AuthContextValue } from '../auth/AuthProvider'
  import type { AppUser } from '../types'
  import { testUser } from './fixtures'

  function LocationProbe() {
    const location = useLocation()
    return <p data-testid="location">{location.pathname}</p>
  }

  type RenderPageOptions = {
    path: string
    route: string
    user?: AppUser | null
    auth?: Partial<AuthContextValue>
  }

  export function renderPage(element: ReactElement, options: RenderPageOptions) {
    const auth: AuthContextValue = {
      user: options.user === undefined ? testUser : options.user,
      loading: false,
      signIn: vi.fn().mockResolvedValue(undefined),
      signUp: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
      ...options.auth,
    }
    const result = render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={[options.route]}>
          <Routes>
            <Route path={options.path} element={element} />
            <Route path="*" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )
    return { ...result, auth }
  }
  ```
  Uso: depois de uma navegação, `await screen.findByTestId('location')` tem o texto do novo pathname.
- Contexto para ler: `src/auth/AuthProvider.tsx`, `src/test/fixtures.ts`
- Aceite: verificação passa; suíte não piora.

#### [x] B1.S4 — Header: botão "Sair" desloga e vai para /login
- Tipo: comportamento
- Depende de: B1.S3
- Paralelo: não
- Arquivos: `src/components/Header.tsx` (criar)
- Teste:
  - Arquivo: `src/components/Header.test.tsx`
  - Nome: `ao clicar em Sair desloga e vai para o login`
  - Tipo: integração
  - Dado: `const { auth } = renderPage(<Header />, { path: '/', route: '/' })`.
  - Quando: clica no botão `Sair` (`getByRole('button', { name: 'Sair' })`).
  - Então: `auth.signOut` foi chamado uma vez e `await screen.findByTestId('location')` tem o texto `/login`. O email `ash@pallet.com` aparecia na tela antes do clique.
- Implementação: `export function Header()`. Usa `useAuth()` e `useNavigate()`. Renderiza um `<header>` com:
  - `<Link to="/">Pokédex</Link>`;
  - `<span>{user?.email}</span>`;
  - `<button type="button">Sair</button>`, cujo onClick faz `await signOut(); navigate('/login')`.
- Contexto para ler: `src/auth/AuthProvider.tsx`, `src/test/renderPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S5 — ProtectedRoute redireciona para /login sem usuário
- Tipo: comportamento
- Depende de: B1.S4
- Paralelo: não
- Arquivos: `src/auth/ProtectedRoute.tsx` (criar)
- Teste:
  - Arquivo: `src/auth/ProtectedRoute.test.tsx`
  - Nome: `sem usuário redireciona para o login`
  - Tipo: integração
  - Dado: uma função local `renderProtected(user: AppUser | null)` no arquivo de teste renderiza:
    ```tsx
    <AuthContext.Provider value={{ user, loading: false, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>conteúdo protegido</p>} />
          </Route>
          <Route path="/login" element={<p>tela de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
    ```
    É chamada com `null`.
  - Quando: renderiza.
  - Então: `screen.getByText('tela de login')` existe e `screen.queryByText('conteúdo protegido')` é `null`.
- Implementação: `export function ProtectedRoute()`. Com `const { user, loading } = useAuth()`:
  - se `loading`, retorna `<p>Carregando...</p>`;
  - se não tem `user`, retorna `<Navigate to="/login" replace />`;
  - caso contrário, retorna
    ```tsx
    <>
      <Header />
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </>
    ```
- Contexto para ler: `src/auth/AuthProvider.tsx`, `src/components/Header.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S6 — ProtectedRoute mostra Header e conteúdo com usuário
- Tipo: comportamento
- Depende de: B1.S5
- Paralelo: não
- Arquivos: `src/auth/ProtectedRoute.tsx` (editar)
- Teste:
  - Arquivo: `src/auth/ProtectedRoute.test.tsx`
  - Nome: `com usuário mostra o header e o conteúdo protegido`
  - Tipo: integração
  - Dado: `renderProtected(testUser)` (mesma função do teste anterior).
  - Quando: renderiza.
  - Então: `getByText('conteúdo protegido')` existe, `getByRole('button', { name: 'Sair' })` existe e `getByText('ash@pallet.com')` existe.
- Implementação: se o teste já passar com o código do B1.S5, não altere o código (relate "verde de primeira"). Caso contrário, ajuste `ProtectedRoute` para o retorno especificado no B1.S5.
- Contexto para ler: `src/auth/ProtectedRoute.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S7 — LoginPage: login válido vai para "/"
- Tipo: comportamento
- Depende de: B1.S3
- Paralelo: sim
- Arquivos: `src/pages/LoginPage.tsx` (criar)
- Teste:
  - Arquivo: `src/pages/LoginPage.test.tsx`
  - Nome: `com credenciais válidas entra e vai para a Pokédex`
  - Tipo: integração
  - Dado: `const { auth } = renderPage(<LoginPage />, { path: '/login', route: '/login', user: null })`.
  - Quando: digita `ash@pallet.com` em `getByLabelText('Email')`, `pikachu123` em `getByLabelText('Senha')` e clica em `getByRole('button', { name: 'Entrar' })`.
  - Então: `auth.signIn` foi chamado com `('ash@pallet.com', 'pikachu123')` e `await screen.findByTestId('location')` tem o texto `/`.
- Implementação: `export function LoginPage()`. Renderiza:
  - um `<h1>Entrar</h1>`;
  - um `<form>` com `<label>Email <input type="email" required /></label>` e `<label>Senha <input type="password" required /></label>` (input dentro do label, para `getByLabelText` funcionar);
  - `<button type="submit">Entrar</button>`;
  - `<Link to="/cadastro">Criar conta</Link>`.
  No submit: `preventDefault`, `await signIn(email, password)`, `navigate('/')`. Em erro: estado `error = 'Email ou senha inválidos'`, renderizado em `<p role="alert">{error}</p>`.
- Contexto para ler: `src/test/renderPage.tsx`, `src/auth/AuthProvider.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S8 — LoginPage: credenciais inválidas mostram erro
- Tipo: comportamento
- Depende de: B1.S7
- Paralelo: não
- Arquivos: `src/pages/LoginPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/LoginPage.test.tsx`
  - Nome: `com credenciais inválidas mostra erro e continua no login`
  - Tipo: integração
  - Dado: `renderPage(<LoginPage />, { path: '/login', route: '/login', user: null, auth: { signIn: vi.fn().mockRejectedValue(new Error('Email ou senha inválidos')) } })`.
  - Quando: preenche Email e Senha e clica em `Entrar`.
  - Então: `await screen.findByRole('alert')` tem o texto `Email ou senha inválidos` e `screen.queryByTestId('location')` é `null`.
- Implementação: se o comportamento já existir pelo B1.S7, não altere o código (relate "verde de primeira"). Senão, implemente o `try/catch` descrito no B1.S7.
- Contexto para ler: `src/pages/LoginPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S9 — SignupPage: cadastro válido vai para "/"
- Tipo: comportamento
- Depende de: B1.S3
- Paralelo: sim
- Arquivos: `src/pages/SignupPage.tsx` (criar)
- Teste:
  - Arquivo: `src/pages/SignupPage.test.tsx`
  - Nome: `com dados válidos cria a conta e vai para a Pokédex`
  - Tipo: integração
  - Dado: `const { auth } = renderPage(<SignupPage />, { path: '/cadastro', route: '/cadastro', user: null })`.
  - Quando: digita `misty@cerulean.com` em `Email`, `staryu123` em `Senha` e clica em `getByRole('button', { name: 'Criar conta' })`.
  - Então: `auth.signUp` foi chamado com `('misty@cerulean.com', 'staryu123')` e `await screen.findByTestId('location')` tem o texto `/`.
- Implementação: `export function SignupPage()`. Renderiza:
  - um `<h1>Criar conta</h1>`;
  - um form com `<label>Email <input type="email" required /></label>` e `<label>Senha <input type="password" required /></label>`;
  - `<button type="submit">Criar conta</button>`;
  - `<Link to="/login">Já tenho conta</Link>`.
  No submit: `preventDefault`, `await signUp(email, password)`, `navigate('/')`.
- Contexto para ler: `src/pages/LoginPage.tsx`, `src/test/renderPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S10 — SignupPage: senha curta mostra erro sem chamar o cadastro
- Tipo: comportamento
- Depende de: B1.S9
- Paralelo: não
- Arquivos: `src/pages/SignupPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/SignupPage.test.tsx`
  - Nome: `com senha menor que 6 caracteres mostra erro e não cadastra`
  - Tipo: integração
  - Dado: `const { auth } = renderPage(<SignupPage />, { path: '/cadastro', route: '/cadastro', user: null })`.
  - Quando: digita `misty@cerulean.com` em `Email`, `12345` em `Senha` e clica em `Criar conta`.
  - Então: `await screen.findByRole('alert')` tem o texto `A senha precisa ter pelo menos 6 caracteres` e `auth.signUp` não foi chamado.
- Implementação: no submit, antes de chamar `signUp`: se `password.length < 6`, faça `setError('A senha precisa ter pelo menos 6 caracteres')` e `return`. O erro é renderizado em `<p role="alert">{error}</p>` quando existir. Não use `minLength` no input (bloquearia o submit no jsdom).
- Contexto para ler: `src/pages/SignupPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S11 — SignupPage: erro do serviço aparece na tela
- Tipo: comportamento
- Depende de: B1.S10
- Paralelo: não
- Arquivos: `src/pages/SignupPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/SignupPage.test.tsx`
  - Nome: `quando o cadastro falha mostra a mensagem do erro`
  - Tipo: integração
  - Dado: `renderPage(<SignupPage />, { path: '/cadastro', route: '/cadastro', user: null, auth: { signUp: vi.fn().mockRejectedValue(new Error('Este email já está cadastrado')) } })`.
  - Quando: preenche `misty@cerulean.com` / `staryu123` e clica em `Criar conta`.
  - Então: `await screen.findByRole('alert')` tem o texto `Este email já está cadastrado` e `screen.queryByTestId('location')` é `null`.
- Implementação: envolva `signUp` + `navigate` em `try/catch`. No catch: `setError(err instanceof Error ? err.message : 'Não foi possível criar a conta')`.
- Contexto para ler: `src/pages/SignupPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B1.S12 — App: rotas públicas e protegidas; sem sessão "/" mostra o login
- Tipo: comportamento
- Depende de: B1.S6, B1.S8, B1.S11
- Paralelo: não
- Arquivos: `src/App.tsx` (editar), `src/main.tsx` (editar)
- Teste:
  - Arquivo: `src/App.test.tsx`
  - Nome: `sem sessão a rota inicial mostra a tela de login`
  - Tipo: integração
  - Dado: `vi.mock('./services/auth')`; `getCurrentUser` resolve `null`; `onAuthChange` retorna `() => {}`.
  - Quando: renderiza `<MemoryRouter initialEntries={['/']}><AuthProvider><App /></AuthProvider></MemoryRouter>`.
  - Então: `await screen.findByRole('button', { name: 'Entrar' })` existe.
- Implementação:
  - `src/App.tsx`: `export function App()` retorna:
    ```tsx
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<h1>Minha Pokédex</h1>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    ```
    (O `<h1>` é um placeholder que o B2.S8 substitui.)
  - `src/main.tsx`: dentro de `<StrictMode>`, renderize `<BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>`.
- Contexto para ler: `src/auth/AuthProvider.tsx`, `src/auth/ProtectedRoute.tsx`, `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

### [x] B2 — Lista da Pokédex
- Objetivo: `/` mostra em grid os pokémons do usuário, com estado vazio e de erro.
- Pronto quando: testes de `rowToEntry`, PokemonCard, PokedexPage e a rota `/` no App passam.
- Depende de: B1

#### [x] B2.S1 — rowToEntry converte linha do banco para PokedexEntry
- Tipo: comportamento
- Depende de: —
- Paralelo: sim
- Arquivos: `src/services/pokedex.ts` (criar)
- Teste:
  - Arquivo: `src/services/pokedex.test.ts`
  - Nome: `rowToEntry converte colunas snake_case em PokedexEntry`
  - Tipo: unitário
  - Dado: a linha `{ id: 'entry-1', user_id: 'user-1', pokeapi_id: 25, pokemon_name: 'pikachu', types: ['electric'], artwork_url: PIKACHU_ARTWORK, nickname: 'Sparky', photo_url: null, notes: 'Meu primeiro', created_at: '2026-11-09T12:00:00.000Z' }`.
  - Quando: chama `rowToEntry(row)`.
  - Então: `toEqual(makeEntry({ nickname: 'Sparky', notes: 'Meu primeiro' }))`.
- Implementação: em `src/services/pokedex.ts`, exporte:
  - `export type PokedexRow = { id: string; user_id: string; pokeapi_id: number; pokemon_name: string; types: string[]; artwork_url: string; nickname: string | null; photo_url: string | null; notes: string | null; created_at: string }`;
  - `export function rowToEntry(row: PokedexRow): PokedexEntry`, que faz o mapeamento campo a campo.
  O arquivo já importa `supabase` de `'../lib/supabase'` (o próximo passo usa).
- Contexto para ler: `src/types.ts`, `src/test/fixtures.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B2.S2 — Funções CRUD do service da Pokédex
- Tipo: preparação
- Depende de: B2.S1
- Paralelo: não
- Arquivos: `src/services/pokedex.ts` (editar)
- Verificação: `npm run build` → sem erro; `npx vitest run src/services/pokedex.test.ts` → verde.
- Implementação: adicione ao arquivo (tabela `pokedex_entries`):
  ```ts
  const TABLE = 'pokedex_entries'

  export async function listEntries(): Promise<PokedexEntry[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as PokedexRow[]).map(rowToEntry)
  }

  export async function getEntry(id: string): Promise<PokedexEntry | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? rowToEntry(data as PokedexRow) : null
  }

  export async function createEntry(input: NewPokedexEntry): Promise<PokedexEntry> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        pokeapi_id: input.pokeapiId,
        pokemon_name: input.pokemonName,
        types: input.types,
        artwork_url: input.artworkUrl,
        nickname: input.nickname,
        photo_url: input.photoUrl,
        notes: input.notes,
      })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return rowToEntry(data as PokedexRow)
  }

  export async function updateEntry(id: string, changes: PokedexEntryUpdate): Promise<PokedexEntry> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ nickname: changes.nickname, photo_url: changes.photoUrl, notes: changes.notes })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return rowToEntry(data as PokedexRow)
  }

  export async function deleteEntry(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
  ```
- Contexto para ler: `src/services/pokedex.ts`, `src/types.ts`
- Aceite: verificação passa; suíte não piora.

#### [x] B2.S3 — PokemonCard com apelido e foto própria
- Tipo: comportamento
- Depende de: —
- Paralelo: sim
- Arquivos: `src/components/PokemonCard.tsx` (criar), `src/lib/typeColors.ts` (criar)
- Teste:
  - Arquivo: `src/components/PokemonCard.test.tsx`
  - Nome: `com apelido e foto mostra o apelido, a espécie, os tipos e a foto própria`
  - Tipo: integração
  - Dado: `const entry = makeEntry({ nickname: 'Sparky', photoUrl: 'https://example.com/foto.jpg' })`.
  - Quando: renderiza `<MemoryRouter><PokemonCard entry={entry} /></MemoryRouter>`.
  - Então:
    - `getByRole('heading', { name: 'Sparky' })` existe;
    - `getByText('pikachu')` existe;
    - `getByText('electric')` existe;
    - `getByRole('img', { name: 'Sparky' })` tem `src` `https://example.com/foto.jpg`;
    - `getByRole('link')` tem `href` `/pokemon/entry-1`.
- Implementação:
  - `src/lib/typeColors.ts`:
    ```ts
    export const TYPE_COLORS: Record<string, string> = {
      normal: 'bg-stone-400', fire: 'bg-orange-500', water: 'bg-blue-500', electric: 'bg-yellow-400',
      grass: 'bg-green-500', ice: 'bg-cyan-300', fighting: 'bg-red-700', poison: 'bg-purple-500',
      ground: 'bg-amber-600', flying: 'bg-indigo-300', psychic: 'bg-pink-500', bug: 'bg-lime-500',
      rock: 'bg-yellow-700', ghost: 'bg-violet-700', dragon: 'bg-indigo-700', dark: 'bg-neutral-700',
      steel: 'bg-slate-400', fairy: 'bg-pink-300',
    }

    export function typeColor(type: string): string {
      return TYPE_COLORS[type] ?? 'bg-gray-400'
    }
    ```
  - `src/components/PokemonCard.tsx`: `export function PokemonCard({ entry }: { entry: PokedexEntry })`. Com `const title = entry.nickname ?? entry.pokemonName`, renderiza:
    ```tsx
    <Link to={`/pokemon/${entry.id}`} className="block rounded-xl border p-3 shadow-sm hover:shadow-md">
      <img src={entry.photoUrl ?? entry.artworkUrl} alt={title} className="mx-auto h-32 w-32 object-contain" />
      <h2 className="mt-2 text-lg font-semibold capitalize">{title}</h2>
      {entry.nickname && <p className="text-sm capitalize text-gray-500">{entry.pokemonName}</p>}
      <ul className="mt-2 flex gap-1">
        {entry.types.map((type) => (
          <li key={type} className={`rounded px-2 text-xs capitalize text-white ${typeColor(type)}`}>{type}</li>
        ))}
      </ul>
    </Link>
    ```
- Contexto para ler: `src/types.ts`, `src/test/fixtures.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B2.S4 — PokemonCard sem apelido e sem foto usa nome e arte oficial
- Tipo: comportamento
- Depende de: B2.S3
- Paralelo: não
- Arquivos: `src/components/PokemonCard.tsx` (editar)
- Teste:
  - Arquivo: `src/components/PokemonCard.test.tsx`
  - Nome: `sem apelido e sem foto mostra o nome da espécie e a arte oficial`
  - Tipo: integração
  - Dado: `const entry = makeEntry()`.
  - Quando: renderiza `<MemoryRouter><PokemonCard entry={entry} /></MemoryRouter>`.
  - Então: `getByRole('heading', { name: 'pikachu' })` existe; `getAllByText('pikachu')` tem tamanho 1; `getByRole('img', { name: 'pikachu' })` tem `src` igual a `PIKACHU_ARTWORK`.
- Implementação: se o teste já passar com o código do B2.S3, não altere o código (relate "verde de primeira"). Caso contrário, ajuste o card para o markup do B2.S3.
- Contexto para ler: `src/components/PokemonCard.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B2.S5 — PokedexPage lista os pokémons do usuário
- Tipo: comportamento
- Depende de: B2.S2, B2.S4
- Paralelo: não
- Arquivos: `src/pages/PokedexPage.tsx` (criar)
- Teste:
  - Arquivo: `src/pages/PokedexPage.test.tsx`
  - Nome: `mostra um card para cada pokémon da coleção`
  - Tipo: integração
  - Dado: `vi.mock('../services/pokedex')`; `listEntries` resolve:
    ```ts
    [
      makeEntry({ id: 'e1', nickname: 'Sparky' }),
      makeEntry({ id: 'e2', pokeapiId: 1, pokemonName: 'bulbasaur', types: ['grass', 'poison'], artworkUrl: 'https://example.com/1.png' }),
    ]
    ```
  - Quando: `renderPage(<PokedexPage />, { path: '/', route: '/' })`.
  - Então:
    - `await screen.findByRole('heading', { name: 'Sparky' })` existe;
    - `getByRole('heading', { name: 'bulbasaur' })` existe;
    - `getByRole('heading', { name: 'Minha Pokédex' })` existe;
    - `getByRole('link', { name: 'Adicionar pokémon' })` tem `href` `/adicionar`.
- Implementação: `export function PokedexPage()`.
  - Estado `entries: PokedexEntry[] | null` (null = carregando) e `error: string | null`.
  - `useEffect` de montagem: `listEntries().then(setEntries).catch(() => setError('Não foi possível carregar sua Pokédex'))`.
  - Renderiza:
    - `<h1>Minha Pokédex</h1>`;
    - `<Link to="/adicionar">Adicionar pokémon</Link>`;
    - se `error`: `<p role="alert">{error}</p>`;
    - senão, se `entries === null`: `<p>Carregando...</p>`;
    - senão: `<ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">`, com cada entrada em `<li key={entry.id}><PokemonCard entry={entry} /></li>`.
- Contexto para ler: `src/services/pokedex.ts`, `src/components/PokemonCard.tsx`, `src/test/renderPage.tsx`, `src/test/fixtures.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B2.S6 — PokedexPage mostra estado vazio
- Tipo: comportamento
- Depende de: B2.S5
- Paralelo: não
- Arquivos: `src/pages/PokedexPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/PokedexPage.test.tsx`
  - Nome: `sem pokémons mostra a mensagem de Pokédex vazia`
  - Tipo: integração
  - Dado: `listEntries` resolve `[]`.
  - Quando: `renderPage(<PokedexPage />, { path: '/', route: '/' })`.
  - Então: `await screen.findByText('Sua Pokédex está vazia')` existe e `screen.queryByRole('list')` é `null`.
- Implementação: quando `entries` for um array vazio, renderize `<p>Sua Pokédex está vazia</p>` no lugar do `<ul>`.
- Contexto para ler: `src/pages/PokedexPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B2.S7 — PokedexPage mostra erro de carregamento
- Tipo: comportamento
- Depende de: B2.S6
- Paralelo: não
- Arquivos: `src/pages/PokedexPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/PokedexPage.test.tsx`
  - Nome: `quando a lista falha mostra mensagem de erro`
  - Tipo: integração
  - Dado: `listEntries` rejeita com `new Error('rede')`.
  - Quando: `renderPage(<PokedexPage />, { path: '/', route: '/' })`.
  - Então: `await screen.findByRole('alert')` tem o texto `Não foi possível carregar sua Pokédex`.
- Implementação: se o teste já passar com o código do B2.S5, não altere o código (relate "verde de primeira"). Caso contrário, implemente o `catch` descrito no B2.S5.
- Contexto para ler: `src/pages/PokedexPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B2.S8 — App: rota "/" usa a PokedexPage para usuário logado
- Tipo: comportamento
- Depende de: B2.S7, B1.S12
- Paralelo: não
- Arquivos: `src/App.tsx` (editar)
- Teste:
  - Arquivo: `src/App.test.tsx`
  - Nome: `com sessão a rota inicial mostra a Pokédex do usuário`
  - Tipo: integração
  - Dado: adicione `vi.mock('./services/pokedex')` ao topo do arquivo. Neste teste: `getCurrentUser` resolve `testUser`, `onAuthChange` retorna `() => {}` e `listEntries` resolve `[]`.
  - Quando: renderiza `<MemoryRouter initialEntries={['/']}><AuthProvider><App /></AuthProvider></MemoryRouter>`.
  - Então: `await screen.findByText('Sua Pokédex está vazia')` existe e `getByRole('button', { name: 'Sair' })` existe.
- Implementação: em `App.tsx`, troque o placeholder `<h1>Minha Pokédex</h1>` da rota `/` por `<PokedexPage />`.
- Contexto para ler: `src/App.tsx`, `src/App.test.tsx`, `src/pages/PokedexPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

### [x] B3 — Adicionar pokémon da PokéAPI
- Objetivo: em `/adicionar`, buscar um pokémon por nome ou número, ver a prévia, preencher apelido e notas e salvar na coleção.
- Pronto quando: testes do service `fetchPokemon` (com MSW) e da AddPokemonPage passam, e a rota `/adicionar` está registrada.
- Depende de: B2

#### [x] B3.S1 — fetchPokemon mapeia a resposta da PokéAPI
- Tipo: comportamento
- Depende de: —
- Paralelo: sim
- Arquivos: `src/services/pokeapi.ts` (criar)
- Teste:
  - Arquivo: `src/services/pokeapi.test.ts`
  - Nome: `fetchPokemon devolve id, nome, tipos e arte oficial`
  - Tipo: integração
  - Dado: no topo do teste, a constante
    ```ts
    const pikachuResponse = {
      id: 25,
      name: 'pikachu',
      types: [{ slot: 1, type: { name: 'electric', url: '' } }],
      sprites: { front_default: 'x', other: { 'official-artwork': { front_default: PIKACHU_ARTWORK } } },
    }
    ```
    No teste: `server.use(http.get('https://pokeapi.co/api/v2/pokemon/:query', () => HttpResponse.json(pikachuResponse)))` (`http` e `HttpResponse` de `'msw'`; `server` de `'../test/msw'`).
  - Quando: `await fetchPokemon('pikachu')`.
  - Então: resultado `toEqual(pikachuPreview)`.
- Implementação: em `src/services/pokeapi.ts`:
  ```ts
  const BASE_URL = 'https://pokeapi.co/api/v2/pokemon'

  type PokeApiPokemon = {
    id: number
    name: string
    types: { type: { name: string } }[]
    sprites: { front_default: string | null; other?: { 'official-artwork'?: { front_default: string | null } } }
  }

  export async function fetchPokemon(query: string): Promise<PokemonPreview | null> {
    const response = await fetch(`${BASE_URL}/${query}`)
    const data = (await response.json()) as PokeApiPokemon
    return {
      pokeapiId: data.id,
      name: data.name,
      types: data.types.map((t) => t.type.name),
      artworkUrl: data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default ?? '',
    }
  }
  ```
  (O 404 e a normalização entram nas próximas subtarefas.)
- Contexto para ler: `src/types.ts`, `src/test/msw.ts`, `src/test/fixtures.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B3.S2 — fetchPokemon devolve null quando não encontra
- Tipo: comportamento
- Depende de: B3.S1
- Paralelo: não
- Arquivos: `src/services/pokeapi.ts` (editar)
- Teste:
  - Arquivo: `src/services/pokeapi.test.ts`
  - Nome: `fetchPokemon devolve null quando a PokéAPI responde 404`
  - Tipo: integração
  - Dado: `server.use(http.get('https://pokeapi.co/api/v2/pokemon/:query', () => new HttpResponse('Not Found', { status: 404 })))`.
  - Quando: `await fetchPokemon('naoexiste')`.
  - Então: resultado `toBeNull()`.
- Implementação: logo após o `fetch`:
  - `if (response.status === 404) return null`;
  - `if (!response.ok) throw new Error('Falha ao consultar a PokéAPI')`.
- Contexto para ler: `src/services/pokeapi.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B3.S3 — fetchPokemon normaliza a busca (trim + minúsculas)
- Tipo: comportamento
- Depende de: B3.S2
- Paralelo: não
- Arquivos: `src/services/pokeapi.ts` (editar)
- Teste:
  - Arquivo: `src/services/pokeapi.test.ts`
  - Nome: `fetchPokemon remove espaços e usa minúsculas na URL`
  - Tipo: integração
  - Dado: `let requested = ''`; `server.use(http.get('https://pokeapi.co/api/v2/pokemon/:query', ({ params }) => { requested = String(params.query); return HttpResponse.json(pikachuResponse) }))`.
  - Quando: `await fetchPokemon('  Pikachu ')`.
  - Então: `requested` é `'pikachu'`.
- Implementação: monte a URL com `encodeURIComponent(query.trim().toLowerCase())`.
- Contexto para ler: `src/services/pokeapi.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B3.S4 — AddPokemonPage mostra a prévia depois da busca
- Tipo: comportamento
- Depende de: B3.S3
- Paralelo: não
- Arquivos: `src/pages/AddPokemonPage.tsx` (criar)
- Teste:
  - Arquivo: `src/pages/AddPokemonPage.test.tsx`
  - Nome: `buscar um pokémon existente mostra a prévia e o formulário`
  - Tipo: integração
  - Dado: `vi.mock('../services/pokeapi')` e `vi.mock('../services/pokedex')`; `fetchPokemon` resolve `pikachuPreview`; `renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })`.
  - Quando: digita `pikachu` em `getByLabelText('Nome ou número')` e clica em `getByRole('button', { name: 'Buscar' })`.
  - Então:
    - `fetchPokemon` foi chamado com `'pikachu'`;
    - `await screen.findByRole('img', { name: 'pikachu' })` tem `src` `PIKACHU_ARTWORK`;
    - `getByText('electric')` existe;
    - `getByLabelText('Apelido')` e `getByLabelText('Notas')` existem;
    - `getByRole('button', { name: 'Salvar na Pokédex' })` existe.
- Implementação: `export function AddPokemonPage()`. Estados: `query`, `preview: PokemonPreview | null`, `nickname`, `notes`, `error: string | null`. Renderiza `<h1>Adicionar pokémon</h1>` e:
  - **Form de busca:** `<label>Nome ou número <input /></label>` e `<button type="submit">Buscar</button>`. No submit: `preventDefault`, `setError(null)`, `const result = await fetchPokemon(query)`, `setPreview(result)`.
  - **Quando há `preview`:**
    - `<img src={preview.artworkUrl} alt={preview.name} />`;
    - `<h2 className="capitalize">{preview.name}</h2>`;
    - `<ul>` com cada tipo em `<li>`;
    - um segundo form com `<label>Apelido <input /></label>`, `<label>Notas <textarea /></label>` e `<button type="submit">Salvar na Pokédex</button>` (o submit é implementado no B3.S6).
  - **Erro:** `error` é renderizado em `<p role="alert">`.
- Contexto para ler: `src/services/pokeapi.ts`, `src/services/pokedex.ts`, `src/test/renderPage.tsx`, `src/test/fixtures.ts`, `src/pages/PokedexPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B3.S5 — AddPokemonPage avisa quando o pokémon não existe
- Tipo: comportamento
- Depende de: B3.S4
- Paralelo: não
- Arquivos: `src/pages/AddPokemonPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/AddPokemonPage.test.tsx`
  - Nome: `buscar um pokémon inexistente mostra Pokémon não encontrado`
  - Tipo: integração
  - Dado: `fetchPokemon` resolve `null`; `renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })`.
  - Quando: digita `naoexiste` em `Nome ou número` e clica em `Buscar`.
  - Então: `await screen.findByRole('alert')` tem o texto `Pokémon não encontrado` e `screen.queryByRole('button', { name: 'Salvar na Pokédex' })` é `null`.
- Implementação: no submit da busca:
  - se `result === null`: `setError('Pokémon não encontrado')` e `setPreview(null)`;
  - se `fetchPokemon` lançar erro: `setError('Não foi possível buscar agora. Tente novamente.')` e `setPreview(null)`.
- Contexto para ler: `src/pages/AddPokemonPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B3.S6 — AddPokemonPage salva na coleção e volta para a lista
- Tipo: comportamento
- Depende de: B3.S5
- Paralelo: não
- Arquivos: `src/pages/AddPokemonPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/AddPokemonPage.test.tsx`
  - Nome: `salvar cria a entrada com os dados do pokémon e volta para a lista`
  - Tipo: integração
  - Dado: `fetchPokemon` resolve `pikachuPreview`; `createEntry` resolve `makeEntry()`; `renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })`; busca `pikachu` e espera a prévia.
  - Quando: digita `Sparky` em `Apelido`, `Meu primeiro` em `Notas` e clica em `Salvar na Pokédex`.
  - Então:
    - `createEntry` foi chamado com `{ pokeapiId: 25, pokemonName: 'pikachu', types: ['electric'], artworkUrl: PIKACHU_ARTWORK, nickname: 'Sparky', photoUrl: null, notes: 'Meu primeiro' }`;
    - `await screen.findByTestId('location')` tem o texto `/`.
- Implementação: no submit do form de salvar: `preventDefault`, depois:
  ```ts
  await createEntry({
    pokeapiId: preview.pokeapiId,
    pokemonName: preview.name,
    types: preview.types,
    artworkUrl: preview.artworkUrl,
    nickname: nickname.trim() || null,
    photoUrl: null,
    notes: notes.trim() || null,
  })
  navigate('/')
  ```
- Contexto para ler: `src/pages/AddPokemonPage.tsx`, `src/services/pokedex.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B3.S7 — AddPokemonPage mostra erro quando salvar falha
- Tipo: comportamento
- Depende de: B3.S6
- Paralelo: não
- Arquivos: `src/pages/AddPokemonPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/AddPokemonPage.test.tsx`
  - Nome: `quando salvar falha mostra erro e continua na página`
  - Tipo: integração
  - Dado: `fetchPokemon` resolve `pikachuPreview`; `createEntry` rejeita com `new Error('rede')`; render e busca `pikachu`.
  - Quando: clica em `Salvar na Pokédex`.
  - Então: `await screen.findByRole('alert')` tem o texto `Não foi possível salvar. Tente novamente.` e `screen.queryByTestId('location')` é `null`.
- Implementação: envolva `createEntry` + `navigate` em `try/catch`. No catch: `setError('Não foi possível salvar. Tente novamente.')`.
- Contexto para ler: `src/pages/AddPokemonPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B3.S8 — App: rota /adicionar
- Tipo: comportamento
- Depende de: B3.S7, B2.S8
- Paralelo: não
- Arquivos: `src/App.tsx` (editar)
- Teste:
  - Arquivo: `src/App.test.tsx`
  - Nome: `com sessão a rota /adicionar mostra a tela de adicionar`
  - Tipo: integração
  - Dado: `getCurrentUser` resolve `testUser`; `onAuthChange` retorna `() => {}`.
  - Quando: renderiza `<MemoryRouter initialEntries={['/adicionar']}><AuthProvider><App /></AuthProvider></MemoryRouter>`.
  - Então: `await screen.findByRole('heading', { name: 'Adicionar pokémon' })` existe.
- Implementação: dentro do `<Route element={<ProtectedRoute />}>`, adicione `<Route path="/adicionar" element={<AddPokemonPage />} />`.
- Contexto para ler: `src/App.tsx`, `src/App.test.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

### [ ] B4 — Foto própria
- Objetivo: no formulário de adicionar, escolher uma foto (qualquer `image/*` até 10MB), enviar ao Storage e gravar a URL.
- Pronto quando: testes de `validatePhoto`, `buildPhotoPath`, `photoPathFromUrl` e do upload na AddPokemonPage passam.
- Depende de: B3

#### [x] B4.S1 — validatePhoto recusa arquivo que não é imagem
- Tipo: comportamento
- Depende de: —
- Paralelo: sim
- Arquivos: `src/lib/validatePhoto.ts` (criar)
- Teste:
  - Arquivo: `src/lib/validatePhoto.test.ts`
  - Nome: `recusa arquivo que não é imagem`
  - Tipo: unitário
  - Dado: `new File(['x'], 'doc.pdf', { type: 'application/pdf' })`.
  - Quando: `validatePhoto(file)`.
  - Então: retorna `'Envie um arquivo de imagem'`.
- Implementação:
  ```ts
  export const MAX_PHOTO_BYTES = 10 * 1024 * 1024

  export function validatePhoto(file: File): string | null {
    if (!file.type.startsWith('image/')) return 'Envie um arquivo de imagem'
    return null
  }
  ```
- Contexto para ler: nenhum.
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B4.S2 — validatePhoto recusa imagem acima de 10MB e aceita até 10MB
- Tipo: comportamento
- Depende de: B4.S1
- Paralelo: não
- Arquivos: `src/lib/validatePhoto.ts` (editar)
- Teste:
  - Arquivo: `src/lib/validatePhoto.test.ts`
  - Nome: `recusa imagem acima de 10MB e aceita imagem de exatamente 10MB`
  - Tipo: unitário
  - Dado: uma função local `imageOfSize(bytes: number)`: cria `new File(['x'], 'a.png', { type: 'image/png' })` e faz `Object.defineProperty(file, 'size', { value: bytes })`.
  - Quando: `validatePhoto(imageOfSize(MAX_PHOTO_BYTES + 1))` e `validatePhoto(imageOfSize(MAX_PHOTO_BYTES))`.
  - Então: o primeiro retorna `'A imagem deve ter no máximo 10MB'` e o segundo retorna `null`.
- Implementação: depois da checagem de tipo, `if (file.size > MAX_PHOTO_BYTES) return 'A imagem deve ter no máximo 10MB'`.
- Contexto para ler: `src/lib/validatePhoto.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B4.S3 — buildPhotoPath gera caminho na pasta do usuário
- Tipo: comportamento
- Depende de: —
- Paralelo: sim
- Arquivos: `src/services/storage.ts` (criar)
- Teste:
  - Arquivo: `src/services/storage.test.ts`
  - Nome: `buildPhotoPath usa a pasta do usuário e a extensão do arquivo`
  - Tipo: unitário
  - Dado: —
  - Quando: `buildPhotoPath('user-1', 'Foto.PNG', 'abc')` e `buildPhotoPath('user-1', 'foto', 'abc')`.
  - Então: retornam `'user-1/abc.png'` e `'user-1/abc.jpg'`.
- Implementação: em `src/services/storage.ts`:
  ```ts
  import { supabase } from '../lib/supabase'

  export const PHOTO_BUCKET = 'pokemon-photos'

  export function buildPhotoPath(userId: string, fileName: string, id: string): string {
    const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : 'jpg'
    return `${userId}/${id}.${ext}`
  }
  ```
  (`supabase` fica importado para o B4.S5.)
- Contexto para ler: `src/lib/supabase.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B4.S4 — photoPathFromUrl extrai o caminho da URL pública
- Tipo: comportamento
- Depende de: B4.S3
- Paralelo: não
- Arquivos: `src/services/storage.ts` (editar)
- Teste:
  - Arquivo: `src/services/storage.test.ts`
  - Nome: `photoPathFromUrl extrai o caminho do bucket e devolve null para outras URLs`
  - Tipo: unitário
  - Dado: —
  - Quando: `photoPathFromUrl('http://localhost:54321/storage/v1/object/public/pokemon-photos/user-1/abc.png')` e `photoPathFromUrl('https://example.com/x.png')`.
  - Então: retornam `'user-1/abc.png'` e `null`.
- Implementação:
  ```ts
  const PUBLIC_MARKER = `/storage/v1/object/public/${PHOTO_BUCKET}/`

  export function photoPathFromUrl(url: string): string | null {
    const index = url.indexOf(PUBLIC_MARKER)
    return index === -1 ? null : url.slice(index + PUBLIC_MARKER.length)
  }
  ```
- Contexto para ler: `src/services/storage.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B4.S5 — uploadPhoto e deletePhoto sobre o Supabase Storage
- Tipo: preparação
- Depende de: B4.S4
- Paralelo: não
- Arquivos: `src/services/storage.ts` (editar)
- Verificação: `npm run build` → sem erro; `npx vitest run src/services/storage.test.ts` → verde.
- Implementação:
  ```ts
  export async function uploadPhoto(userId: string, file: File): Promise<string> {
    const path = buildPhotoPath(userId, file.name, crypto.randomUUID())
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type })
    if (error) throw new Error(error.message)
    return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
  }

  export async function deletePhoto(photoUrl: string): Promise<void> {
    const path = photoPathFromUrl(photoUrl)
    if (!path) return
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([path])
    if (error) throw new Error(error.message)
  }
  ```
- Contexto para ler: `src/services/storage.ts`
- Aceite: verificação passa; suíte não piora.

#### [ ] B4.S6 — AddPokemonPage recusa foto inválida e salva sem foto
- Tipo: comportamento
- Depende de: B4.S2, B4.S5, B3.S8
- Paralelo: não
- Arquivos: `src/pages/AddPokemonPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/AddPokemonPage.test.tsx`
  - Nome: `foto que não é imagem mostra erro e não é enviada`
  - Tipo: integração
  - Dado:
    - adicione `vi.mock('../services/storage')` ao topo do arquivo;
    - `fetchPokemon` resolve `pikachuPreview` e `createEntry` resolve `makeEntry()`;
    - `const user = userEvent.setup({ applyAccept: false })`;
    - render e busca `pikachu`.
  - Quando: `await user.upload(screen.getByLabelText('Foto (opcional)'), new File(['x'], 'doc.pdf', { type: 'application/pdf' }))`; depois clica em `Salvar na Pokédex`.
  - Então:
    - `getByRole('alert')` tem o texto `Envie um arquivo de imagem`;
    - `uploadPhoto` não foi chamado;
    - `createEntry` foi chamado com `expect.objectContaining({ photoUrl: null })`.
- Implementação:
  - No form de salvar, adicione `<label>Foto (opcional) <input type="file" accept="image/*" /></label>`.
  - Estado `photo: File | null`. No `onChange`: pega `event.target.files?.[0]`, depois `const problem = file ? validatePhoto(file) : null`.
    - Se houver `problem`: `setError(problem)` e `setPhoto(null)`.
    - Senão: `setError(null)` e `setPhoto(file ?? null)`.
  - Importe `uploadPhoto` de `'../services/storage'` (é usado no B4.S7) e `useAuth` de `'../auth/AuthProvider'`.
- Contexto para ler: `src/pages/AddPokemonPage.tsx`, `src/lib/validatePhoto.ts`, `src/services/storage.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [ ] B4.S7 — AddPokemonPage envia a foto e salva a URL
- Tipo: comportamento
- Depende de: B4.S6
- Paralelo: não
- Arquivos: `src/pages/AddPokemonPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/AddPokemonPage.test.tsx`
  - Nome: `foto válida é enviada e a URL vai para a entrada`
  - Tipo: integração
  - Dado: `fetchPokemon` resolve `pikachuPreview`; `createEntry` resolve `makeEntry()`; `uploadPhoto` resolve `'https://cdn.test/user-1/abc.png'`; render e busca `pikachu`; `const photo = new File(['img'], 'foto.png', { type: 'image/png' })`.
  - Quando: `await user.upload(screen.getByLabelText('Foto (opcional)'), photo)` e clica em `Salvar na Pokédex`.
  - Então:
    - `uploadPhoto` foi chamado com `('user-1', photo)`;
    - `createEntry` foi chamado com `expect.objectContaining({ photoUrl: 'https://cdn.test/user-1/abc.png' })`;
    - `await screen.findByTestId('location')` tem o texto `/`.
- Implementação: no submit de salvar, dentro do `try`, antes de `createEntry`: `const photoUrl = photo && user ? await uploadPhoto(user.id, photo) : null` (onde `user` vem de `useAuth()`). Passe `photoUrl` no objeto do `createEntry`.
- Contexto para ler: `src/pages/AddPokemonPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

### [x] B5 — Busca e filtro na lista
- Objetivo: filtrar a lista por texto (nome ou apelido) e por tipo.
- Pronto quando: testes de `filterEntries`, `uniqueTypes` e dos filtros na PokedexPage passam.
- Depende de: B2

#### [x] B5.S1 — filterEntries filtra por texto no nome ou apelido
- Tipo: comportamento
- Depende de: —
- Paralelo: sim
- Arquivos: `src/lib/filterEntries.ts` (criar)
- Teste:
  - Arquivo: `src/lib/filterEntries.test.ts`
  - Nome: `filtra por texto no nome da espécie ou no apelido, sem diferenciar maiúsculas`
  - Tipo: unitário
  - Dado:
    ```ts
    const sparky = makeEntry({ id: 'e1', nickname: 'Sparky' })
    const bulba = makeEntry({ id: 'e2', pokemonName: 'bulbasaur', types: ['grass', 'poison'] })
    const entries = [sparky, bulba]
    ```
  - Quando:
    - `filterEntries(entries, { text: 'SPAR', type: '' })`;
    - `filterEntries(entries, { text: 'bulba', type: '' })`;
    - `filterEntries(entries, { text: '  ', type: '' })`.
  - Então: retornam `[sparky]`, `[bulba]` e `entries`.
- Implementação:
  ```ts
  export type EntryFilters = { text: string; type: string }

  export function filterEntries(entries: PokedexEntry[], filters: EntryFilters): PokedexEntry[] {
    const text = filters.text.trim().toLowerCase()
    return entries.filter((entry) => {
      const matchesText =
        text === '' ||
        entry.pokemonName.toLowerCase().includes(text) ||
        (entry.nickname ?? '').toLowerCase().includes(text)
      return matchesText
    })
  }
  ```
- Contexto para ler: `src/types.ts`, `src/test/fixtures.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B5.S2 — filterEntries filtra por tipo e combina com texto
- Tipo: comportamento
- Depende de: B5.S1
- Paralelo: não
- Arquivos: `src/lib/filterEntries.ts` (editar)
- Teste:
  - Arquivo: `src/lib/filterEntries.test.ts`
  - Nome: `filtra por tipo e combina com o texto`
  - Tipo: unitário
  - Dado: os mesmos `sparky`, `bulba` e `entries` do teste anterior (mova-os para o escopo do `describe`).
  - Quando:
    - `filterEntries(entries, { text: '', type: 'poison' })`;
    - `filterEntries(entries, { text: 'spar', type: 'poison' })`.
  - Então: retornam `[bulba]` e `[]`.
- Implementação: no `filter`, adicione `const matchesType = filters.type === '' || entry.types.includes(filters.type)` e retorne `matchesText && matchesType`.
- Contexto para ler: `src/lib/filterEntries.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B5.S3 — uniqueTypes lista os tipos da coleção sem repetir, em ordem
- Tipo: comportamento
- Depende de: B5.S2
- Paralelo: não
- Arquivos: `src/lib/filterEntries.ts` (editar)
- Teste:
  - Arquivo: `src/lib/filterEntries.test.ts`
  - Nome: `uniqueTypes devolve os tipos sem repetição em ordem alfabética`
  - Tipo: unitário
  - Dado: `[sparky, bulba, makeEntry({ id: 'e3', types: ['electric'] })]`.
  - Quando: `uniqueTypes(lista)`.
  - Então: retorna `['electric', 'grass', 'poison']`.
- Implementação: `export function uniqueTypes(entries: PokedexEntry[]): string[] { return [...new Set(entries.flatMap((e) => e.types))].sort() }`.
- Contexto para ler: `src/lib/filterEntries.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B5.S4 — PokedexPage filtra a lista pelo campo de busca
- Tipo: comportamento
- Depende de: B5.S3, B2.S8
- Paralelo: não
- Arquivos: `src/pages/PokedexPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/PokedexPage.test.tsx`
  - Nome: `digitar na busca mostra só os pokémons que combinam`
  - Tipo: integração
  - Dado: `listEntries` resolve `[makeEntry({ id: 'e1', nickname: 'Sparky' }), makeEntry({ id: 'e2', pokemonName: 'bulbasaur', types: ['grass', 'poison'] })]`; `renderPage(<PokedexPage />, { path: '/', route: '/' })`; espera o heading `Sparky`.
  - Quando: digita `bulba` em `getByLabelText('Buscar')`.
  - Então: `getByRole('heading', { name: 'bulbasaur' })` existe e `queryByRole('heading', { name: 'Sparky' })` é `null`.
- Implementação:
  - Estados `text` (inicial `''`) e `type` (inicial `''`).
  - Quando `entries` tem itens, renderize antes do grid `<label>Buscar <input type="search" value={text} onChange=... /></label>`.
  - O grid usa `filterEntries(entries, { text, type })` no lugar de `entries`.
- Contexto para ler: `src/pages/PokedexPage.tsx`, `src/lib/filterEntries.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B5.S5 — PokedexPage filtra por tipo e avisa quando nada combina
- Tipo: comportamento
- Depende de: B5.S4
- Paralelo: não
- Arquivos: `src/pages/PokedexPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/PokedexPage.test.tsx`
  - Nome: `filtrar por tipo mostra só aquele tipo e avisa quando nada combina`
  - Tipo: integração
  - Dado: mesmas duas entradas do teste anterior; render; espera o heading `Sparky`.
  - Quando:
    1. `await user.selectOptions(screen.getByLabelText('Tipo'), 'poison')`;
    2. depois digita `spar` em `Buscar`.
  - Então:
    - após o passo 1, `getByRole('heading', { name: 'bulbasaur' })` existe e `queryByRole('heading', { name: 'Sparky' })` é `null`;
    - após o passo 2, `getByText('Nenhum pokémon encontrado')` existe.
- Implementação:
  - Ao lado da busca, renderize `<label>Tipo <select value={type} onChange=...>`, com `<option value="">Todos os tipos</option>` e um `<option key={t} value={t}>{t}</option>` para cada `t` de `uniqueTypes(entries)`.
  - Se `entries` tem itens mas o resultado filtrado está vazio, renderize `<p>Nenhum pokémon encontrado</p>` no lugar do `<ul>`.
- Contexto para ler: `src/pages/PokedexPage.tsx`, `src/lib/filterEntries.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

### [ ] B6 — Detalhe do pokémon
- Objetivo: `/pokemon/:id` mostra imagem, nome, apelido, número, tipos e notas; id inexistente mostra aviso.
- Pronto quando: testes da PokemonDetailPage e da rota no App passam.
- Depende de: B2

#### [x] B6.S1 — PokemonDetailPage mostra os dados da entrada
- Tipo: comportamento
- Depende de: —
- Paralelo: sim
- Arquivos: `src/pages/PokemonDetailPage.tsx` (criar)
- Teste:
  - Arquivo: `src/pages/PokemonDetailPage.test.tsx`
  - Nome: `mostra foto, apelido, espécie, número, tipos e notas`
  - Tipo: integração
  - Dado: `vi.mock('../services/pokedex')` e `vi.mock('../services/storage')`; `getEntry` resolve `makeEntry({ nickname: 'Sparky', photoUrl: 'https://example.com/foto.jpg', notes: 'Meu primeiro' })`.
  - Quando: `renderPage(<PokemonDetailPage />, { path: '/pokemon/:id', route: '/pokemon/entry-1' })`.
  - Então:
    - `getEntry` foi chamado com `'entry-1'`;
    - `await screen.findByRole('heading', { name: 'Sparky' })` existe;
    - `getByText('Espécie: pikachu')` existe;
    - `getByText('#025')` existe;
    - `getByText('electric')` existe;
    - `getByText('Meu primeiro')` existe;
    - `getByRole('img', { name: 'Sparky' })` tem `src` `https://example.com/foto.jpg`;
    - `getByRole('link', { name: 'Editar' })` tem `href` `/pokemon/entry-1/editar`.
- Implementação: `export function PokemonDetailPage()`. `const { id } = useParams()`. Estado `entry: PokedexEntry | null | undefined` (undefined = carregando). `useEffect([id])`: `getEntry(id!).then(setEntry)`.
  - Carregando: `<p>Carregando...</p>`.
  - Com entrada (`title = entry.nickname ?? entry.pokemonName`):
    - `<img src={entry.photoUrl ?? entry.artworkUrl} alt={title} />`;
    - `<h1 className="capitalize">{title}</h1>`;
    - se tiver apelido: `<p>Espécie: {entry.pokemonName}</p>`;
    - `<p>#{String(entry.pokeapiId).padStart(3, '0')}</p>`;
    - `<ul>` de tipos, cada um `<li className={typeColor(type)}>`;
    - se tiver notas: `<p>{entry.notes}</p>`;
    - `<Link to={`/pokemon/${entry.id}/editar`}>Editar</Link>`;
    - `<Link to="/">Voltar para a Pokédex</Link>`.
- Contexto para ler: `src/services/pokedex.ts`, `src/components/PokemonCard.tsx`, `src/lib/typeColors.ts`, `src/test/renderPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B6.S2 — PokemonDetailPage avisa quando a entrada não existe
- Tipo: comportamento
- Depende de: B6.S1
- Paralelo: não
- Arquivos: `src/pages/PokemonDetailPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/PokemonDetailPage.test.tsx`
  - Nome: `id inexistente mostra aviso e link para voltar`
  - Tipo: integração
  - Dado: `getEntry` resolve `null`.
  - Quando: `renderPage(<PokemonDetailPage />, { path: '/pokemon/:id', route: '/pokemon/nao-existe' })`.
  - Então: `await screen.findByText('Pokémon não encontrado na sua Pokédex')` existe e `getByRole('link', { name: 'Voltar para a Pokédex' })` tem `href` `/`.
- Implementação: quando `entry === null`, renderize `<p>Pokémon não encontrado na sua Pokédex</p>` e `<Link to="/">Voltar para a Pokédex</Link>`.
- Contexto para ler: `src/pages/PokemonDetailPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [ ] B6.S3 — App: rota /pokemon/:id
- Tipo: comportamento
- Depende de: B6.S2, B3.S8
- Paralelo: não
- Arquivos: `src/App.tsx` (editar)
- Teste:
  - Arquivo: `src/App.test.tsx`
  - Nome: `com sessão a rota /pokemon/:id mostra o detalhe`
  - Tipo: integração
  - Dado: `getCurrentUser` resolve `testUser`; `onAuthChange` retorna `() => {}`; `getEntry` resolve `makeEntry({ nickname: 'Sparky' })`.
  - Quando: renderiza `<MemoryRouter initialEntries={['/pokemon/entry-1']}><AuthProvider><App /></AuthProvider></MemoryRouter>`.
  - Então: `await screen.findByRole('heading', { name: 'Sparky' })` existe.
- Implementação: dentro do `<Route element={<ProtectedRoute />}>`, adicione `<Route path="/pokemon/:id" element={<PokemonDetailPage />} />`.
- Contexto para ler: `src/App.tsx`, `src/App.test.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

### [ ] B7 — Editar e excluir
- Objetivo: editar apelido, notas e foto (a troca apaga a foto antiga); excluir com confirmação, apagando também a foto.
- Pronto quando: testes de exclusão na PokemonDetailPage, da EditPokemonPage e da rota de edição no App passam.
- Depende de: B4, B6

#### [ ] B7.S1 — Excluir confirmado remove a entrada, a foto e volta para a lista
- Tipo: comportamento
- Depende de: B6.S3, B4.S5
- Paralelo: não
- Arquivos: `src/pages/PokemonDetailPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/PokemonDetailPage.test.tsx`
  - Nome: `excluir confirmado apaga a entrada e a foto e volta para a lista`
  - Tipo: integração
  - Dado:
    - `getEntry` resolve `makeEntry({ photoUrl: 'https://cdn.test/foto.png' })`;
    - `deleteEntry` resolve `undefined` e `deletePhoto` resolve `undefined`;
    - `const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)`;
    - render em `/pokemon/entry-1`.
  - Quando: clica em `await screen.findByRole('button', { name: 'Excluir' })`.
  - Então:
    - `confirmSpy` foi chamado com `'Excluir este pokémon da sua Pokédex?'`;
    - `deleteEntry` foi chamado com `'entry-1'`;
    - `deletePhoto` foi chamado com `'https://cdn.test/foto.png'`;
    - `await screen.findByTestId('location')` tem o texto `/`.
- Implementação:
  - Adicione `<button type="button">Excluir</button>` ao lado de "Editar".
  - onClick:
    ```ts
    if (!window.confirm('Excluir este pokémon da sua Pokédex?')) return
    await deleteEntry(entry.id)
    if (entry.photoUrl) {
      try { await deletePhoto(entry.photoUrl) } catch { /* foto órfã é aceitável */ }
    }
    navigate('/')
    ```
  - Importe `deletePhoto` de `'../services/storage'`.
- Contexto para ler: `src/pages/PokemonDetailPage.tsx`, `src/services/storage.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [ ] B7.S2 — Excluir cancelado não remove nada
- Tipo: comportamento
- Depende de: B7.S1
- Paralelo: não
- Arquivos: `src/pages/PokemonDetailPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/PokemonDetailPage.test.tsx`
  - Nome: `excluir cancelado não apaga nada e continua no detalhe`
  - Tipo: integração
  - Dado: `getEntry` resolve `makeEntry({ nickname: 'Sparky' })`; `vi.spyOn(window, 'confirm').mockReturnValue(false)`; render em `/pokemon/entry-1`.
  - Quando: clica em `Excluir`.
  - Então: `deleteEntry` não foi chamado; `deletePhoto` não foi chamado; `getByRole('heading', { name: 'Sparky' })` continua na tela.
- Implementação: se o teste já passar com o código do B7.S1, não altere o código (relate "verde de primeira"). Caso contrário, garanta o `return` quando `confirm` retorna `false`.
- Contexto para ler: `src/pages/PokemonDetailPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B7.S3 — EditPokemonPage abre com os dados atuais preenchidos
- Tipo: comportamento
- Depende de: B4.S5
- Paralelo: sim
- Arquivos: `src/pages/EditPokemonPage.tsx` (criar)
- Teste:
  - Arquivo: `src/pages/EditPokemonPage.test.tsx`
  - Nome: `abre o formulário com apelido e notas atuais`
  - Tipo: integração
  - Dado: `vi.mock('../services/pokedex')` e `vi.mock('../services/storage')`; `getEntry` resolve `makeEntry({ nickname: 'Sparky', notes: 'Meu primeiro', photoUrl: 'https://cdn.test/antiga.png' })`.
  - Quando: `renderPage(<EditPokemonPage />, { path: '/pokemon/:id/editar', route: '/pokemon/entry-1/editar' })`.
  - Então:
    - `await screen.findByLabelText('Apelido')` tem valor `Sparky`;
    - `getByLabelText('Notas')` tem valor `Meu primeiro`;
    - `getByLabelText('Nova foto (opcional)')` existe;
    - `getByRole('heading', { name: 'Editar pikachu' })` existe.
- Implementação: `export function EditPokemonPage()`. `const { id } = useParams()`. Estados: `entry: PokedexEntry | null | undefined`, `nickname`, `notes`, `photo: File | null`, `error: string | null`.
  - `useEffect([id])`: `getEntry(id!)`, depois `setEntry(e)`, `setNickname(e?.nickname ?? '')` e `setNotes(e?.notes ?? '')`.
  - Carregando: `<p>Carregando...</p>`.
  - `entry === null`: `<p>Pokémon não encontrado na sua Pokédex</p>`.
  - Com entrada, renderiza:
    - `<h1 className="capitalize">Editar {entry.pokemonName}</h1>` (como um texto único: use template string `{`Editar ${entry.pokemonName}`}`);
    - um form com `<label>Apelido <input value={nickname} /></label>`, `<label>Notas <textarea value={notes} /></label>` e `<label>Nova foto (opcional) <input type="file" accept="image/*" /></label>`;
    - `<button type="submit">Salvar alterações</button>`;
    - `<Link to={`/pokemon/${entry.id}`}>Cancelar</Link>`;
    - `<p role="alert">{error}</p>` quando houver erro.
- Contexto para ler: `src/pages/AddPokemonPage.tsx`, `src/pages/PokemonDetailPage.tsx`, `src/services/pokedex.ts`, `src/test/renderPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B7.S4 — Salvar edição sem foto nova atualiza e volta ao detalhe
- Tipo: comportamento
- Depende de: B7.S3
- Paralelo: não
- Arquivos: `src/pages/EditPokemonPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/EditPokemonPage.test.tsx`
  - Nome: `salvar sem foto nova atualiza apelido e notas e volta ao detalhe`
  - Tipo: integração
  - Dado: `getEntry` resolve `makeEntry({ nickname: 'Sparky', notes: 'Meu primeiro', photoUrl: 'https://cdn.test/antiga.png' })`; `updateEntry` resolve `makeEntry()`; render em `/pokemon/entry-1/editar`; espera o campo Apelido.
  - Quando: limpa `Apelido` e digita `Raio`; limpa `Notas` (deixa vazio); clica em `Salvar alterações`.
  - Então:
    - `updateEntry` foi chamado com `('entry-1', { nickname: 'Raio', notes: null, photoUrl: 'https://cdn.test/antiga.png' })`;
    - `uploadPhoto` e `deletePhoto` não foram chamados;
    - `await screen.findByTestId('location')` tem o texto `/pokemon/entry-1`.
- Implementação: no submit: `preventDefault`, depois:
  ```ts
  await updateEntry(entry.id, {
    nickname: nickname.trim() || null,
    notes: notes.trim() || null,
    photoUrl: entry.photoUrl,
  })
  navigate(`/pokemon/${entry.id}`)
  ```
- Contexto para ler: `src/pages/EditPokemonPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [x] B7.S5 — Salvar edição com foto nova envia a nova e apaga a antiga
- Tipo: comportamento
- Depende de: B7.S4
- Paralelo: não
- Arquivos: `src/pages/EditPokemonPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/EditPokemonPage.test.tsx`
  - Nome: `salvar com foto nova envia a nova, grava a URL e apaga a antiga`
  - Tipo: integração
  - Dado:
    - `getEntry` resolve `makeEntry({ photoUrl: 'https://cdn.test/antiga.png' })`;
    - `uploadPhoto` resolve `'https://cdn.test/nova.png'`;
    - `updateEntry` resolve `makeEntry()` e `deletePhoto` resolve `undefined`;
    - render;
    - `const photo = new File(['img'], 'nova.png', { type: 'image/png' })`.
  - Quando: `await user.upload(screen.getByLabelText('Nova foto (opcional)'), photo)` e clica em `Salvar alterações`.
  - Então:
    - `uploadPhoto` foi chamado com `('user-1', photo)`;
    - `updateEntry` foi chamado com `('entry-1', expect.objectContaining({ photoUrl: 'https://cdn.test/nova.png' }))`;
    - `deletePhoto` foi chamado com `'https://cdn.test/antiga.png'`;
    - `await screen.findByTestId('location')` tem o texto `/pokemon/entry-1`.
- Implementação:
  - `onChange` do input de foto: `setPhoto(file)` (a validação entra no B7.S6).
  - No submit, antes do `updateEntry`: `const newPhotoUrl = photo && user ? await uploadPhoto(user.id, photo) : null` (`user` de `useAuth()`). Passe `photoUrl: newPhotoUrl ?? entry.photoUrl`.
  - Depois do `updateEntry`:
    ```ts
    if (newPhotoUrl && entry.photoUrl) {
      try { await deletePhoto(entry.photoUrl) } catch { /* ignora */ }
    }
    ```
  - Em seguida, `navigate`.
- Contexto para ler: `src/pages/EditPokemonPage.tsx`, `src/services/storage.ts`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [~] B7.S6 — Edição recusa foto inválida
- Tipo: comportamento
- Depende de: B7.S5
- Paralelo: não
- Arquivos: `src/pages/EditPokemonPage.tsx` (editar)
- Teste:
  - Arquivo: `src/pages/EditPokemonPage.test.tsx`
  - Nome: `foto nova que não é imagem mostra erro e não é enviada`
  - Tipo: integração
  - Dado: `getEntry` resolve `makeEntry({ photoUrl: 'https://cdn.test/antiga.png' })`; `updateEntry` resolve `makeEntry()`; `const user = userEvent.setup({ applyAccept: false })`; render.
  - Quando: faz upload de `new File(['x'], 'doc.pdf', { type: 'application/pdf' })` em `Nova foto (opcional)` e clica em `Salvar alterações`.
  - Então:
    - `getByRole('alert')` tem o texto `Envie um arquivo de imagem`;
    - `uploadPhoto` não foi chamado;
    - `updateEntry` foi chamado com `('entry-1', expect.objectContaining({ photoUrl: 'https://cdn.test/antiga.png' }))`.
- Implementação: no `onChange` da foto, valide igual à AddPokemonPage: `const problem = file ? validatePhoto(file) : null`.
  - Se houver `problem`: `setError(problem)` e `setPhoto(null)`.
  - Senão: `setError(null)` e `setPhoto(file ?? null)`.
- Contexto para ler: `src/pages/EditPokemonPage.tsx`, `src/lib/validatePhoto.ts`, `src/pages/AddPokemonPage.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

#### [ ] B7.S7 — App: rota /pokemon/:id/editar
- Tipo: comportamento
- Depende de: B7.S6, B6.S3
- Paralelo: não
- Arquivos: `src/App.tsx` (editar)
- Teste:
  - Arquivo: `src/App.test.tsx`
  - Nome: `com sessão a rota /pokemon/:id/editar mostra a edição`
  - Tipo: integração
  - Dado: `getCurrentUser` resolve `testUser`; `onAuthChange` retorna `() => {}`; `getEntry` resolve `makeEntry()`.
  - Quando: renderiza `<MemoryRouter initialEntries={['/pokemon/entry-1/editar']}><AuthProvider><App /></AuthProvider></MemoryRouter>`.
  - Então: `await screen.findByRole('heading', { name: 'Editar pikachu' })` existe.
- Implementação: dentro do `<Route element={<ProtectedRoute />}>`, adicione `<Route path="/pokemon/:id/editar" element={<EditPokemonPage />} />`.
- Contexto para ler: `src/App.tsx`, `src/App.test.tsx`
- Aceite: teste novo passa; testes já existentes do(s) arquivo(s) tocado(s) continuam passando.

### [ ] B8 — E2E contra Supabase real
- Objetivo: provar o fluxo completo no navegador com Supabase real: login, adicionar com foto, ver na lista, excluir.
- Pronto quando: `npm run e2e` passa com `.env.local` configurado.
- Depende de: B5, B7
- **Pré-condição (o orquestrador para e chama o usuário antes de começar):**
  1. criar o projeto no Supabase;
  2. rodar `supabase/migrations/20261109000000_pokedex.sql` no SQL Editor;
  3. desligar "Confirm email" em Auth → Providers → Email;
  4. criar o usuário de teste em Auth → Users;
  5. preencher `.env.local` com `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `E2E_EMAIL` e `E2E_PASSWORD`.

#### [ ] B8.S1 — Instalar e configurar Playwright
- Tipo: preparação
- Depende de: —
- Paralelo: não
- Arquivos: `package.json` (editar), `package-lock.json` (editar), `playwright.config.ts` (criar), `e2e/fixtures/foto.png` (criar), `.env.example` (editar), `.gitignore` (editar)
- Verificação: `npx playwright test --list` → sai com código 0 (sem testes ainda, "Total: 0 tests" ou equivalente); `npm test` → verde.
- Implementação:
  1. `npm install -D @playwright/test` e `npx playwright install chromium`.
  2. `package.json` → em `scripts`, adicione `"e2e": "playwright test"`.
  3. `playwright.config.ts`:
     ```ts
     import { defineConfig } from '@playwright/test'

     try {
       process.loadEnvFile('.env.local')
     } catch {
       // sem .env.local: o teste E2E falha ao logar, de forma explícita
     }

     export default defineConfig({
       testDir: 'e2e',
       use: { baseURL: 'http://localhost:5173' },
       webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
     })
     ```
  4. Crie a pasta `e2e/fixtures` e gere o PNG 1x1: `node -e "require('fs').writeFileSync('e2e/fixtures/foto.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'))"`.
  5. `.env.example` → acrescente as linhas `E2E_EMAIL=usuario-de-teste@exemplo.com` e `E2E_PASSWORD=senha-do-usuario-de-teste`.
  6. `.gitignore` → acrescente `test-results/` e `playwright-report/`.
- Contexto para ler: `package.json`, `.gitignore`, `.env.example`
- Aceite: verificação passa; suíte não piora.

#### [ ] B8.S2 — Spec E2E: proteção de rota e ciclo adicionar → ver → excluir
- Tipo: preparação
- Depende de: B8.S1
- Paralelo: não
- Arquivos: `e2e/pokedex.spec.ts` (criar)
- Verificação: `npm run e2e` → 2 testes passando.
- Implementação:
  ```ts
  import { expect, test } from '@playwright/test'

  test('sem sessão redireciona para o login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('adiciona com foto, vê na lista, abre e exclui', async ({ page }) => {
    const nickname = `E2E ${Date.now()}`

    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.E2E_EMAIL!)
    await page.getByLabel('Senha').fill(process.env.E2E_PASSWORD!)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByRole('heading', { name: 'Minha Pokédex' })).toBeVisible()

    await page.getByRole('link', { name: 'Adicionar pokémon' }).click()
    await page.getByLabel('Nome ou número').fill('bulbasaur')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await expect(page.getByRole('heading', { name: 'bulbasaur' })).toBeVisible()
    await page.getByLabel('Apelido').fill(nickname)
    await page.getByLabel('Foto (opcional)').setInputFiles('e2e/fixtures/foto.png')
    await page.getByRole('button', { name: 'Salvar na Pokédex' }).click()

    await expect(page.getByRole('heading', { name: nickname })).toBeVisible()
    await page.getByRole('heading', { name: nickname }).click()
    await expect(page).toHaveURL(/\/pokemon\//)
    await expect(page.getByRole('img', { name: nickname })).toHaveAttribute('src', /pokemon-photos/)

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByRole('heading', { name: 'Minha Pokédex' })).toBeVisible()
    await expect(page.getByRole('heading', { name: nickname })).toHaveCount(0)
  })
  ```
  Se a verificação falhar por configuração (env ausente, migration não aplicada, confirmação de email ligada), relate `BLOQUEADO` com a mensagem do erro; não altere código do app.
- Contexto para ler: `playwright.config.ts`, `src/pages/LoginPage.tsx`, `src/pages/AddPokemonPage.tsx`, `src/pages/PokemonDetailPage.tsx`
- Aceite: verificação passa; suíte não piora.

## Log de execução
<!-- preenchido pelo modo EXECUTAR: uma linha por tentativa -->
| Subtarefa | Tentativa | Executor | Veredito | Nota |
|---|---|---|---|---|
| B0.S1 | 1 | haiku | BLOQUEADO | passo 4: msw@3 exige typescript>=5.9, template fixa ~5.8.3 (ERESOLVE). Passos 1-3 feitos, 5-9 pendentes |
| B0.S1 | 2 | haiku | APROVADO | retomada passos 4-9 com msw@2; build ok |
| B0.S2 | 1 | haiku | APROVADO | |
| B0.S4 | 1 | haiku | APROVADO | |
| B0.S3 | 1 | haiku | APROVADO | |
| B1.S1 | 1 | haiku | APROVADO |  |
| B1.S2 | 1 | haiku | APROVADO |  |
| B1.S3 | 1 | haiku | APROVADO |  |
| B1.S7 | 1 | haiku | APROVADO |  |
| B1.S4 | 1 | haiku | APROVADO |  |
| B1.S9 | 1 | haiku | APROVADO |  |
| B1.S8 | 1 | haiku | APROVADO | verde de primeira (coberto pelo B1.S7); não-vacuidade provada |
| B1.S5 | 1 | haiku | APROVADO |  |
| B1.S10 | 1 | haiku | APROVADO |  |
| B1.S6 | 1 | haiku | APROVADO | verde de primeira (coberto pelo B1.S5) |
| B1.S11 | 1 | haiku | APROVADO |  |
| B1.S12 | 1 | haiku | APROVADO |  |
| B2.S3 | 1 | haiku | APROVADO |  |
| B2.S1 | 1 | haiku | APROVADO | build com TS6133 (import supabase da spec) até B2.S2 |
| B2.S4 | 1 | haiku | APROVADO | verde de primeira (B2.S3); não-vacuidade provada |
| B2.S2 | 1 | haiku | APROVADO | import type ampliado (NewPokedexEntry, PokedexEntryUpdate) para compilar |
| B2.S5 | 1 | haiku | APROVADO |  |
| B2.S6 | 1 | haiku | APROVADO |  |
| B2.S7 | 1 | haiku | APROVADO | verde de primeira (B2.S5); não-vacuidade provada |
| B2.S8 | 1 | haiku | APROVADO |  |
| B5.S1 | 1 | haiku | APROVADO |  |
| B3.S1 | 1 | haiku | APROVADO |  |
| B6.S1 | 1 | haiku | APROVADO |  |
| B6.S2 | 1 | haiku | APROVADO |  |
| B3.S2 | 1 | haiku | APROVADO |  |
| B5.S2 | 1 | haiku | APROVADO |  |
| B4.S1 | 1 | haiku | APROVADO |  |
| B4.S3 | 1 | haiku | APROVADO |  |
| B3.S3 | 1 | haiku | APROVADO |  |
| B5.S3 | 1 | haiku | APROVADO |  |
| B4.S2 | 1 | haiku | APROVADO |  |
| B4.S4 | 1 | haiku | APROVADO |  |
| B3.S4 | 1 | haiku | APROVADO |  |
| B5.S4 | 1 | haiku | APROVADO |  |
| B4.S5 | 1 | haiku | APROVADO |  |
| B3.S5 | 1 | haiku | APROVADO |  |
| B5.S5 | 1 | haiku | APROVADO |  |
| B7.S3 | 1 | haiku | APROVADO | TS6133 photo/setError (estados da spec) até B7.S4/S5 |
| B3.S6 | 1 | haiku | APROVADO | guarda preview===null por tipo |
| B7.S4 | 1 | haiku | APROVADO |  |
| B3.S7 | 1 | haiku | APROVADO |  |
| B7.S5 | 1 | haiku | APROVADO | useAuth adicionado (spec assume user) |
| B3.S8 | 1 | haiku | APROVADO |  |
