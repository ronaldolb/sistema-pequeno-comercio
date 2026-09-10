import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listarEstoqueBaixo, Produto } from '../../services/produtosService';
import { resumoCaixaHoje } from '../../services/financeiroService';

export const Home: React.FC = () => {
  const { usuario } = useAuth();
  const [estoqueBaixo, setEstoqueBaixo] = useState<Produto[]>([]);
  const [caixa, setCaixa] = useState<{ entradas: number; saidas: number; saldo: number } | null>(null);
  const podeVerFinanceiro = usuario?.papel === 'dono' || usuario?.papel === 'gerente';

  useEffect(() => {
    listarEstoqueBaixo().then(setEstoqueBaixo).catch(() => setEstoqueBaixo([]));
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
            <p>Entradas: R$ {caixa.entradas.toFixed(2)}</p>
            <p>Saídas: R$ {caixa.saidas.toFixed(2)}</p>
            <p>
              <strong>Saldo: R$ {caixa.saldo.toFixed(2)}</strong>
            </p>
          </div>
        )}

        <div className="card">
          <h2>Estoque baixo</h2>
          {estoqueBaixo.length === 0 ? (
            <p>Nenhum produto abaixo do estoque mínimo.</p>
          ) : (
            <ul>
              {estoqueBaixo.slice(0, 5).map((p) => (
                <li key={p.id}>
                  {p.nome} — {p.estoque_atual} {p.unidade}
                </li>
              ))}
            </ul>
          )}
          {estoqueBaixo.length > 0 && <Link to="/estoque">Ver estoque completo →</Link>}
        </div>
      </div>
    </div>
  );
};
