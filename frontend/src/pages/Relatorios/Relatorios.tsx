import React, { useEffect, useState } from 'react';
import { relatorioEstoque, relatorioFinanceiro, relatorioVendas } from '../../services/relatoriosService';

function hojeISO() { return new Date().toISOString().slice(0, 10); }
function inicioDoMesISO() { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); }

export const Relatorios: React.FC = () => {
  const [inicio, setInicio] = useState(inicioDoMesISO());
  const [fim, setFim] = useState(hojeISO());
  const [vendas, setVendas] = useState<any>(null);
  const [estoque, setEstoque] = useState<any>(null);
  const [financeiro, setFinanceiro] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = () => {
    setCarregando(true);
    Promise.all([
      relatorioVendas(inicio, fim).then(setVendas),
      relatorioEstoque().then(setEstoque),
      relatorioFinanceiro().then(setFinanceiro),
    ]).finally(() => setCarregando(false));
  };

  useEffect(carregar, []);

  return (
    <div>
      <h1>Relatórios</h1>
      <div className="form-card">
        <h2>Período de vendas</h2>
        <div className="form-grid">
          <label>De<input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
          <label>Até<input type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></label>
        </div>
        <div className="form-acoes">
          <button onClick={carregar} disabled={carregando}>{carregando ? 'Carregando...' : 'Atualizar'}</button>
        </div>
      </div>

      {vendas && (
        <div>
          <h2>Vendas — {inicio} até {fim}</h2>
          <div className="cards-grid">
            <div className="card">
              <h2>Resumo</h2>
              <p>Quantidade: <strong>{vendas.quantidade_vendas}</strong></p>
              <p>Total: <strong>R$ {Number(vendas.total_vendido).toFixed(2)}</strong></p>
            </div>
            <div className="card">
              <h2>Por forma de pagamento</h2>
              {Object.keys(vendas.por_forma_pagamento).length === 0
                ? <p className="estado-vazio">Nenhuma venda no período.</p>
                : <table className="tabela">
                    <thead><tr><th>Forma</th><th>Total</th></tr></thead>
                    <tbody>
                      {Object.entries(vendas.por_forma_pagamento).map(([forma, valor]) => (
                        <tr key={forma}><td>{forma}</td><td>R$ {(valor as number).toFixed(2)}</td></tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          </div>
          <h2>Produtos mais vendidos</h2>
          {vendas.produtos_mais_vendidos.length === 0
            ? <p className="estado-vazio">Nenhuma venda no período.</p>
            : <table className="tabela">
                <thead><tr><th>#</th><th>Produto</th><th>Qtd</th><th>Total (R$)</th></tr></thead>
                <tbody>
                  {vendas.produtos_mais_vendidos.map((p: any, idx: number) => (
                    <tr key={p.nome}>
                      <td>{idx + 1}º</td><td>{p.nome}</td>
                      <td>{Number(p.quantidade).toFixed(3)}</td>
                      <td>R$ {Number(p.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      <div className="cards-grid" style={{ marginTop: '2rem' }}>
        {estoque && (
          <div className="card">
            <h2>Situação do estoque</h2>
            <p>Produtos ativos: <strong>{estoque.total_produtos}</strong></p>
            <p>Valor em estoque: <strong>R$ {Number(estoque.valor_total_em_estoque).toFixed(2)}</strong></p>
            <p>Estoque baixo: <strong className={estoque.produtos_estoque_baixo.length > 0 ? 'texto-alerta' : ''}>{estoque.produtos_estoque_baixo.length}</strong></p>
            {estoque.produtos_estoque_baixo.length > 0 && (
              <table className="tabela" style={{ marginTop: '0.75rem' }}>
                <thead><tr><th>Produto</th><th>Atual</th><th>Mínimo</th></tr></thead>
                <tbody>
                  {estoque.produtos_estoque_baixo.map((p: any) => (
                    <tr key={p.id}><td>{p.nome}</td><td className="texto-alerta">{p.estoque_atual}</td><td>{p.estoque_minimo}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {financeiro && (
          <div className="card">
            <h2>Situação financeira</h2>
            <p>Total a pagar: <strong>R$ {Number(financeiro.total_a_pagar).toFixed(2)}</strong></p>
            <p>Total a receber: <strong>R$ {Number(financeiro.total_a_receber).toFixed(2)}</strong></p>
            <p>Contas atrasadas: <strong className={financeiro.contas_atrasadas > 0 ? 'texto-perigo' : ''}>{financeiro.contas_atrasadas}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};