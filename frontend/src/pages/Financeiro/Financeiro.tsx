import React, { useEffect, useState } from 'react';
import {
  baixarConta,
  Conta,
  criarConta,
  listarContas,
  listarMovimentosCaixa,
  MovimentoCaixa,
  registrarMovimentoCaixa,
  resumoCaixaHoje,
} from '../../services/financeiroService';
import { useToast } from '../../context/ToastContext';
import { mensagemErro } from '../../utils/erro';

const contaVazia: Partial<Conta> = { tipo: 'pagar', descricao: '', categoria: '', valor: 0, vencimento: '' };

export const Financeiro: React.FC = () => {
  const { sucesso, erro } = useToast();
  const [contas, setContas] = useState<Conta[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [resumo, setResumo] = useState<{ entradas: number; saidas: number; saldo: number } | null>(null);
  const [form, setForm] = useState<Partial<Conta>>(contaVazia);
  const [valorCaixa, setValorCaixa] = useState<number>(0);
  const [descricaoCaixa, setDescricaoCaixa] = useState('');
  const [salvandoConta, setSalvandoConta] = useState(false);
  const [salvandoCaixa, setSalvandoCaixa] = useState(false);

  const carregar = () => {
    listarContas().then(setContas);
    listarMovimentosCaixa().then(setMovimentos);
    resumoCaixaHoje().then(setResumo);
  };

  useEffect(carregar, []);

  const handleSubmitConta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoConta(true);
    try {
      await criarConta(form);
      sucesso('Conta cadastrada.');
      setForm(contaVazia);
      carregar();
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
      carregar();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível dar baixa na conta.'));
    }
  };

  const handleSangria = async () => {
    if (!valorCaixa) return;
    setSalvandoCaixa(true);
    try {
      await registrarMovimentoCaixa({ tipo: 'sangria', valor: valorCaixa, descricao: descricaoCaixa });
      sucesso('Sangria registrada.');
      setValorCaixa(0);
      setDescricaoCaixa('');
      carregar();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível registrar a sangria.'));
    } finally {
      setSalvandoCaixa(false);
    }
  };

  const handleSuprimento = async () => {
    if (!valorCaixa) return;
    setSalvandoCaixa(true);
    try {
      await registrarMovimentoCaixa({ tipo: 'suprimento', valor: valorCaixa, descricao: descricaoCaixa });
      sucesso('Suprimento registrado.');
      setValorCaixa(0);
      setDescricaoCaixa('');
      carregar();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível registrar o suprimento.'));
    } finally {
      setSalvandoCaixa(false);
    }
  };

  return (
    <div>
      <h1>Financeiro</h1>

      {resumo && (
        <div className="cards-grid">
          <div className="card">
            <h2>Caixa de hoje</h2>
            <p>Entradas: R$ {resumo.entradas.toFixed(2)}</p>
            <p>Saídas: R$ {resumo.saidas.toFixed(2)}</p>
            <p>
              <strong>Saldo: R$ {resumo.saldo.toFixed(2)}</strong>
            </p>
          </div>

          <div className="card">
            <h2>Sangria / Suprimento</h2>
            <label>
              Valor (R$)
              <input type="number" step="0.01" value={valorCaixa} onChange={(e) => setValorCaixa(Number(e.target.value))} />
            </label>
            <label>
              Descrição
              <input value={descricaoCaixa} onChange={(e) => setDescricaoCaixa(e.target.value)} />
            </label>
            <div className="form-acoes">
              <button onClick={handleSuprimento} disabled={salvandoCaixa}>
                {salvandoCaixa ? 'Registrando...' : 'Suprimento (entrada)'}
              </button>
              <button className="botao-secundario" onClick={handleSangria} disabled={salvandoCaixa}>
                Sangria (retirada)
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmitConta}>
        <h2>Nova conta a pagar/receber</h2>
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
            <input
              type="number"
              step="0.01"
              value={form.valor ?? 0}
              onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Vencimento
            <input
              type="date"
              value={form.vencimento || ''}
              onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
              required
            />
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
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th></th>
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
                  {c.status !== 'pago' && <button onClick={() => handleBaixar(c.id)}>Marcar como pago</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Movimentos de caixa recentes</h2>
      {movimentos.length === 0 ? (
        <p className="estado-vazio">Nenhuma movimentação de caixa ainda.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {movimentos.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.data_hora).toLocaleString('pt-BR')}</td>
                <td>{m.tipo}</td>
                <td>R$ {Number(m.valor).toFixed(2)}</td>
                <td>{m.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
