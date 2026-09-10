# Sistema de Controle para Pequeno Comércio

Evolução do projeto Sistema_Padaria: o mesmo backend NestJS + frontend React, generalizados
para funcionar em qualquer pequeno comércio (não só padaria), com quatro áreas principais:

- **PDV** — frente de caixa (venda por unidade ou por peso/medida)
- **Estoque e produtos** — cadastro, movimentações e alerta de estoque baixo
- **Financeiro** — caixa do dia (sangria/suprimento) e contas a pagar/receber
- **Relatórios e usuários** — vendas, estoque e financeiro consolidados, com permissões por papel

## O que mudou em relação ao Sistema_Padaria original

- O projeto só tinha pastas e 6 arquivos soltos (sem `package.json`, sem `main.ts`, sem nada
  executável). Agora backend e frontend rodam de ponta a ponta.
- **Corrigido um bug**: `venda.entity.ts` importava `Usuario` de `modules/usuarios/usuario.entity`,
  mas a pasta real é `modules/users` — isso quebraria a compilação assim que o TypeORM tentasse
  carregar a entidade.
- `PDV.tsx` tinha "Padaria" no título, categoria padrão fixa `'Pães'` e um peso fixo de 0.3kg para
  qualquer item vendido por peso. Agora o título é genérico e o peso/quantidade de itens por
  kg/lt/m é digitado na hora da venda.
- Adicionados os módulos que faltavam: `users` + `auth` (login com JWT e papéis dono/gerente/caixa),
  `estoque` (movimentações com histórico), `financeiro` (novo — caixa e contas a pagar/receber) e
  `relatorios`.
- Banco de dados: SQLite (arquivo único, sem precisar instalar um servidor de banco separado) —
  bom o suficiente para o volume de um pequeno comércio.

O módulo `producao` (produção) foi mantido no backend mas não implementado, já que não estava entre
as prioridades — se um dia fizer sentido para o seu tipo de comércio, dá para retomar depois.

## Como rodar (desenvolvimento)

Em desenvolvimento, backend e frontend rodam como dois processos separados (o Vite recarrega a
tela sozinho a cada alteração).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed        # cria o usuário dono (dono@meucomercio.com / admin123) e 2 produtos de exemplo
npm run start:dev   # API em http://localhost:3000/api
```

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Acesse `http://localhost:5173`, entre com `dono@meucomercio.com` / `admin123` e troque a senha
criando um novo usuário dono seu em Configurações (o seed é só para o primeiro acesso).

## Rodando em produção (um processo só)

Em produção, o backend compilado passa a servir também o frontend compilado (`frontend/dist`),
então só um processo precisa ficar rodando — sem depender do servidor de desenvolvimento do Vite.

```bash
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
cd ../backend && npm run start:prod    # sistema completo em http://localhost:3000
```

## Instalação em produção (computador da loja)

Passo a passo para instalar num computador "limpo" (sem Node/Git) e deixar o sistema abrindo
sozinho toda vez que o computador ligar.

### 1. Pré-requisitos

- [Node.js LTS](https://nodejs.org) — baixa o instalador e segue o padrão (Next, Next, Concluir).
- [Git](https://git-scm.com/download/win) — idem.

Reinicia o computador depois de instalar os dois, pra garantir que o Windows reconheça os novos
comandos no terminal.

### 2. Baixar o projeto

No PowerShell:

```powershell
cd C:\
git clone https://github.com/ronaldolb/sistema-pequeno-comercio.git ComercioApp
cd ComercioApp
```

### 3. Configurar e compilar o backend

```powershell
cd backend
npm install
copy .env.example .env
```

Abre o `.env` que acabou de ser criado num editor de texto (Bloco de Notas serve) e troca a linha
`JWT_SECRET=troque-este-segredo-em-producao` por qualquer frase longa e única sua. Depois:

```powershell
npm run seed
npm run build
```

(o `seed` cria o usuário inicial `dono@meucomercio.com` / `admin123` — troque essa senha assim
que logar pela primeira vez, em Configurações)

### 4. Compilar o frontend

```powershell
cd ..\frontend
npm install
npm run build
cd ..
```

### 5. Testar antes de deixar automático

```powershell
cd backend
npm run start:prod
```

Abre `http://localhost:3000`, confirma que loga e navega normalmente pelas telas. Depois fecha a
janela do PowerShell (`Ctrl+C`).

### 6. Deixar o sistema abrindo sozinho quando o PC ligar

O projeto já vem com `scripts\iniciar-sistema.vbs`, que liga o backend em segundo plano (sem
janela preta na tela) e abre o navegador automaticamente alguns segundos depois.

1. Clica com o botão direito em `scripts\iniciar-sistema.vbs` → **Criar atalho**
2. Aperta `Win + R`, digita `shell:startup` e dá Enter (abre a pasta de inicialização do Windows)
3. Move o atalho criado no passo 1 pra dentro dessa pasta

Pronto — da próxima vez que o computador ligar, o sistema sobe sozinho e o navegador abre em
`http://localhost:3000` depois de alguns segundos. Pra abrir manualmente sem reiniciar o PC, dá
dois cliques nesse mesmo atalho (ou direto no `.vbs` original).

### 7. Backup

Todo o banco de dados é um único arquivo: `backend\pequeno_comercio.db`. Copia esse arquivo de
vez em quando pra um pen drive, Google Drive ou e-mail pra você mesmo — é a única coisa que, se
perder, perde os dados de verdade (vendas, produtos, financeiro).

## Próximos passos sugeridos

1. Cadastrar seus produtos reais em **Produtos** (apague os dois produtos de exemplo).
2. Criar os usuários da equipe em **Configurações**, com o papel certo para cada um.
3. Registrar o estoque inicial em **Estoque** (movimentação do tipo "ajuste").
4. Se o negócio precisar de nota fiscal, impressão de cupom ou integração com balança/leitor de
   código de barras, são os próximos pontos naturais de evolução — nenhum dos dois está implementado
   ainda.
