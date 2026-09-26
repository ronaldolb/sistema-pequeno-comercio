import React, { useEffect, useState } from 'react';
import {
  baixarConta, Conta, criarConta, listarContas,
  listarMovimentosCaixa, MovimentoCaixa, registrarMovimentoCaixa,
  resumoCaixaHoje, statusCaixa, abrirCaixa, fecharCaixa,
} from '../../services/financeiroService';
import { useToast } from '../../context/ToastContext';
import { mensagemErro } from '../../utils/erro';

const contaVazia: Partial<Conta> = {
  tipo: 'pagar', descricao: '', categoria: '', valor: 0, vencimento: '',
};

type ResumoCaixa = {
  fundo_caixa: number; total_vendas: number; total_dinheiro: number;
  total_cartao: number; total_pix: number; total_sangrias: number;
  total_suprimentos: number; saldo_final: number;
};

type Aba = 'caixa' | 'contas';

export const Financeiro: React.FC = () => {
  const { sucesso, erro } = useToast();
  const [aba, setAba] = useState<Aba>('caixa');

  // --- estado do caixa ---
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [resumoHoje, setResumoHoje] = useState<{ entradas: number; saidas: number; saldo: number } | null>(null);
  const [fundoCaixa, setFundoCaixa] = useState<number>(0);
  const [obsCaixa, setObsCaixa] = useState('');
  const [valorCaixaManual, setValorCaixaManual] = useState<number>(0);
  const [descCaixaManual, setDescCaixaManual] = useState('');
  const [resumoFechamento, setResumoFechamento] = useState<ResumoCaixa | null>(null);
  const [salvandoCaixa, setSalvandoCaixa] = useState(false);

  // --- estado de contas ---
  const [contas, setContas] = useState<Conta[]>([]);
  const [form, setForm] = useState<Partial<Conta>>(contaVazia);
  const [salvandoConta, setSalvandoConta] = useState(false);

  const carregarCaixa = async () => {
    const [status, movs, resumo] = await Promise.all([
      statusCaixa(),
      listarMovimentosCaixa(),
      resumoCaixaHoje(),
    ]);
    setCaixaAberto(status.aberto);
    setMovimentos(movs);
    setResumoHoje(resumo);
    setResumoFechamento(null);
  };

  const carregarContas = () => listarContas().then(setContas);

  useEffect(() => {
    carregarCaixa();
    carregarContas();
  }, []);

  // --- handlers caixa ---
  const handleAbrirCaixa = async () => {
    if (fundoCaixa < 0) return;
    setSalvandoCaixa(true);
    try {
      await abrirCaixa(fundoCaixa, obsCaixa || undefined);
      sucesso('Caixa aberto com sucesso.');
      setFundoCaixa(0);
      setObsCaixa('');
      carregarCaixa();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível abrir o caixa.'));
    } finally {
      setSalvandoCaixa(false);
    }
  };

  const handleFecharCaixa = async () => {
    if (!window.confirm('Confirmar fechamento de caixa?')) return;
    setSalvandoCaixa(true);
    try {
      const resultado = await fecharCaixa(obsCaixa || undefined);
      setResumoFechamento(resultado.resumo);
      sucesso('Caixa fechado. Veja o resumo abaixo.');
      setObsCaixa('');
      carregarCaixa();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível fechar o caixa.'));
    } finally {
      setSalvandoCaixa(false);
    }
  };

  const handleMovimentoManual = async (tipo: 'sangria' | 'suprimento') => {
    if (!valorCaixaManual || valorCaixaManual <= 0) return;
    setSalvandoCaixa(true);
    try {
      await registrarMovimentoCaixa({ tipo, valor: valorCaixaManual, descricao: descCaixaManual });
      sucesso(tipo === 'sangria' ? 'Sangria registrada.' : 'Suprimento registrado.');
      setValorCaixaManual(0);
      setDescCaixaManual('');
      carregarCaixa();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível registrar o movimento.'));
    } finally {
      setSalvandoCaixa(false);
    }
  };

  // --- handlers contas ---
  const handleSubmitConta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoConta(true);
    try {
      await criarConta(form);
      sucesso('Conta cadastrada.');
      setForm(contaVazia);
      carregarContas();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível cadastrar a conta.'));
    } finally {
      setSalvandoConta(false);
    }
  };

  const handleBaixar = async (id: number) => {
    try {
      await baixarConta(id);
      sucesso('Conta marcada como paga.');
      carregarContas();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível dar baixa na conta.'));
    }
  };

  return (
    <div>
      <h1>Financeiro</h1>

      {/* Abas */}
      <div className="abas">
        <button className={aba === 'caixa' ? 'ativo' : ''} onClick={() => setAba('caixa')}>
          Caixa
        </button>
        <button className={aba === 'contas' ? 'ativo' : ''} onClick={() => setAba('contas')}>
          Contas a pagar / receber
        </button>
      </div>

      {/* ======= ABA CAIXA ======= */}
      {aba === 'caixa' && (
        <div>
          {/* Status */}
          <div className={`status-caixa ${caixaAberto ? 'aberto' : 'fechado'}`}>
            {caixaAberto ? '🟢 Caixa aberto' : '🔴 Caixa fechado'}
          </div>

          {/* Resumo de hoje */}
          {resumoHoje && (
            <div className="cards-grid">
              <div className="card">
                <h2>Resumo de hoje</h2>
                <p>Entradas: <strong>R$ {resumoHoje.entradas.toFixed(2)}</strong></p>
                <p>Saídas: <strong>R$ {resumoHoje.saidas.toFixed(2)}</strong></p>
                <p>Saldo: <strong>R$ {resumoHoje.saldo.toFixed(2)}</strong></p>
              </div>
            </div>
          )}

          {/* Abertura */}
          {!caixaAberto && (
            <div className="form-card">
              <h2>Abrir caixa</h2>
              <div className="form-grid">
                <label>
                  Fundo de caixa (R$)
                  <input
                    type="number" step="0.01" min="0"
                    value={fundoCaixa}
                    onChange={(e) => setFundoCaixa(Number(e.target.value))}
                  />
                </label>
                <label>
                  Observação (opcional)
                  <input value={obsCaixa} onChange={(e) => setObsCaixa(e.target.value)} />
                </label>
              </div>
              <div className="form-acoes">
                <button onClick={handleAbrirCaixa} disabled={salvandoCaixa}>
                  {salvandoCaixa ? 'Abrindo...' : 'Abrir caixa'}
                </button>
              </div>
            </div>
          )}

          {/* Sangria / Suprimento — só quando caixa aberto */}
          {caixaAberto && (
            <div className="form-card">
              <h2>Sangria / Suprimento</h2>
              <div className="form-grid">
                <label>
                  Valor (R$)
                  <input
                    type="number" step="0.01" min="0"
                    value={valorCaixaManual}
                    onChange={(e) => setValorCaixaManual(Number(e.target.value))}
                  />
                </label>
                <label>
                  Descrição
                  <input value={descCaixaManual} onChange={(e) => setDescCaixaManual(e.target.value)} />
                </label>
              </div>
              <div className="form-acoes">
                <button onClick={() => handleMovimentoManual('suprimento')} disabled={salvandoCaixa}>
                  Suprimento (entrada)
                </button>
                <button className="botao-secundario" onClick={() => handleMovimentoManual('sangria')} disabled={salvandoCaixa}>
                  Sangria (retirada)
                </button>
              </div>
            </div>
          )}

          {/* Fechamento — só quando caixa aberto */}
          {caixaAberto && (
            <div className="form-card">
              <h2>Fechar caixa</h2>
              <div className="form-grid">
                <label>
                  Observação (opcional)
                  <input value={obsCaixa} onChange={(e) => setObsCaixa(e.target.value)} />
                </label>
              </div>
              <div className="form-acoes">
                <button className="botao-perigo" onClick={handleFecharCaixa} disabled={salvandoCaixa}>
                  {salvandoCaixa ? 'Fechando...' : 'Fechar caixa'}
                </button>
              </div>
            </div>
          )}

          {/* Resumo do fechamento */}
          {resumoFechamento && (
            <div className="form-card resumo-fechamento">
              <h2>Resumo do fechamento</h2>
              <table className="tabela">
                <tbody>
                  <tr><td>Fundo de caixa</td><td>R$ {resumoFechamento.fundo_caixa.toFixed(2)}</td></tr>
                  <tr><td>Total de vendas</td><td>R$ {resumoFechamento.total_vendas.toFixed(2)}</td></tr>
                  <tr><td>— Dinheiro</td><td>R$ {resumoFechamento.total_dinheiro.toFixed(2)}</td></tr>
                  <tr><td>— Cartão</td><td>R$ {resumoFechamento.total_cartao.toFixed(2)}</td></tr>
                  <tr><td>— Pix</td><td>R$ {resumoFechamento.total_pix.toFixed(2)}</td></tr>
                  <tr><td>Suprimentos</td><td>R$ {resumoFechamento.total_suprimentos.toFixed(2)}</td></tr>
                  <tr><td>Sangrias</td><td>− R$ {resumoFechamento.total_sangrias.toFixed(2)}</td></tr>
                  <tr className="total-row">
                    <td><strong>Saldo final</strong></td>
                    <td><strong>R$ {resumoFechamento.saldo_final.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Histórico de movimentos */}
          <h2>Movimentos de hoje</h2>
          {movimentos.length === 0 ? (
            <p className="estado-vazio">Nenhuma movimentação ainda.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Tipo</th>
                  <th>Forma</th>
                  <th>Valor</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {movimentos.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.data_hora).toLocaleTimeString('pt-BR')}</td>
                    <td>{m.tipo}</td>
                    <td>{m.forma_pagamento || '—'}</td>
                    <td>R$ {Number(m.valor).toFixed(2)}</td>
                    <td>{m.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======= ABA CONTAS ======= */}
      {aba === 'contas' && (
        <div>
          <form className="form-card" onSubmit={handleSubmitConta}>
            <h2>Nova conta a pagar / receber</h2>
            <div className="form-grid">
              <label>
                Tipo
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}>
                  <option value="pagar">A pagar</option>
                  <option value="receber">A receber</option>
                </select>
              </label>
              <label>
                Descrição
                <input value={form.descricao || ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
              </label>
              <label>
                Categoria
                <input value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required />
              </label>
              <label>
                Valor (R$)
                <input type="number" step="0.01"
                  value={form.valor ?? 0}
                  onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} required />
              </label>
              <label>
                Vencimento
                <input type="date" value={form.vencimento || ''}
                  onChange={(e) => setForm({ ...form, vencimento: e.target.value })} required />
              </label>
            </div>
            <div className="form-acoes">
              <button type="submit" disabled={salvandoConta}>
                {salvandoConta ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </form>

          <h2>Contas</h2>
          {contas.length === 0 ? (
            <p className="estado-vazio">Nenhuma conta cadastrada ainda.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Tipo</th><th>Descrição</th><th>Valor</th>
                  <th>Vencimento</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {contas.map((c) => (
                  <tr key={c.id}>
                    <td>{c.tipo === 'pagar' ? 'A pagar' : 'A receber'}</td>
                    <td>{c.descricao}</td>
                    <td>R$ {Number(c.valor).toFixed(2)}</td>
                    <td>{c.vencimento}</td>
                    <td className={c.status === 'atrasado' ? 'texto-alerta' : ''}>{c.status}</td>
                    <td>
                      {c.status !== 'pago' && (
                        <button onClick={() => handleBaixar(c.id)}>Marcar como pago</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};