import React, { useEffect, useState } from 'react';
import { listarProdutos, Produto } from '../../services/produtosService';
import { listarMovimentos, movimentarEstoque, MovimentoEstoque } from '../../services/estoqueService';
import { useToast } from '../../context/ToastContext';
import { mensagemErro } from '../../utils/erro';

export const Estoque: React.FC = () => {
  const { sucesso, erro } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoEstoque[]>([]);
  const [produtoId, setProdutoId] = useState<number | ''>('');
  const [tipo, setTipo] = useState<'entrada' | 'saida' | 'ajuste'>('entrada');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [motivo, setMotivo] = useState('compra');
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    listarProdutos().then(setProdutos);
    listarMovimentos().then(setMovimentos);
  };

  useEffect(carregar, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoId) return;
    setSalvando(true);
    try {
      await movimentarEstoque({ produto_id: Number(produtoId), tipo, quantidade, motivo });
      sucesso('Movimentação registrada.');
      setQuantidade(0);
      carregar();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível registrar a movimentação.'));
    } finally {
      setSalvando(false);
    }
  };

  const produtosEstoqueBaixo = produtos.filter((p) => Number(p.estoque_atual) <= Number(p.estoque_minimo));

  return (
    <div>
      <h1>Estoque</h1>

      {produtosEstoqueBaixo.length > 0 && (
        <div className="alerta-box">
          <strong>Atenção:</strong> {produtosEstoqueBaixo.length} produto(s) no estoque mínimo ou abaixo dele —{' '}
          {produtosEstoqueBaixo.map((p) => p.nome).join(', ')}.
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Registrar movimentação</h2>
        <div className="form-grid">
          <label>
            Produto
            <select value={produtoId} onChange={(e) => setProdutoId(e.target.value ? Number(e.target.value) : '')} required>
              <option value="">Selecione...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.estoque_atual} {p.unidade})
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
              <option value="entrada">Entrada (compra/reposição)</option>
              <option value="saida">Saída (perda/uso interno)</option>
              <option value="ajuste">Ajuste de inventário (define o valor exato)</option>
            </select>
          </label>
          <label>
            Quantidade
            <input
              type="number"
              step="0.001"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Motivo
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
          </label>
        </div>
        <div className="form-acoes">
          <button type="submit" disabled={salvando}>
            {salvando ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>

      <h2>Histórico recente</h2>
      {movimentos.length === 0 ? (
        <p className="estado-vazio">Nenhuma movimentação registrada ainda.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Data</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimentos.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.data_hora).toLocaleString('pt-BR')}</td>
                <td>{m.produto?.nome}</td>
                <td>{m.tipo}</td>
                <td>{m.quantidade}</td>
                <td>{m.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
