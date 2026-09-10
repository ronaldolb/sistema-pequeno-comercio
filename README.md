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

## Como rodar

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

## Próximos passos sugeridos

1. Cadastrar seus produtos reais em **Produtos** (apague os dois produtos de exemplo).
2. Criar os usuários da equipe em **Configurações**, com o papel certo para cada um.
3. Registrar o estoque inicial em **Estoque** (movimentação do tipo "ajuste").
4. Se o negócio precisar de nota fiscal, impressão de cupom ou integração com balança/leitor de
   código de barras, são os próximos pontos naturais de evolução — nenhum dos dois está implementado
   ainda.
