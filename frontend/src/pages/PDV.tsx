import React, { useEffect, useRef, useState } from 'react';
import { listarProdutosPdv, criarVenda } from '../services/pdvService';
import { useToast } from '../context/ToastContext';
import { mensagemErro } from '../utils/erro';

type Produto = {
  id: number;
  nome: string;
  categoria: string;
  unidade: string;
  preco: number;
  codigo_interno?: string;
};

type ItemCarrinho = {
  produto: Produto;
  quantidade?: number;
  peso?: number;
  subtotal: number;
};

// Componente genérico de PDV: funciona tanto para produtos vendidos por unidade quanto por
// peso/medida (kg, lt, m), sem depender do ramo do comércio. Para itens por peso/medida,
// a quantidade é digitada na hora (em vez de assumir um valor fixo).
export const PDV: React.FC = () => {
  const { sucesso, erro } = useToast();
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [produtoPesando, setProdutoPesando] = useState<Produto | null>(null);
  const [quantidadeInformada, setQuantidadeInformada] = useState<string>('');
  const [finalizando, setFinalizando] = useState(false);
  const buscaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listarProdutosPdv().then((res) => {
      setProdutos(res);
      const cats = Array.from(new Set(res.map((p: Produto) => p.categoria))) as string[];
      setCategorias(cats);
      if (cats.length) setCategoriaSelecionada(cats[0]);
    });
  }, []);

  useEffect(() => {
    const t = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
    setTotal(t);
  }, [carrinho]);

  // Fecha o modal de peso/medida com Esc, sem precisar pegar o mouse.
  useEffect(() => {
    if (!produtoPesando) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fecharModal();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtoPesando]);

  const focarBusca = () => {
    setTimeout(() => buscaRef.current?.focus(), 0);
  };

  const adicionarProduto = (produto: Produto) => {
    if (produto.unidade === 'un') {
      // Clicar de novo no mesmo produto soma a quantidade em vez de criar uma linha nova.
      setCarrinho((prev) => {
        const idx = prev.findIndex((item) => item.produto.id === produto.id && item.quantidade !== undefined);
        if (idx >= 0) {
          const atualizado = [...prev];
          const novaQtd = (atualizado[idx].quantidade || 0) + 1;
          atualizado[idx] = {
            ...atualizado[idx],
            quantidade: novaQtd,
            subtotal: Number((novaQtd * Number(produto.preco)).toFixed(2)),
          };
          return atualizado;
        }
        return [...prev, { produto, quantidade: 1, subtotal: Number(produto.preco) }];
      });
      setBusca('');
      focarBusca();
    } else {
      // kg / lt / m: pede a quantidade antes de adicionar ao carrinho
      setProdutoPesando(produto);
      setQuantidadeInformada('');
    }
  };

  const confirmarQuantidade = () => {
    if (!produtoPesando) return;
    const quantidade = Number(quantidadeInformada.replace(',', '.'));
    if (!quantidade || quantidade <= 0) return;

    const subtotal = Number((Number(produtoPesando.preco) * quantidade).toFixed(2));
    setCarrinho((prev) => [...prev, { produto: produtoPesando, peso: quantidade, subtotal }]);
    setProdutoPesando(null);
    setQuantidadeInformada('');
    setBusca('');
    focarBusca();
  };

  const fecharModal = () => {
    setProdutoPesando(null);
    setQuantidadeInformada('');
    focarBusca();
  };

  const alterarQuantidade = (idx: number, delta: number) => {
    setCarrinho((prev) => {
      const item = prev[idx];
      if (item.quantidade === undefined) return prev;
      const novaQtd = item.quantidade + delta;
      if (novaQtd <= 0) return prev.filter((_, i) => i !== idx);
      const atualizado = [...prev];
      atualizado[idx] = {
        ...item,
        quantidade: novaQtd,
        subtotal: Number((novaQtd * Number(item.produto.preco)).toFixed(2)),
      };
      return atualizado;
    });
  };

  const removerItem = (idx: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== idx));
  };

  const finalizarVenda = async (formaPagamento: string) => {
    if (carrinho.length === 0 || finalizando) return;
    setFinalizando(true);
    try {
      await criarVenda({
        forma_pagamento: formaPagamento,
        itens: carrinho.map((item) => ({
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          peso: item.peso,
          subtotal: item.subtotal,
        })),
        valor_total: total,
      });
      setCarrinho([]);
      setTotal(0);
      sucesso('Venda registrada com sucesso.');
      setBusca('');
      focarBusca();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível concluir a venda. Tente novamente.'));
    } finally {
      setFinalizando(false);
    }
  };

  const buscaNormalizada = busca.trim().toLowerCase();
  const produtosExibidos = buscaNormalizada
    ? produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(buscaNormalizada) ||
          (p.codigo_interno || '').toLowerCase().includes(buscaNormalizada),
      )
    : produtos.filter((p) => p.categoria === categoriaSelecionada);

  return (
    <div className="pdv-container">
      <header className="pdv-header">
        <h1>PDV</h1>
      </header>

      <div className="pdv-toolbar">
        <input
          ref={buscaRef}
          className="pdv-busca"
          type="text"
          placeholder="Buscar produto por nome ou código..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && produtosExibidos.length === 1) {
              adicionarProduto(produtosExibidos[0]);
            }
          }}
          autoFocus
        />
      </div>

      <div className="pdv-body">
        <aside className="pdv-categorias">
          {categorias.map((cat) => (
            <button
              key={cat}
              className={!buscaNormalizada && cat === categoriaSelecionada ? 'ativo' : ''}
              onClick={() => {
                setBusca('');
                setCategoriaSelecionada(cat);
              }}
            >
              {cat}
            </button>
          ))}
        </aside>

        <main className="pdv-produtos">
          {produtosExibidos.length === 0 ? (
            <p className="estado-vazio">Nenhum produto encontrado.</p>
          ) : (
            produtosExibidos.map((produto) => (
              <button key={produto.id} className="produto-btn" onClick={() => adicionarProduto(produto)}>
                <span>{produto.nome}</span>
                <span>
                  R$ {Number(produto.preco).toFixed(2)} / {produto.unidade}
                </span>
              </button>
            ))
          )}
        </main>

        <section className="pdv-carrinho">
          <h2>Carrinho</h2>
          {carrinho.length === 0 && <p className="estado-vazio">Nenhum item ainda.</p>}
          {carrinho.map((item, idx) => (
            <div key={idx} className="carrinho-item">
              <span>{item.produto.nome}</span>
              {item.quantidade !== undefined ? (
                <span className="qtd-controle">
                  <button type="button" onClick={() => alterarQuantidade(idx, -1)} aria-label="Diminuir">
                    −
                  </button>
                  {item.quantidade}
                  <button type="button" onClick={() => alterarQuantidade(idx, 1)} aria-label="Aumentar">
                    +
                  </button>
                </span>
              ) : (
                <span>
                  {item.peso} {item.produto.unidade}
                </span>
              )}
              <span>R$ {item.subtotal.toFixed(2)}</span>
              <button className="carrinho-remover" onClick={() => removerItem(idx)} aria-label="Remover">
                ×
              </button>
            </div>
          ))}
          <div className="carrinho-total">Total: R$ {total.toFixed(2)}</div>
          {finalizando && <p className="pdv-processando">Processando venda...</p>}
          <div className="pdv-pagamento">
            <button onClick={() => finalizarVenda('DINHEIRO')} disabled={carrinho.length === 0 || finalizando}>
              Dinheiro
            </button>
            <button onClick={() => finalizarVenda('CARTAO')} disabled={carrinho.length === 0 || finalizando}>
              Cartão
            </button>
            <button onClick={() => finalizarVenda('PIX')} disabled={carrinho.length === 0 || finalizando}>
              Pix
            </button>
          </div>
        </section>
      </div>

      {produtoPesando && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{produtoPesando.nome}</h3>
            <p>
              Informe a quantidade em <strong>{produtoPesando.unidade}</strong>
            </p>
            <input
              autoFocus
              type="text"
              inputMode="decimal"
              value={quantidadeInformada}
              onChange={(e) => setQuantidadeInformada(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmarQuantidade()}
              placeholder={`ex: 0,5`}
            />
            <div className="form-acoes">
              <button onClick={confirmarQuantidade}>Adicionar</button>
              <button className="botao-secundario" onClick={fecharModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
