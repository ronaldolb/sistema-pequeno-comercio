import React, { useEffect, useRef, useState } from 'react';
import { listarProdutosPdv } from '../../services/pdvService';
import { mensagemErro } from '../../utils/erro';
import { useToast } from '../../context/ToastContext';

type Produto = {
  id: number;
  nome: string;
  categoria: string;
  unidade: string;
  preco: number;
  estoque_atual: number;
  codigo_interno?: string;
};

export const Consulta: React.FC = () => {
  const { erro } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [resultado, setResultado] = useState<Produto | null>(null);
  const [semResultado, setSemResultado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listarProdutosPdv()
      .then(setProdutos)
      .catch((e) => erro(mensagemErro(e, 'Erro ao carregar produtos.')));
    inputRef.current?.focus();
  }, []);

  const buscar = () => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return;

    const encontrado = produtos.find(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.codigo_interno || '').toLowerCase() === termo,
    );

    if (encontrado) {
      setResultado(encontrado);
      setSemResultado(false);
    } else {
      setResultado(null);
      setSemResultado(true);
    }
  };

  const limpar = () => {
    setBusca('');
    setResultado(null);
    setSemResultado(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const produtosFiltrados = busca.trim().length >= 2
    ? produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(busca.trim().toLowerCase()) ||
          (p.codigo_interno || '').toLowerCase().includes(busca.trim().toLowerCase()),
      )
    : [];

  return (
    <div>
      <h1>Consulta de preços</h1>
      <p>Consulte o preço de um produto sem abrir uma venda.</p>

      <div className="form-card">
        <div className="form-grid">
          <label>
            Buscar por nome ou código
            <input
              ref={inputRef}
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setResultado(null);
                setSemResultado(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
              placeholder="Digite o nome ou código e pressione Enter..."
              autoFocus
            />
          </label>
        </div>
        <div className="form-acoes">
          <button onClick={buscar}>Consultar</button>
          <button className="botao-secundario" onClick={limpar}>Limpar</button>
        </div>
      </div>

      {/* Resultado principal */}
      {resultado && (
        <div className="card consulta-resultado">
          <div className="consulta-nome">{resultado.nome}</div>
          <div className="consulta-preco">
            R$ {Number(resultado.preco).toFixed(2)}
            <span className="consulta-unidade"> / {resultado.unidade}</span>
          </div>
          <div className="consulta-detalhes">
            <span>Categoria: <strong>{resultado.categoria}</strong></span>
            <span>Estoque: <strong>{resultado.estoque_atual} {resultado.unidade}</strong></span>
            {resultado.codigo_interno && (
              <span>Código: <strong>{resultado.codigo_interno}</strong></span>
            )}
          </div>
        </div>
      )}

      {semResultado && (
        <p className="estado-vazio">Nenhum produto encontrado para "{busca}".</p>
      )}

      {/* Lista de sugestões enquanto digita */}
      {!resultado && !semResultado && produtosFiltrados.length > 0 && (
        <div>
          <h2>Sugestões</h2>
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
              {produtosFiltrados.slice(0, 10).map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.categoria}</td>
                  <td>R$ {Number(p.preco).toFixed(2)} / {p.unidade}</td>
                  <td>{p.estoque_atual} {p.unidade}</td>
                  <td>
                    <button onClick={() => { setResultado(p); setSemResultado(false); }}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};