import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listarEstoqueBaixo, listarVencendo, Produto } from '../../services/produtosService';
import { resumoCaixaHoje } from '../../services/financeiroService';

const formatarMoeda = (valor: number) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Dias entre hoje (data local, não UTC) e a data de validade 'AAAA-MM-DD'.
function diasParaVencer(dataValidade: string): number {
  const [ano, mes, dia] = dataValidade.slice(0, 10).split('-').map(Number);
  const validade = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((validade.getTime() - hoje.getTime()) / 86_400_000);
}

// Vencido ou vence em até 7 dias = urgente (vermelho); de 8 a 30 dias = atenção (laranja).
function situacaoValidade(dias: number): { classe: string; texto: string } {
  if (dias < 0) return { classe: 'validade-urgente', texto: dias === -1 ? 'venceu ontem' : `venceu há ${-dias} dias` };
  if (dias === 0) return { classe: 'validade-urgente', texto: 'vence hoje' };
  if (dias === 1) return { classe: 'validade-urgente', texto: 'vence amanhã' };
  if (dias <= 7) return { classe: 'validade-urgente', texto: `em ${dias} dias` };
  return { classe: 'validade-atencao', texto: `em ${dias} dias` };
}

export const Home: React.FC = () => {
  const { usuario } = useAuth();
  const [estoqueBaixo, setEstoqueBaixo] = useState<Produto[]>([]);
  const [vencendo, setVencendo] = useState<Produto[]>([]);
  const [caixa, setCaixa] = useState<{ entradas: number; saidas: number; saldo: number } | null>(null);
  const podeVerFinanceiro = usuario?.papel === 'dono' || usuario?.papel === 'gerente';

  useEffect(() => {
    listarEstoqueBaixo().then(setEstoqueBaixo).catch(() => setEstoqueBaixo([]));
    listarVencendo(30).then(setVencendo).catch(() => setVencendo([]));
    if (podeVerFinanceiro) {
      resumoCaixaHoje().then(setCaixa).catch(() => setCaixa(null));
    }
  }, [podeVerFinanceiro]);

  return (
    <div>
      <h1>Olá, {usuario?.nome}</h1>
      <p>Visão geral do seu comércio hoje.</p>

      <div className="cards-grid">
        <Link to="/pdv" className="card card-destaque">
          <h2>Abrir PDV</h2>
          <p>Registrar uma nova venda</p>
        </Link>

        {podeVerFinanceiro && caixa && (
          <div className="card">
            <h2>Caixa de hoje</h2>
            <p>Entradas: {formatarMoeda(caixa.entradas)}</p>
            <p>Saídas: {formatarMoeda(caixa.saidas)}</p>
            <p><strong>Saldo: {formatarMoeda(caixa.saldo)}</strong></p>
          </div>
        )}

        <div className="card">
          <h2>Estoque baixo</h2>
          {estoqueBaixo.length === 0 ? (
            <p>Nenhum produto abaixo do mínimo.</p>
          ) : (
            <ul>
              {estoqueBaixo.slice(0, 5).map((p) => (
                <li key={p.id}>{p.nome} — {p.estoque_atual} {p.unidade}</li>
              ))}
            </ul>
          )}
          {estoqueBaixo.length > 0 && <Link to="/estoque">Ver estoque →</Link>}
        </div>

        <div className="card">
          <h2>⏰ Vencendo em 30 dias</h2>
          {vencendo.length === 0 ? (
            <p>Nenhum produto vencendo nos próximos 30 dias.</p>
          ) : (
            <ul className="lista-validade">
              {vencendo.slice(0, 5).map((p) => {
                const dias = diasParaVencer(p.data_validade!);
                const { classe, texto } = situacaoValidade(dias);
                return (
                  <li key={p.id} className={classe}>
                    <span className="validade-nome">{p.nome}</span>
                    <span className="validade-data">
                      {new Date(p.data_validade! + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      <span className="validade-badge">{texto}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {vencendo.length > 0 && <Link to="/produtos">Ver produtos →</Link>}
        </div>
      </div>
    </div>
  );
};