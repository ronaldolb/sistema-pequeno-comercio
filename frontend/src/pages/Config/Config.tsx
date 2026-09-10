import React, { useEffect, useState } from 'react';
import { criarUsuario, desativarUsuario, listarUsuarios } from '../../services/usersService';
import { Usuario } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { mensagemErro } from '../../utils/erro';

const usuarioVazio = { nome: '', email: '', senha: '', papel: 'caixa' as const };

export const Config: React.FC = () => {
  const { sucesso, erro } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(usuarioVazio);
  const [salvando, setSalvando] = useState(false);

  const carregar = () => listarUsuarios().then(setUsuarios);

  useEffect(() => {
    carregar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await criarUsuario(form);
      sucesso('Usuário criado.');
      setForm(usuarioVazio);
      carregar();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível criar o usuário.'));
    } finally {
      setSalvando(false);
    }
  };

  const handleDesativar = async (id: number) => {
    if (!confirm('Desativar o acesso deste usuário?')) return;
    try {
      await desativarUsuario(id);
      sucesso('Usuário desativado.');
      carregar();
    } catch (err) {
      erro(mensagemErro(err, 'Não foi possível desativar o usuário.'));
    }
  };

  return (
    <div>
      <h1>Configurações — Usuários e permissões</h1>
      <p>
        <strong>Dono</strong>: acesso total. <strong>Gerente</strong>: PDV, produtos, estoque, financeiro e
        relatórios. <strong>Caixa</strong>: apenas PDV, produtos e início.
      </p>

      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Novo usuário</h2>
        <div className="form-grid">
          <label>
            Nome
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Senha provisória
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              minLength={6}
              required
            />
          </label>
          <label>
            Papel
            <select value={form.papel} onChange={(e) => setForm({ ...form, papel: e.target.value as any })}>
              <option value="caixa">Caixa</option>
              <option value="gerente">Gerente</option>
              <option value="dono">Dono</option>
            </select>
          </label>
        </div>
        <div className="form-acoes">
          <button type="submit" disabled={salvando}>
            {salvando ? 'Criando...' : 'Criar usuário'}
          </button>
        </div>
      </form>

      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Papel</th>
            <th>Situação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.papel}</td>
              <td>{(u as any).ativo === false ? 'Inativo' : 'Ativo'}</td>
              <td>
                {(u as any).ativo !== false && <button onClick={() => handleDesativar(u.id)}>Desativar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
