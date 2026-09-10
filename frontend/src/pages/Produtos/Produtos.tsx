import React, { useEffect, useState } from 'react';
import {
  atualizarProduto,
  criarProduto,
  listarProdutos,
  Produto,
  removerProduto,
} from '../../services/produtosService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mensagemErro } from '../../utils/erro';

const produtoVazio: Partial<Produto> = {
  nome: '',
  categoria: '',
  unidade: 'un',
  preco: 0,
  estoque_atual: 0,
  estoque_minimo: 0,
  codigo_interno: '',
};

export const Produtos: React.FC = () => {
  const { usuario } = useAuth();
  const { sucesso, erro } = useToast();
  const podeEditar = usuario?.papel === 'dono' || usuario?.papel === 'gerente';
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState<Partial<Produto>>(produtoVazio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    setCarregando(true);
    listarProdutos()
      .then(setProdutos)
      .finally(() => setCarregando(false));
  };

  useEffect(carregar, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editandoId) {
        await atualizarProduto(editandoId, form);
        sucesso('Produto atualizado com sucesso.');
      } else {
        await criarProduto(form);
        sucesso('Produto cadastrado com sucesso.');
      }
      setForm(produtoVazio);
      setEditandoId(null);
      carregar();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível salvar o produto.'));
    } finally {
      setSalvando(false);
    }
  };

  const editar = (produto: Produto) => {
    setEditandoId(produto.id);
    setForm(produto);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForm(produtoVazio);
  };

  const excluir = async (id: number) => {
    if (!confirm('Desativar este produto? Ele deixa de aparecer no PDV, mas o histórico é preservado.')) return;
    try {
      await removerProduto(id);
      sucesso('Produto desativado.');
      carregar();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível desativar o produto.'));
    }
  };

  return (
    <div>
      <h1>Produtos</h1>

      {podeEditar && (
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>{editandoId ? 'Editar produto' : 'Novo produto'}</h2>
        <div className="form-grid">
          <label>
            Nome
            <input
              value={form.nome || ''}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </label>
          <label>
            Categoria
            <input
              value={form.categoria || ''}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              required
            />
          </label>
          <label>
            Unidade
            <select value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })}>
              <option value="un">Unidade (un)</option>
              <option value="kg">Peso (kg)</option>
              <option value="lt">Litro (lt)</option>
              <option value="m">Metro (m)</option>
            </select>
          </label>
          <label>
            Preço (R$)
            <input
              type="number"
              step="0.01"
              value={form.preco ?? 0}
              onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Estoque atual
            <input
              type="number"
              step="0.001"
              value={form.estoque_atual ?? 0}
              onChange={(e) => setForm({ ...form, estoque_atual: Number(e.target.value) })}
            />
          </label>
          <label>
            Estoque mínimo
            <input
              type="number"
              step="0.001"
              value={form.estoque_minimo ?? 0}
              onChange={(e) => setForm({ ...form, estoque_minimo: Number(e.target.value) })}
            />
          </label>
          <label>
            Código interno
            <input
              value={form.codigo_interno || ''}
              onChange={(e) => setForm({ ...form, codigo_interno: e.target.value })}
            />
          </label>
        </div>
        <div className="form-acoes">
          <button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
          {editandoId && (
            <button type="button" className="botao-secundario" onClick={cancelarEdicao} disabled={salvando}>
              Cancelar
            </button>
          )}
        </div>
      </form>
      )}

      {carregando ? (
        <p>Carregando...</p>
      ) : produtos.length === 0 ? (
        <p className="estado-vazio">Nenhum produto cadastrado ainda.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className={!p.ativo ? 'linha-inativa' : ''}>
                <td>{p.nome}</td>
                <td>{p.categoria}</td>
                <td>
                  R$ {Number(p.preco).toFixed(2)} / {p.unidade}
                </td>
                <td className={Number(p.estoque_atual) <= Number(p.estoque_minimo) ? 'texto-alerta' : ''}>
                  {p.estoque_atual} {p.unidade}
                </td>
                <td className="tabela-acoes">
                  {podeEditar && (
                    <>
                      <button onClick={() => editar(p)}>Editar</button>
                      {p.ativo && (
                        <button className="botao-perigo" onClick={() => excluir(p.id)}>
                          Desativar
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
