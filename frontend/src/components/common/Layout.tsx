import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const itensMenu = [
  { to: '/', label: 'Início', papeis: null },
  { to: '/pdv', label: 'PDV', papeis: null },
  { to: '/produtos', label: 'Produtos', papeis: null },
  { to: '/estoque', label: 'Estoque', papeis: ['dono', 'gerente'] },
  { to: '/financeiro', label: 'Financeiro', papeis: ['dono', 'gerente'] },
  { to: '/relatorios', label: 'Relatórios', papeis: ['dono', 'gerente'] },
  { to: '/config', label: 'Configurações', papeis: ['dono'] },
] as const;

export const Layout: React.FC = () => {
  const { usuario, sair } = useAuth();

  const itensVisiveis = itensMenu.filter(
    (item) => !item.papeis || (usuario && (item.papeis as readonly string[]).includes(usuario.papel)),
  );

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">Meu Comércio</div>
        <nav>
          {itensVisiveis.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-item ativo' : 'nav-item')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-user">
          <div>
            <strong>{usuario?.nome}</strong>
            <span>{usuario?.papel}</span>
          </div>
          <button onClick={sair}>Sair</button>
        </div>
      </aside>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};
