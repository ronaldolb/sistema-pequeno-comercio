import React, { useEffect, useState } from 'react';
import { relatorioEstoque, relatorioFinanceiro, relatorioVendas } from '../../services/relatoriosService';

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function inicioDoMesISO() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export const Relatorios: React.FC = () => {
  const [inicio, setInicio] = useState(inicioDoMesISO());
  const [fim, setFim] = useState(hojeISO());
  const [vendas, setVendas] = useState<any>(null);
  const [estoque, setEstoque] = useState<any>(null);
  const [financeiro, setFinanceiro] = useState<any>(null);

  const carregar = () => {
    relatorioVendas(inicio, fim).then(setVendas);
    relatorioEstoque().then(setEstoque);
    relatorioFinanceiro().then(setFinanceiro);
  };

  useEffect(carregar, []);

  return (
    <div>
      <h1>Relatórios</h1>

      <div className="form-card">
        <h2>Período de vendas</h2>
        <div className="form-grid">
          <label>
            De
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </label>
          <label>
            Até
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </label>
        </div>
        <div className="form-acoes">
          <button onClick={carregar}>Atualizar</button>
        </div>
      </div>

      {vendas && (
        <div className="cards-grid">
          <div className="card">
            <h2>Vendas no período</h2>
            <p>Quantidade de vendas: {vendas.quantidade_vendas}</p>
            <p>
              <strong>Total vendido: R$ {vendas.total_vendido.toFixed(2)}</strong>
            </p>
            <h3>Por forma de pagamento</h3>
            <ul>
              {Object.entries(vendas.por_forma_pagamento).map(([forma, valor]) => (
                <li key={forma}>
                  {forma}: R$ {(valor as number).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>Mais vendidos</h2>
            <ul>
              {vendas.produtos_mais_vendidos.map((p: any) => (
                <li key={p.nome}>
                  {p.nome} — {p.quantidade} un/kg — R$ {p.total.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="cards-grid">
        {estoque && (
          <div className="card">
            <h2>Estoque</h2>
            <p>Total de produtos ativos: {estoque.total_produtos}</p>
            <p>Valor total em estoque: R$ {estoque.valor_total_em_estoque.toFixed(2)}</p>
            <p>Produtos em estoque baixo: {estoque.produtos_estoque_baixo.length}</p>
          </div>
        )}

        {financeiro && (
          <div className="card">
            <h2>Financeiro</h2>
            <p>Total a pagar: R$ {financeiro.total_a_pagar.toFixed(2)}</p>
            <p>Total a receber: R$ {financeiro.total_a_receber.toFixed(2)}</p>
            <p>Contas atrasadas: {financeiro.contas_atrasadas}</p>
          </div>
        )}
      </div>
    </div>
  );
};
