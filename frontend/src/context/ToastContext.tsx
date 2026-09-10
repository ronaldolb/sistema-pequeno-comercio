import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

type TipoToast = 'sucesso' | 'erro';

type ToastItem = { id: number; tipo: TipoToast; mensagem: string };

type ToastContextType = {
  sucesso: (mensagem: string) => void;
  erro: (mensagem: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Notificações globais de sucesso/erro (canto superior direito), usadas em toda ação que
// hoje não dava nenhum retorno visual pro usuário (cadastrar, salvar, excluir...).
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const proximoId = useRef(1);

  const remover = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notificar = useCallback(
    (tipo: TipoToast, mensagem: string) => {
      const id = proximoId.current++;
      setToasts((prev) => [...prev, { id, tipo, mensagem }]);
      setTimeout(() => remover(id), 4000);
    },
    [remover],
  );

  const sucesso = useCallback((mensagem: string) => notificar('sucesso', mensagem), [notificar]);
  const erro = useCallback((mensagem: string) => notificar('erro', mensagem), [notificar]);

  return (
    <ToastContext.Provider value={{ sucesso, erro }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.tipo}`}
            onClick={() => remover(t.id)}
            role="status"
          >
            {t.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast precisa ser usado dentro de <ToastProvider>');
  return context;
}
